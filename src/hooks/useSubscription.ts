import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface SubscriptionData {
  subscribed: boolean;
  plan_id: string;
  subscription_end: string | null;
  stripe_customer_id: string | null;
}

export const PLANS = {
  free: {
    name: "Free",
    price_monthly: 0,
    price_yearly: 0,
    price_id_monthly: null,
    price_id_yearly: null,
    product_id: null,
  },
  basic: {
    name: "Basic",
    price_monthly: 9.99,
    price_yearly: 95.88, // 20% Rabatt
    price_id_monthly: "price_1SwKRw52lqSgjCzebwjNKzuN",
    price_id_yearly: null, // Kann später hinzugefügt werden
    product_id: "prod_Tu8jQ696XFDJQU",
  },
  pro: {
    name: "Pro",
    price_monthly: 19.99,
    price_yearly: 191.88,
    price_id_monthly: "price_1SwKSV52lqSgjCzehC6bwlVE",
    price_id_yearly: null,
    product_id: "prod_Tu8jsjz4Cr58aU",
  },
  business: {
    name: "Business",
    price_monthly: 49.99,
    price_yearly: 479.88,
    price_id_monthly: "price_1SwKUU52lqSgjCzeeUb4H2jI",
    price_id_yearly: null,
    product_id: "prod_Tu8mzwwj2k4GMu",
  },
} as const;

export type PlanId = keyof typeof PLANS;

export function useSubscription() {
  const { user, session } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSubscription = useCallback(async () => {
    if (!user || !session) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fnError } = await supabase.functions.invoke("check-subscription", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (fnError) throw fnError;

      setSubscription(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Fehler beim Laden des Abos";
      setError(message);
      if (import.meta.env.DEV) {
        console.error("Subscription check error:", err);
      }
      // Fallback to free plan
      setSubscription({
        subscribed: false,
        plan_id: "free",
        subscription_end: null,
        stripe_customer_id: null,
      });
    } finally {
      setLoading(false);
    }
  }, [user, session]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  const plan = (subscription?.plan_id as PlanId) || "free";
  const isPro = ["pro", "business"].includes(plan);
  const isBusiness = plan === "business";
  const isActive = subscription?.subscribed || plan === "free";

  return {
    subscription,
    loading,
    error,
    plan,
    isPro,
    isBusiness,
    isActive,
    checkSubscription,
  };
}

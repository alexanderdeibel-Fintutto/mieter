import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface SubscriptionData {
  subscribed: boolean;
  plan_id: string;
  subscription_end: string | null;
  stripe_customer_id: string | null;
}

// MieterApp Stripe Price IDs
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
    price_id_monthly: "price_1SsEqV52lqSgjCzeKuUQGBOE",
    price_id_yearly: null, // Kann später hinzugefügt werden
    product_id: null, // Will be determined from subscription
  },
  pro: {
    name: "Pro",
    price_monthly: 19.99,
    price_yearly: 191.88,
    price_id_monthly: "price_1SsEr552lqSgjCzeBvWBTzKS",
    price_id_yearly: null,
    product_id: null, // Will be determined from subscription
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
  const isPro = plan === "pro";
  const isBasic = plan === "basic";
  const isActive = subscription?.subscribed || plan === "free";

  return {
    subscription,
    loading,
    error,
    plan,
    isPro,
    isBasic,
    isActive,
    checkSubscription,
  };
}

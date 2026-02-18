import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const ALLOWED_ORIGINS = [
  'https://wohn-held.lovable.app',
  'https://id-preview--57b539e6-9ace-40cf-bbc1-b1d23a708539.lovable.app',
  'http://localhost:5173',
  'http://localhost:8080',
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// MieterApp Price ID to plan mapping
const PRICE_TO_PLAN: Record<string, string> = {
  "price_1SsEqV52lqSgjCzeKuUQGBOE": "basic",
  "price_1SsEr552lqSgjCzeBvWBTzKS": "pro",
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, returning free plan");
      return new Response(JSON.stringify({ 
        subscribed: false, 
        plan_id: "free",
        subscription_end: null 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    const hasActiveSub = subscriptions.data.length > 0;
    let planId = "free";
    let subscriptionEnd = null;
    let stripeSubscriptionId = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      stripeSubscriptionId = subscription.id;
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      
      // Get plan from price ID
      const priceId = subscription.items.data[0].price.id;
      planId = PRICE_TO_PLAN[priceId] || "free";
      
      logStep("Active subscription found", { 
        subscriptionId: subscription.id, 
        priceId,
        planId,
        endDate: subscriptionEnd 
      });

      // Sync to database
      const { error: upsertError } = await supabaseClient
        .from("user_subscriptions")
        .upsert({
          user_id: user.id,
          stripe_customer_id: customerId,
          stripe_subscription_id: stripeSubscriptionId,
          app_id: "mieter",
          plan_id: planId,
          status: "active",
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: subscriptionEnd,
          cancel_at_period_end: subscription.cancel_at_period_end,
        }, {
          onConflict: "user_id,app_id"
        });
      
      if (upsertError) {
        logStep("Warning: Failed to sync subscription to database", { error: upsertError.message });
      }

      // Process referral reward if user was referred and just subscribed
      try {
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("referred_by")
          .eq("user_id", user.id)
          .single();

        if (profile?.referred_by) {
          const { data: existingReward } = await supabaseClient
            .from("referral_rewards")
            .select("id")
            .eq("referred_user_id", user.id)
            .maybeSingle();

          if (!existingReward) {
            logStep("Processing referral reward for new subscriber");
            // Find referrer
            const { data: refCode } = await supabaseClient
              .from("referral_codes")
              .select("user_id")
              .eq("code", profile.referred_by)
              .single();

            if (refCode) {
              const CREDITS_PER_REFERRAL = 2;
              const TRIAL_DAYS = 7;

              // Grant referrer credits
              const { data: referrerCredits } = await supabaseClient
                .from("user_credits")
                .select("balance, total_earned")
                .eq("user_id", refCode.user_id)
                .maybeSingle();

              if (referrerCredits) {
                const newBal = referrerCredits.balance + CREDITS_PER_REFERRAL;
                await supabaseClient
                  .from("user_credits")
                  .update({ balance: newBal, total_earned: referrerCredits.total_earned + CREDITS_PER_REFERRAL })
                  .eq("user_id", refCode.user_id);
                await supabaseClient.from("credit_transactions").insert({
                  user_id: refCode.user_id,
                  amount: CREDITS_PER_REFERRAL,
                  balance_after: newBal,
                  transaction_type: "referral_reward",
                  description: "Empfehlungsbonus: Nutzer hat ein Abo abgeschlossen",
                });
              } else {
                await supabaseClient.from("user_credits").insert({
                  user_id: refCode.user_id,
                  balance: CREDITS_PER_REFERRAL,
                  total_earned: CREDITS_PER_REFERRAL,
                });
                await supabaseClient.from("credit_transactions").insert({
                  user_id: refCode.user_id,
                  amount: CREDITS_PER_REFERRAL,
                  balance_after: CREDITS_PER_REFERRAL,
                  transaction_type: "referral_reward",
                  description: "Empfehlungsbonus: Nutzer hat ein Abo abgeschlossen",
                });
              }

              // Record reward
              await supabaseClient.from("referral_rewards").insert({
                referrer_user_id: refCode.user_id,
                referred_user_id: user.id,
                referral_code: profile.referred_by,
                reward_type: "credits",
                reward_amount: CREDITS_PER_REFERRAL,
                status: "granted",
                granted_at: new Date().toISOString(),
              });
              logStep("Referral reward granted", { referrerId: refCode.user_id, credits: CREDITS_PER_REFERRAL });
            }
          }
        }
      } catch (refErr) {
        logStep("Warning: Referral reward processing failed", { error: String(refErr) });
      }
    } else {
      logStep("No active subscription found");
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      plan_id: planId,
      subscription_end: subscriptionEnd,
      stripe_customer_id: customerId,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

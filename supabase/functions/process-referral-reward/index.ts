import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[REFERRAL-REWARD] ${step}${detailsStr}`);
};

const CREDITS_PER_REFERRAL = 2;
const REFERRED_USER_TRIAL_DAYS = 7;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Check if this user was referred (has referred_by in profile)
    const { data: profile } = await supabase
      .from("profiles")
      .select("referred_by")
      .eq("user_id", user.id)
      .single();

    if (!profile?.referred_by) {
      logStep("User was not referred, skipping");
      return new Response(JSON.stringify({ rewarded: false, reason: "not_referred" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const referralCode = profile.referred_by;
    logStep("User was referred", { referralCode });

    // Check if reward was already granted for this referred user
    const { data: existingReward } = await supabase
      .from("referral_rewards")
      .select("id, status")
      .eq("referred_user_id", user.id)
      .maybeSingle();

    if (existingReward) {
      logStep("Reward already processed", { status: existingReward.status });
      return new Response(JSON.stringify({ rewarded: false, reason: "already_processed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find the referrer
    const { data: refCode } = await supabase
      .from("referral_codes")
      .select("user_id")
      .eq("code", referralCode)
      .single();

    if (!refCode) {
      logStep("Referral code not found");
      return new Response(JSON.stringify({ rewarded: false, reason: "code_not_found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const referrerUserId = refCode.user_id;
    logStep("Found referrer", { referrerUserId });

    // === REWARD 1: Give referrer 2 credits ===
    // Get or create referrer's credit balance
    const { data: referrerCredits } = await supabase
      .from("user_credits")
      .select("balance, total_earned")
      .eq("user_id", referrerUserId)
      .maybeSingle();

    if (referrerCredits) {
      const newBalance = referrerCredits.balance + CREDITS_PER_REFERRAL;
      await supabase
        .from("user_credits")
        .update({
          balance: newBalance,
          total_earned: referrerCredits.total_earned + CREDITS_PER_REFERRAL,
        })
        .eq("user_id", referrerUserId);

      // Log transaction
      await supabase.from("credit_transactions").insert({
        user_id: referrerUserId,
        amount: CREDITS_PER_REFERRAL,
        balance_after: newBalance,
        transaction_type: "referral_reward",
        description: `Empfehlungsbonus: Nutzer hat ein Abo abgeschlossen`,
      });
      logStep("Credited referrer", { credits: CREDITS_PER_REFERRAL, newBalance });
    } else {
      // Create credits for referrer
      await supabase.from("user_credits").insert({
        user_id: referrerUserId,
        balance: CREDITS_PER_REFERRAL,
        total_earned: CREDITS_PER_REFERRAL,
      });
      await supabase.from("credit_transactions").insert({
        user_id: referrerUserId,
        amount: CREDITS_PER_REFERRAL,
        balance_after: CREDITS_PER_REFERRAL,
        transaction_type: "referral_reward",
        description: `Empfehlungsbonus: Nutzer hat ein Abo abgeschlossen`,
      });
      logStep("Created credits for referrer", { credits: CREDITS_PER_REFERRAL });
    }

    // === REWARD 2: Give referred user 7 days Pro trial ===
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + REFERRED_USER_TRIAL_DAYS);

    await supabase.from("user_subscriptions").upsert({
      user_id: user.id,
      app_id: "mieter",
      plan_id: "pro",
      status: "trial",
      current_period_start: new Date().toISOString(),
      current_period_end: trialEnd.toISOString(),
      cancel_at_period_end: true,
    }, { onConflict: "user_id,app_id" });

    logStep("Granted Pro trial to referred user", { trialEnd: trialEnd.toISOString() });

    // === Record the reward ===
    await supabase.from("referral_rewards").insert({
      referrer_user_id: referrerUserId,
      referred_user_id: user.id,
      referral_code: referralCode,
      reward_type: "credits",
      reward_amount: CREDITS_PER_REFERRAL,
      status: "granted",
      granted_at: new Date().toISOString(),
    });

    logStep("Reward recorded successfully");

    return new Response(JSON.stringify({
      rewarded: true,
      referrer_credits: CREDITS_PER_REFERRAL,
      referred_trial_days: REFERRED_USER_TRIAL_DAYS,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

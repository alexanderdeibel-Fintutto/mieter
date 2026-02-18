import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map of app IDs to their Stripe product lookup keys / known price IDs
const APP_CONFIG: Record<string, { productName: string }> = {
  vermietify: { productName: "Vermietify" },
  hausmeister: { productName: "HausmeisterPro" },
  mieter: { productName: "Mieter" },
  zaehler: { productName: "Zähler" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe not configured");
    }

    // Fetch all active prices with product details from Stripe
    const response = await fetch(
      "https://api.stripe.com/v1/prices?active=true&limit=100&expand[]=data.product",
      {
        headers: {
          Authorization: `Bearer ${stripeKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Stripe API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Group prices by product and extract relevant info
    const appPrices: Record<string, {
      plans: { name: string; price: number; currency: string; interval: string; priceId: string }[];
      startingPrice: number | null;
    }> = {};

    for (const price of data.data) {
      const product = price.product;
      if (!product || typeof product === "string" || !product.active) continue;

      const productName = product.name || "";
      const productMetadata = product.metadata || {};
      const appId = productMetadata.app_id || null;

      // Try to match by app_id metadata or product name
      let matchedApp: string | null = null;
      
      if (appId && APP_CONFIG[appId]) {
        matchedApp = appId;
      } else {
        for (const [key, config] of Object.entries(APP_CONFIG)) {
          if (productName.toLowerCase().includes(config.productName.toLowerCase())) {
            matchedApp = key;
            break;
          }
        }
      }

      if (!matchedApp) continue;

      if (!appPrices[matchedApp]) {
        appPrices[matchedApp] = { plans: [], startingPrice: null };
      }

      const unitAmount = price.unit_amount ? price.unit_amount / 100 : 0;
      const interval = price.recurring?.interval || "month";
      const planName = price.nickname || product.name || "Plan";

      appPrices[matchedApp].plans.push({
        name: planName,
        price: unitAmount,
        currency: price.currency || "eur",
        interval,
        priceId: price.id,
      });

      // Track lowest monthly price as starting price
      if (interval === "month") {
        if (appPrices[matchedApp].startingPrice === null || unitAmount < appPrices[matchedApp].startingPrice) {
          appPrices[matchedApp].startingPrice = unitAmount;
        }
      }
    }

    return new Response(JSON.stringify({ success: true, data: appPrices }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching ecosystem prices:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Service temporarily unavailable" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

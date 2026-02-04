import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AutocompleteRequest {
  action: "autocomplete" | "geocode" | "validate";
  input?: string;
  placeId?: string;
  address?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) {
      throw new Error("GOOGLE_MAPS_API_KEY is not configured");
    }

    const { action, input, placeId, address }: AutocompleteRequest = await req.json();

    let result;

    switch (action) {
      case "autocomplete": {
        if (!input || input.length < 3) {
          return new Response(JSON.stringify({ predictions: [] }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const autocompleteUrl = new URL(
          "https://maps.googleapis.com/maps/api/place/autocomplete/json"
        );
        autocompleteUrl.searchParams.set("input", input);
        autocompleteUrl.searchParams.set("key", apiKey);
        autocompleteUrl.searchParams.set("types", "address");
        autocompleteUrl.searchParams.set("components", "country:de|country:at|country:ch");
        autocompleteUrl.searchParams.set("language", "de");

        const autocompleteRes = await fetch(autocompleteUrl.toString());
        const autocompleteData = await autocompleteRes.json();

        if (autocompleteData.status !== "OK" && autocompleteData.status !== "ZERO_RESULTS") {
          console.error("Autocomplete error:", autocompleteData);
          throw new Error(`Google Places API error: ${autocompleteData.status}`);
        }

        result = {
          predictions: autocompleteData.predictions?.map((p: any) => ({
            placeId: p.place_id,
            description: p.description,
            mainText: p.structured_formatting?.main_text,
            secondaryText: p.structured_formatting?.secondary_text,
          })) || [],
        };
        break;
      }

      case "geocode": {
        if (!placeId) {
          throw new Error("placeId is required for geocode action");
        }

        const detailsUrl = new URL(
          "https://maps.googleapis.com/maps/api/place/details/json"
        );
        detailsUrl.searchParams.set("place_id", placeId);
        detailsUrl.searchParams.set("key", apiKey);
        detailsUrl.searchParams.set("fields", "address_components,formatted_address,geometry,name");
        detailsUrl.searchParams.set("language", "de");

        const detailsRes = await fetch(detailsUrl.toString());
        const detailsData = await detailsRes.json();

        if (detailsData.status !== "OK") {
          console.error("Place details error:", detailsData);
          throw new Error(`Google Places API error: ${detailsData.status}`);
        }

        const place = detailsData.result;
        const components = place.address_components || [];

        const getComponent = (types: string[]) => {
          const comp = components.find((c: any) => 
            types.some(t => c.types.includes(t))
          );
          return comp?.long_name || "";
        };

        result = {
          valid: true,
          formattedAddress: place.formatted_address,
          name: place.name,
          streetNumber: getComponent(["street_number"]),
          street: getComponent(["route"]),
          city: getComponent(["locality", "political"]),
          postalCode: getComponent(["postal_code"]),
          country: getComponent(["country"]),
          countryCode: components.find((c: any) => c.types.includes("country"))?.short_name || "DE",
          latitude: place.geometry?.location?.lat,
          longitude: place.geometry?.location?.lng,
        };
        break;
      }

      case "validate": {
        if (!address) {
          throw new Error("address is required for validate action");
        }

        const geocodeUrl = new URL(
          "https://maps.googleapis.com/maps/api/geocode/json"
        );
        geocodeUrl.searchParams.set("address", address);
        geocodeUrl.searchParams.set("key", apiKey);
        geocodeUrl.searchParams.set("language", "de");
        geocodeUrl.searchParams.set("region", "de");

        const geocodeRes = await fetch(geocodeUrl.toString());
        const geocodeData = await geocodeRes.json();

        if (geocodeData.status === "ZERO_RESULTS") {
          result = { valid: false, message: "Adresse nicht gefunden" };
          break;
        }

        if (geocodeData.status !== "OK") {
          throw new Error(`Geocoding API error: ${geocodeData.status}`);
        }

        const firstResult = geocodeData.results[0];
        const isStreetAddress = firstResult.types.includes("street_address") || 
                                 firstResult.types.includes("premise");

        result = {
          valid: isStreetAddress,
          message: isStreetAddress ? "Gültige Adresse" : "Bitte geben Sie eine vollständige Straßenadresse an",
          formattedAddress: firstResult.formatted_address,
          latitude: firstResult.geometry?.location?.lat,
          longitude: firstResult.geometry?.location?.lng,
        };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Google Maps function error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
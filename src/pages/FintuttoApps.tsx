import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconBadge } from "@/components/ui/IconBadge";
import { ShimmerSkeleton } from "@/components/ui/ShimmerSkeleton";
import { 
  Building2, Wrench, Home, Gauge, 
  ExternalLink, Share2, ChevronRight, Sparkles, Star, Copy, Check
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useReferralCode } from "@/hooks/useReferralCode";
import { useState } from "react";

interface AppPlan {
  name: string;
  price: number;
  currency: string;
  interval: string;
  priceId: string;
}

interface AppPriceData {
  plans: AppPlan[];
  startingPrice: number | null;
}

const APPS = [
  {
    id: "vermietify",
    name: "Vermietify",
    subtitle: "Immobilienverwaltung",
    description: "Professionelle Verwaltung für Vermieter – Mietverträge, Nebenkostenabrechnungen und Objektverwaltung in einer App.",
    features: ["Multi-Objekt Verwaltung", "Mieterkommunikation", "Nebenkostenabrechnung", "Dokumentenmanagement"],
    url: "https://vermietify.vercel.app",
    icon: Building2,
    color: "primary" as const,
    gradient: "from-violet-600 to-indigo-600",
    targetAudience: "Für Vermieter & Hausverwaltungen",
  },
  {
    id: "hausmeister",
    name: "HausmeisterPro",
    subtitle: "Facility Management",
    description: "Aufgaben, Rundgänge und Wartungsarbeiten digital koordinieren – für Hausmeister und Facility Manager.",
    features: ["Aufgabenverwaltung", "Wartungsprotokolle", "Rundgang-Checklisten", "Foto-Dokumentation"],
    url: "https://hausmeister-pro.vercel.app",
    icon: Wrench,
    color: "coral" as const,
    gradient: "from-orange-500 to-red-500",
    targetAudience: "Für Hausmeister & Facility Manager",
  },
  {
    id: "zaehler",
    name: "Fintutto Zähler",
    subtitle: "Digitale Zählerablesung",
    description: "Zählerstände per KI-Foto erfassen, Verbrauchsdaten analysieren und Ablesungen für alle Einheiten verwalten.",
    features: ["KI-Foto-Ablesung", "Verbrauchsanalyse", "CSV/Excel Import", "Gebäudestruktur"],
    url: "https://ablesung.vercel.app",
    icon: Gauge,
    color: "mint" as const,
    gradient: "from-emerald-500 to-teal-500",
    targetAudience: "Für Verwalter & Eigentümer",
  },
  {
    id: "mieter",
    name: "Wohn-Held",
    subtitle: "Mieter-Portal",
    description: "Ihr digitales Zuhause – Mietzahlungen, Mängelmeldungen und direkte Kommunikation mit der Hausverwaltung.",
    features: ["Mietübersicht", "Mängelmeldung", "Chat mit Verwaltung", "Dokumentenzugriff"],
    url: "https://ft-mieter.lovable.app",
    icon: Home,
    color: "sky" as const,
    gradient: "from-sky-500 to-blue-500",
    targetAudience: "Für Mieter",
    isCurrent: true,
  },
];

function useEcosystemPrices() {
  return useQuery({
    queryKey: ["ecosystem-prices"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-ecosystem-prices");
      if (error) throw error;
      return data?.data as Record<string, AppPriceData> | undefined;
    },
    staleTime: 1000 * 60 * 30, // 30 min cache
    retry: 1,
  });
}

function formatPrice(price: number, currency: string = "eur") {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
  }).format(price);
}

function buildReferralUrl(appUrl: string, appId: string, referralCode: string | null) {
  const url = new URL(appUrl);
  if (referralCode) {
    url.searchParams.set("ref", referralCode);
    url.searchParams.set("app", appId);
  }
  return url.toString();
}

function handleShare(app: typeof APPS[0], referralCode: string | null) {
  const shareUrl = buildReferralUrl(app.url, app.id, referralCode);
  const text = `Schau dir ${app.name} an – ${app.subtitle} von Fintutto! 🏠`;

  if (navigator.share) {
    navigator.share({ title: app.name, text, url: shareUrl }).catch(() => {});
  } else {
    navigator.clipboard.writeText(`${text}\n${shareUrl}`);
    toast.success("Link kopiert!", { description: "Dein persönlicher Einladungslink wurde kopiert." });
  }
}

export default function FintuttoApps() {
  const { data: prices, isLoading: pricesLoading } = useEcosystemPrices();
  const { data: referralCode } = useReferralCode();
  const [copiedApp, setCopiedApp] = useState<string | null>(null);
  return (
    <MobileLayout>
      <PageHeader title="Fintutto Ökosystem" subtitle="Alle Apps für Ihre Immobilien" />

      <div className="px-4 -mt-2 space-y-4 pb-6">
        {/* Hero Intro */}
        <AnimatedCard delay={0} accentColor="primary">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white/90">Das Fintutto Ökosystem</p>
                <p className="text-xs text-white/50">4 Apps – eine Plattform</p>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Vernetzen Sie Vermieter, Hausmeister und Mieter – mit unseren spezialisierten Apps für jeden Bereich der Gebäudeverwaltung.
            </p>
          </CardContent>
        </AnimatedCard>

        {/* App Cards */}
        {APPS.map((app, index) => {
          const appPrices = prices?.[app.id];
          const Icon = app.icon;

          return (
            <AnimatedCard key={app.id} delay={(index + 1) * 100} accentColor={app.color}>
              <CardContent className="p-0">
                {/* Header with gradient accent */}
                <div className={`relative overflow-hidden rounded-t-xl p-5 pb-4`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-[0.08]`} />
                  <div className="relative flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <IconBadge icon={Icon} variant={app.color} size="lg" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-white/90">{app.name}</h3>
                          {app.isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-success/15 text-success text-[10px] font-semibold uppercase tracking-wide">
                              Aktiv
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white/50">{app.subtitle}</p>
                      </div>
                    </div>
                  </div>

                  {/* Target Audience Badge */}
                  <div className="mt-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.06] text-xs text-white/60">
                      <Star className="h-3 w-3" />
                      {app.targetAudience}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="px-5 py-3">
                  <p className="text-sm text-white/60 leading-relaxed">{app.description}</p>
                </div>

                {/* Features */}
                <div className="px-5 pb-3">
                  <div className="grid grid-cols-2 gap-1.5">
                    {app.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-1.5 text-xs text-white/50">
                        <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${app.gradient}`} />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div className="px-5 py-3 border-t border-white/[0.06]">
                  {pricesLoading ? (
                    <ShimmerSkeleton className="h-5 w-32" />
                  ) : appPrices?.startingPrice != null ? (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs text-white/40">ab</span>
                      <span className="text-lg font-bold text-white/90">
                        {formatPrice(appPrices.startingPrice, appPrices.plans[0]?.currency)}
                      </span>
                      <span className="text-xs text-white/40">/ Monat</span>
                    </div>
                  ) : appPrices?.plans && appPrices.plans.length > 0 ? (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs text-white/40">ab</span>
                      <span className="text-lg font-bold text-white/90">
                        {formatPrice(Math.min(...appPrices.plans.map(p => p.price)), appPrices.plans[0]?.currency)}
                      </span>
                      <span className="text-xs text-white/40">
                        / {appPrices.plans[0]?.interval === "year" ? "Jahr" : "Monat"}
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-white/40 italic">Kostenlos testen</p>
                  )}

                  {appPrices?.plans && appPrices.plans.length > 1 && (
                    <p className="text-[10px] text-white/30 mt-0.5">
                      {appPrices.plans.length} Pläne verfügbar
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="px-5 pb-5 flex gap-2">
                  {app.isCurrent ? (
                    <div className="flex-1 text-center py-2 rounded-xl bg-success/10 text-success text-sm font-medium">
                      ✓ Sie nutzen diese App
                    </div>
                  ) : (
                    <a href={app.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button 
                        variant="default" 
                        className="w-full group"
                        size="sm"
                      >
                        Jetzt entdecken
                        <ExternalLink className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                      </Button>
                    </a>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/50 hover:text-white hover:bg-white/10"
                    onClick={() => handleShare(app, referralCode ?? null)}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </AnimatedCard>
          );
        })}

        {/* Footer CTA */}
        <AnimatedCard delay={600}>
          <CardContent className="p-5 text-center">
            <p className="text-sm text-white/60 mb-1">
              Alle Fintutto Apps teilen eine gemeinsame Plattform.
            </p>
            <p className="text-xs text-white/40">
              Ihr Account funktioniert in allen Apps – einfach anmelden und loslegen.
            </p>
          </CardContent>
        </AnimatedCard>
      </div>
    </MobileLayout>
  );
}

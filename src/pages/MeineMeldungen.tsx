import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { IconBadge } from "@/components/ui/IconBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ShimmerSkeleton } from "@/components/ui/ShimmerSkeleton";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Plus,
  Droplet,
  Zap,
  Flame,
  Wind,
  DoorOpen,
  AlertTriangle,
  HelpCircle,
  Clock,
  CheckCircle2,
  Wrench,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Issue {
  id: string;
  category: string;
  description: string;
  priority: string;
  status: string;
  image_url: string | null;
  created_at: string;
}

const categoryConfig: Record<string, { label: string; icon: LucideIcon; color: "primary" | "secondary" | "mint" | "coral" | "sky" | "amber" | "warning" | "info" }> = {
  sanitaer: { label: "Sanitär", icon: Droplet, color: "sky" },
  elektrik: { label: "Elektrik", icon: Zap, color: "amber" },
  heizung: { label: "Heizung", icon: Flame, color: "coral" },
  fenster_tueren: { label: "Fenster & Türen", icon: DoorOpen, color: "mint" },
  wasserschaden: { label: "Wasserschaden", icon: AlertTriangle, color: "info" },
  schimmel: { label: "Schimmel", icon: Wind, color: "secondary" },
  sonstiges: { label: "Sonstiges", icon: HelpCircle, color: "primary" },
};

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "error" | "info" | "neutral"; icon: LucideIcon }> = {
  offen: { label: "Offen", variant: "warning", icon: Clock },
  in_bearbeitung: { label: "In Bearbeitung", variant: "info", icon: Wrench },
  erledigt: { label: "Erledigt", variant: "success", icon: CheckCircle2 },
};

const priorityLabels: Record<string, { label: string; color: string }> = {
  niedrig: { label: "Niedrig", color: "bg-success" },
  mittel: { label: "Mittel", color: "bg-warning" },
  hoch: { label: "Hoch", color: "bg-coral" },
  notfall: { label: "Notfall", color: "bg-destructive" },
};

export default function MeineMeldungen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIssues() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("issues")
          .select("id, category, description, priority, status, image_url, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setIssues(data || []);
      } catch (err) {
        if (import.meta.env.DEV) console.error("Error fetching issues:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchIssues();
  }, [user]);

  return (
    <MobileLayout showNav={false}>
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-coral opacity-95" />
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="relative px-4 pt-12 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="text-white hover:bg-white/10 p-2 rounded-xl transition-colors -ml-2">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">Meine Meldungen</h1>
                <p className="text-white/80 text-sm">
                  {loading ? "Laden..." : `${issues.length} Meldung${issues.length !== 1 ? "en" : ""}`}
                </p>
              </div>
            </div>
            <Link to="/mangel-melden">
              <Button size="sm" variant="secondary" className="gap-1.5 shadow-lg">
                <Plus className="h-4 w-4" />
                Neu
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3 pb-8">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <AnimatedCard key={i} delay={i * 100}>
              <CardContent className="p-4">
                <ShimmerSkeleton className="h-5 w-32 mb-2" />
                <ShimmerSkeleton className="h-4 w-full mb-1" />
                <ShimmerSkeleton className="h-4 w-2/3" />
              </CardContent>
            </AnimatedCard>
          ))
        ) : issues.length === 0 ? (
          <EmptyState
            title="Keine Meldungen"
            description="Sie haben noch keine Mängel gemeldet."
            actionLabel="Mangel melden"
            onAction={() => navigate("/mangel-melden")}
          />
        ) : (
          issues.map((issue, index) => {
            const cat = categoryConfig[issue.category] || categoryConfig.sonstiges;
            const stat = statusConfig[issue.status] || statusConfig.offen;
            const prio = priorityLabels[issue.priority] || priorityLabels.mittel;
            const CatIcon = cat.icon;

            return (
              <AnimatedCard key={issue.id} delay={index * 60}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <IconBadge icon={CatIcon} variant={cat.color} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{cat.label}</span>
                        <StatusBadge status={stat.variant} label={stat.label} />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {issue.description}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className={cn("w-2.5 h-2.5 rounded-full", prio.color)} />
                          <span className="text-xs text-muted-foreground">{prio.label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(issue.created_at), "dd. MMM yyyy", { locale: de })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {issue.image_url && (
                    <div className="mt-3 rounded-lg overflow-hidden">
                      <img
                        src={issue.image_url}
                        alt="Mangel-Foto"
                        className="w-full h-32 object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                </CardContent>
              </AnimatedCard>
            );
          })
        )}
      </div>
    </MobileLayout>
  );
}

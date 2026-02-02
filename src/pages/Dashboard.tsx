import { useAuth } from "@/contexts/AuthContext";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { IconBadge } from "@/components/ui/IconBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Euro, 
  AlertTriangle, 
  Gauge, 
  Wrench,
  MessageCircle,
  ChevronRight,
  Calendar
} from "lucide-react";
import { Link } from "react-router-dom";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Guten Morgen";
  if (hour < 18) return "Guten Tag";
  return "Guten Abend";
}

function getDaysUntilDue(dueDateStr: string): number {
  const [day, month, year] = dueDateStr.split('.').map(Number);
  const dueDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = dueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export default function Dashboard() {
  const { user } = useAuth();
  const userName = user?.user_metadata?.name?.split(' ')[0] || "Mieter";

  // Mock data - will be replaced with real data from Supabase
  const mockData = {
    nextRent: {
      amount: 850.00,
      dueDate: "01.03.2026",
    },
    openIssues: 2,
    lastMessages: [
      { id: 1, from: "Hausverwaltung", preview: "Ihre Nebenkostenabrechnung ist...", time: "Vor 2 Std.", unread: true },
    ],
  };

  const daysUntilDue = getDaysUntilDue(mockData.nextRent.dueDate);
  const progressToPayday = Math.max(0, Math.min(100, ((30 - daysUntilDue) / 30) * 100));

  return (
    <MobileLayout>
      {/* Hero Header with animated gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-95" />
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="relative px-4 pt-12 pb-10">
          <div className="flex items-center gap-4">
            {/* Avatar with gradient ring */}
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center border-2 border-white/30 shadow-lg">
              <span className="text-2xl font-bold text-white">{userName.charAt(0)}</span>
            </div>
            <div>
              <p className="text-white/70 text-sm">{getGreeting()}</p>
              <h1 className="text-2xl font-bold text-white">
                {userName}!
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-6 space-y-4 pb-4">
        {/* Next Rent Card with Progress Ring */}
        <AnimatedCard delay={0} accentColor="primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground flex items-center gap-2">
              <IconBadge icon={Euro} variant="primary" size="sm" />
              Nächste Mietzahlung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <ProgressRing 
                  progress={progressToPayday} 
                  size={56}
                  strokeWidth={5}
                  variant={daysUntilDue <= 5 ? "warning" : "primary"}
                  showLabel={false}
                />
                <div>
                  <p className="text-3xl font-bold text-foreground">
                    {mockData.nextRent.amount.toFixed(2)} €
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {daysUntilDue > 0 ? `In ${daysUntilDue} Tagen` : "Heute fällig"}
                    </p>
                  </div>
                </div>
              </div>
              <Link to="/finanzen">
                <Button variant="ghost" size="sm" className="group">
                  Details
                  <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Open Issues Card */}
        <AnimatedCard delay={100} accentColor="coral">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground flex items-center gap-2">
              <IconBadge icon={AlertTriangle} variant="warning" size="sm" />
              Offene Meldungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-warning/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-warning">{mockData.openIssues}</span>
                </div>
                <div>
                  <p className="font-medium">Meldungen offen</p>
                  <StatusBadge status="warning" label="In Bearbeitung" />
                </div>
              </div>
              <Link to="/meine-meldungen">
                <Button variant="ghost" size="sm" className="group">
                  Ansehen
                  <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Quick Actions with colorful icons */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1 uppercase tracking-wide">
            Schnellzugriff
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/zaehler-ablesen">
              <AnimatedCard delay={200} accentColor="mint" className="h-full">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-2xl gradient-mint flex items-center justify-center mb-3 shadow-lg shadow-mint/20 animate-float">
                    <Gauge className="h-7 w-7 text-white" />
                  </div>
                  <span className="text-sm font-semibold">Zähler ablesen</span>
                </CardContent>
              </AnimatedCard>
            </Link>
            <Link to="/mangel-melden">
              <AnimatedCard delay={250} accentColor="coral" className="h-full">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-2xl gradient-coral flex items-center justify-center mb-3 shadow-lg shadow-coral/20 animate-float" style={{ animationDelay: "0.5s" }}>
                    <Wrench className="h-7 w-7 text-white" />
                  </div>
                  <span className="text-sm font-semibold">Mangel melden</span>
                </CardContent>
              </AnimatedCard>
            </Link>
          </div>
        </div>

        {/* Last Messages with avatars */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1 uppercase tracking-wide">
            Letzte Nachrichten
          </h2>
          <AnimatedCard delay={300}>
            {mockData.lastMessages.map((msg) => (
              <Link key={msg.id} to="/chat">
                <CardContent className="p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors rounded-lg">
                  {/* Avatar with initials */}
                  <div className="w-12 h-12 rounded-2xl gradient-sky flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-white font-semibold text-sm">
                      {msg.from.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{msg.from}</p>
                      {msg.unread && (
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{msg.preview}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-muted-foreground">{msg.time}</span>
                    {msg.unread && (
                      <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white animate-bounce-in">
                        1
                      </span>
                    )}
                  </div>
                </CardContent>
              </Link>
            ))}
          </AnimatedCard>
        </div>
      </div>
    </MobileLayout>
  );
}

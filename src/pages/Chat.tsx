import { MobileLayout } from "@/components/layout/MobileLayout";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

// Avatar colors for different contact types
const avatarColors: Record<string, string> = {
  "Hausverwaltung": "gradient-primary",
  "Hausmeister": "gradient-coral",
  "Nachbar": "gradient-sky",
};

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

export default function Chat() {
  // Mock data - will be replaced with real data
  const conversations = [
    {
      id: 1,
      name: "Hausverwaltung",
      lastMessage: "Ihre Nebenkostenabrechnung ist fertig und kann abgeholt werden.",
      time: "Vor 2 Std.",
      unread: 1,
    },
    {
      id: 2,
      name: "Hausmeister",
      lastMessage: "Die Heizung wurde repariert. Funktioniert jetzt alles?",
      time: "Gestern",
      unread: 0,
    },
  ];

  return (
    <MobileLayout>
      {/* Header with animated gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-95" />
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="relative px-4 pt-12 pb-8">
          <h1 className="text-2xl font-bold text-white">Nachrichten</h1>
          <p className="text-white/80 mt-1">Kommunikation mit der Verwaltung</p>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-3 pb-4">
        {conversations.map((conv, index) => {
          const avatarClass = avatarColors[conv.name] || "gradient-sky";
          return (
            <Link key={conv.id} to={`/chat/${conv.id}`}>
              <AnimatedCard delay={index * 80} hover>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Colorful avatar with initials */}
                    <div className={`w-14 h-14 rounded-2xl ${avatarClass} flex items-center justify-center flex-shrink-0 shadow-lg relative`}>
                      <span className="text-white font-bold text-lg">
                        {getInitials(conv.name)}
                      </span>
                      {/* Online indicator */}
                      <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-success rounded-full border-2 border-card" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold">{conv.name}</h3>
                        <span className="text-xs text-muted-foreground">{conv.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {conv.unread > 0 && (
                        <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white animate-bounce-in shadow-lg shadow-primary/30">
                          {conv.unread}
                        </span>
                      )}
                      <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </CardContent>
              </AnimatedCard>
            </Link>
          );
        })}

        {conversations.length === 0 && (
          <AnimatedCard delay={0}>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl">💬</span>
              </div>
              <p className="text-muted-foreground">Keine Nachrichten vorhanden</p>
            </CardContent>
          </AnimatedCard>
        )}
      </div>
    </MobileLayout>
  );
}

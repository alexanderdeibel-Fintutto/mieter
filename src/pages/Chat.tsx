import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Wrench, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Chat() {
  // Mock data - will be replaced with real data
  const conversations = [
    {
      id: 1,
      name: "Hausverwaltung",
      icon: Building2,
      lastMessage: "Ihre Nebenkostenabrechnung ist fertig und kann abgeholt werden.",
      time: "Vor 2 Std.",
      unread: 1,
    },
    {
      id: 2,
      name: "Hausmeister",
      icon: Wrench,
      lastMessage: "Die Heizung wurde repariert. Funktioniert jetzt alles?",
      time: "Gestern",
      unread: 0,
    },
  ];

  return (
    <MobileLayout>
      {/* Header */}
      <div className="gradient-primary px-4 pt-12 pb-8">
        <h1 className="text-2xl font-bold text-white">Nachrichten</h1>
        <p className="text-white/80 mt-1">Kommunikation mit der Verwaltung</p>
      </div>

      <div className="px-4 -mt-4 space-y-3">
        {conversations.map((conv) => {
          const Icon = conv.icon;
          return (
            <Link key={conv.id} to={`/chat/${conv.id}`}>
              <Card className="shadow hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{conv.name}</h3>
                        <span className="text-xs text-muted-foreground">{conv.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {conv.lastMessage}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {conv.unread > 0 && (
                        <Badge className="bg-primary text-white h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">
                          {conv.unread}
                        </Badge>
                      )}
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}

        {conversations.length === 0 && (
          <Card className="shadow">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Keine Nachrichten vorhanden</p>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
}

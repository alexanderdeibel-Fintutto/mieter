import { useAuth } from "@/contexts/AuthContext";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Euro, 
  AlertTriangle, 
  Gauge, 
  Wrench,
  MessageCircle,
  ChevronRight 
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const userName = user?.user_metadata?.name || "Mieter";

  // Mock data - will be replaced with real data from Supabase
  const mockData = {
    nextRent: {
      amount: 850.00,
      dueDate: "01.03.2026",
    },
    openIssues: 2,
    lastMessages: [
      { id: 1, from: "Hausverwaltung", preview: "Ihre Nebenkostenabrechnung ist...", time: "Vor 2 Std." },
    ],
  };

  return (
    <MobileLayout>
      {/* Header with Gradient */}
      <div className="gradient-primary px-4 pt-12 pb-8">
        <h1 className="text-2xl font-bold text-white">
          Hallo, {userName}!
        </h1>
        <p className="text-white/80 mt-1">Willkommen zurück</p>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Next Rent Card */}
        <Card className="shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground flex items-center gap-2">
              <Euro className="h-4 w-4" />
              Nächste Mietzahlung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {mockData.nextRent.amount.toFixed(2)} €
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Fällig am {mockData.nextRent.dueDate}
                </p>
              </div>
              <Link to="/finanzen">
                <Button variant="ghost" size="sm">
                  Details
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Open Issues Card */}
        <Card className="shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Offene Meldungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-warning">{mockData.openIssues}</span>
                </div>
                <div>
                  <p className="font-medium">Meldungen offen</p>
                  <p className="text-sm text-muted-foreground">In Bearbeitung</p>
                </div>
              </div>
              <Link to="/meine-meldungen">
                <Button variant="ghost" size="sm">
                  Ansehen
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
            SCHNELLZUGRIFF
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/zaehler-ablesen">
              <Card className="shadow hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Gauge className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Zähler ablesen</span>
                </CardContent>
              </Card>
            </Link>
            <Link to="/mangel-melden">
              <Card className="shadow hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-2">
                    <Wrench className="h-6 w-6 text-secondary" />
                  </div>
                  <span className="text-sm font-medium">Mangel melden</span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Last Messages */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
            LETZTE NACHRICHTEN
          </h2>
          <Card className="shadow">
            {mockData.lastMessages.map((msg) => (
              <Link key={msg.id} to="/chat">
                <CardContent className="p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-5 w-5 text-info" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{msg.from}</p>
                    <p className="text-sm text-muted-foreground truncate">{msg.preview}</p>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{msg.time}</span>
                </CardContent>
              </Link>
            ))}
          </Card>
        </div>
      </div>
    </MobileLayout>
  );
}

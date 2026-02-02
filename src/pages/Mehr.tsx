import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { 
  Home, 
  FileText, 
  BookOpen, 
  Phone, 
  Settings, 
  LogOut,
  ChevronRight,
  User
} from "lucide-react";

export default function Mehr() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { icon: Home, label: "Meine Wohnung", to: "/wohnung", description: "Adresse & Wohnungsdaten" },
    { icon: FileText, label: "Dokumente", to: "/dokumente", description: "Mietvertrag, Abrechnungen" },
    { icon: BookOpen, label: "Hausordnung", to: "/hausordnung", description: "Regeln & Informationen" },
    { icon: Phone, label: "Notfallkontakte", to: "/notfallkontakte", description: "Wichtige Telefonnummern" },
    { icon: Settings, label: "Einstellungen", to: "/einstellungen", description: "Profil & Benachrichtigungen" },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className="gradient-primary px-4 pt-12 pb-8">
        <h1 className="text-2xl font-bold text-white">Mehr</h1>
        <p className="text-white/80 mt-1">Einstellungen & Informationen</p>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* User Info Card */}
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-lg">{user?.user_metadata?.name || "Mieter"}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card className="shadow divide-y">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to}>
                <CardContent className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Link>
            );
          })}
        </Card>

        {/* Logout Button */}
        <Card className="shadow">
          <CardContent 
            className="p-4 cursor-pointer hover:bg-destructive/5 transition-colors"
            onClick={handleLogout}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <LogOut className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-destructive">Abmelden</p>
                <p className="text-sm text-muted-foreground">Von Ihrem Konto abmelden</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}

import { MobileLayout } from "@/components/layout/MobileLayout";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { IconBadge } from "@/components/ui/IconBadge";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { 
  User, 
  Bell, 
  Moon, 
  Sun,
  Lock,
  Globe,
  HelpCircle,
  FileText,
  Shield,
  Mail,
  Smartphone,
  ChevronRight,
  Palette,
  Volume2,
  Vibrate,
  CreditCard,
  Crown
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Einstellungen() {
  const { user } = useAuth();
  const userName = user?.user_metadata?.name || "Mieter";
  const userEmail = user?.email || "";
  
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
    sound: true,
    vibration: true
  });
  
  const [darkMode, setDarkMode] = useState(false);

  return (
    <MobileLayout>
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-amber opacity-95" />
        <div className="absolute inset-0 gradient-mesh opacity-20" />
        <div className="relative px-4 pt-12 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold text-white">Einstellungen</h1>
            <p className="text-white/80 mt-1">Profil & Präferenzen</p>
          </motion.div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4 pb-4">
        {/* Profile Card */}
        <AnimatedCard delay={0} accentColor="primary">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">{userName.charAt(0)}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success border-2 border-background flex items-center justify-center">
                  <span className="text-white text-[10px]">✓</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">{userName}</p>
                <p className="text-sm text-muted-foreground">{userEmail}</p>
              </div>
              <Button variant="outline" size="sm">
                Bearbeiten
              </Button>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Subscription Status */}
        <Link to="/pricing">
          <AnimatedCard delay={50} accentColor="amber">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl gradient-amber flex items-center justify-center shadow-lg">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Kostenloser Plan</p>
                  <p className="text-sm text-muted-foreground">Upgrade für Premium-Features</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </AnimatedCard>
        </Link>

        {/* Notifications Section */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1 uppercase tracking-wide">
            Benachrichtigungen
          </h2>
          <AnimatedCard delay={100}>
            <div className="divide-y divide-border/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IconBadge icon={Bell} variant="primary" size="sm" />
                  <div>
                    <p className="font-medium text-sm">Push-Benachrichtigungen</p>
                    <p className="text-xs text-muted-foreground">Sofortige Updates auf Ihr Gerät</p>
                  </div>
                </div>
                <Switch 
                  checked={notifications.push} 
                  onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                />
              </CardContent>
              
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IconBadge icon={Mail} variant="sky" size="sm" />
                  <div>
                    <p className="font-medium text-sm">E-Mail-Benachrichtigungen</p>
                    <p className="text-xs text-muted-foreground">Wichtige Updates per E-Mail</p>
                  </div>
                </div>
                <Switch 
                  checked={notifications.email} 
                  onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                />
              </CardContent>
              
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IconBadge icon={Smartphone} variant="mint" size="sm" />
                  <div>
                    <p className="font-medium text-sm">SMS-Benachrichtigungen</p>
                    <p className="text-xs text-muted-foreground">Für kritische Meldungen</p>
                  </div>
                </div>
                <Switch 
                  checked={notifications.sms} 
                  onCheckedChange={(checked) => setNotifications({...notifications, sms: checked})}
                />
              </CardContent>
              
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IconBadge icon={Volume2} variant="coral" size="sm" />
                  <p className="font-medium text-sm">Ton</p>
                </div>
                <Switch 
                  checked={notifications.sound} 
                  onCheckedChange={(checked) => setNotifications({...notifications, sound: checked})}
                />
              </CardContent>
              
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IconBadge icon={Vibrate} variant="amber" size="sm" />
                  <p className="font-medium text-sm">Vibration</p>
                </div>
                <Switch 
                  checked={notifications.vibration} 
                  onCheckedChange={(checked) => setNotifications({...notifications, vibration: checked})}
                />
              </CardContent>
            </div>
          </AnimatedCard>
        </div>

        {/* Appearance Section */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1 uppercase tracking-wide">
            Darstellung
          </h2>
          <AnimatedCard delay={200}>
            <div className="divide-y divide-border/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IconBadge icon={darkMode ? Moon : Sun} variant="secondary" size="sm" />
                  <div>
                    <p className="font-medium text-sm">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">Dunkles Farbschema</p>
                  </div>
                </div>
                <Switch 
                  checked={darkMode} 
                  onCheckedChange={setDarkMode}
                />
              </CardContent>
              
              <CardContent className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <IconBadge icon={Globe} variant="sky" size="sm" />
                  <div>
                    <p className="font-medium text-sm">Sprache</p>
                    <p className="text-xs text-muted-foreground">Deutsch</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </div>
          </AnimatedCard>
        </div>

        {/* Security Section */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1 uppercase tracking-wide">
            Sicherheit
          </h2>
          <AnimatedCard delay={250}>
            <div className="divide-y divide-border/50">
              <CardContent className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <IconBadge icon={Lock} variant="coral" size="sm" />
                  <div>
                    <p className="font-medium text-sm">Passwort ändern</p>
                    <p className="text-xs text-muted-foreground">Zuletzt geändert: Vor 30 Tagen</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
              
              <CardContent className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <IconBadge icon={Shield} variant="mint" size="sm" />
                  <div>
                    <p className="font-medium text-sm">Zwei-Faktor-Authentifizierung</p>
                    <p className="text-xs text-muted-foreground">Nicht aktiviert</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </div>
          </AnimatedCard>
        </div>

        {/* Help & Legal */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1 uppercase tracking-wide">
            Hilfe & Rechtliches
          </h2>
          <AnimatedCard delay={300}>
            <div className="divide-y divide-border/50">
              <CardContent className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <IconBadge icon={HelpCircle} variant="primary" size="sm" />
                  <p className="font-medium text-sm">Hilfe & FAQ</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
              
              <CardContent className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <IconBadge icon={FileText} variant="sky" size="sm" />
                  <p className="font-medium text-sm">Datenschutzerklärung</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
              
              <CardContent className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <IconBadge icon={FileText} variant="amber" size="sm" />
                  <p className="font-medium text-sm">Nutzungsbedingungen</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </div>
          </AnimatedCard>
        </div>

        {/* App Version */}
        <div className="text-center pt-4 pb-8">
          <p className="text-xs text-muted-foreground">Wohn-Held Version 1.0.0</p>
          <p className="text-xs text-muted-foreground mt-1">Made with ❤️ in Berlin</p>
        </div>
      </div>
    </MobileLayout>
  );
}

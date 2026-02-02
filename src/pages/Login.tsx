import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        variant: "destructive",
        title: "Anmeldung fehlgeschlagen",
        description: error.message === "Invalid login credentials" 
          ? "E-Mail oder Passwort ist falsch."
          : error.message,
      });
    } else {
      navigate("/");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-primary/10 blur-3xl animate-float" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-secondary/10 blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-mint/5 blur-3xl animate-pulse-soft" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo/Header with animation */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="w-20 h-20 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-primary/30 animate-float">
            <span className="text-4xl text-white font-bold">F</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Fintutto Mieter</h1>
          <p className="text-muted-foreground mt-1">Ihr Mieter-Portal</p>
        </div>

        <AnimatedCard delay={100}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Anmelden</CardTitle>
            <CardDescription>
              Geben Sie Ihre Zugangsdaten ein
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ihre@email.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Button type="submit" className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Wird angemeldet...
                  </>
                ) : (
                  "Anmelden"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Noch kein Konto? </span>
              <Link to="/registrieren" className="text-primary hover:underline font-semibold">
                Registrieren
              </Link>
            </div>
          </CardContent>
        </AnimatedCard>
      </div>
    </div>
  );
}

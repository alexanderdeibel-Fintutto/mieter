import { MobileLayout } from "@/components/layout/MobileLayout";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { IconBadge } from "@/components/ui/IconBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Euro, Calendar } from "lucide-react";

export default function Finanzen() {
  // Mock data - will be replaced with real data
  const mockData = {
    balance: 0, // Positive = Guthaben, Negative = Nachzahlung
    rent: {
      cold: 650.00,
      utilities: 200.00,
      total: 850.00,
    },
    payments: [
      { id: 1, date: "01.02.2026", amount: 850.00, type: "Miete", status: "bezahlt" },
      { id: 2, date: "01.01.2026", amount: 850.00, type: "Miete", status: "bezahlt" },
      { id: 3, date: "01.12.2025", amount: 850.00, type: "Miete", status: "bezahlt" },
      { id: 4, date: "15.11.2025", amount: -127.50, type: "NK-Guthaben", status: "gutgeschrieben" },
    ],
  };

  const coldPercentage = (mockData.rent.cold / mockData.rent.total) * 100;

  return (
    <MobileLayout>
      {/* Header with animated gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-95" />
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="relative px-4 pt-12 pb-8">
          <h1 className="text-2xl font-bold text-white">Finanzen</h1>
          <p className="text-white/80 mt-1">Ihre Zahlungsübersicht</p>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4 pb-4">
        {/* Balance Card */}
        <AnimatedCard delay={0} accentColor={mockData.balance >= 0 ? "mint" : "coral"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground">
              Kontostand
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {mockData.balance >= 0 ? (
                <div className="w-14 h-14 rounded-2xl gradient-mint flex items-center justify-center shadow-lg shadow-mint/20 animate-float">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-2xl gradient-coral flex items-center justify-center shadow-lg shadow-coral/20">
                  <TrendingDown className="h-7 w-7 text-white" />
                </div>
              )}
              <div>
                <p className={`text-3xl font-bold ${mockData.balance >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {mockData.balance >= 0 ? '+' : ''}{mockData.balance.toFixed(2)} €
                </p>
                <StatusBadge 
                  status={mockData.balance >= 0 ? "success" : "error"} 
                  label={mockData.balance >= 0 ? 'Ausgeglichen' : 'Nachzahlung'} 
                />
              </div>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Rent Breakdown with progress bars */}
        <AnimatedCard delay={100} accentColor="primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground flex items-center gap-2">
              <IconBadge icon={Euro} variant="primary" size="sm" />
              Monatliche Miete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Visual breakdown bar */}
            <div className="space-y-2">
              <div className="flex h-4 rounded-full overflow-hidden bg-muted">
                <div 
                  className="bg-primary transition-all duration-500"
                  style={{ width: `${coldPercentage}%` }}
                />
                <div 
                  className="bg-secondary transition-all duration-500"
                  style={{ width: `${100 - coldPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Kaltmiete</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                  <span className="text-muted-foreground">Nebenkosten</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Kaltmiete</span>
                </div>
                <span className="font-medium">{mockData.rent.cold.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="text-muted-foreground">Nebenkosten</span>
                </div>
                <span className="font-medium">{mockData.rent.utilities.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold">Gesamtbetrag</span>
                <span className="text-2xl font-bold text-primary">{mockData.rent.total.toFixed(2)} €</span>
              </div>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Payment History with timeline */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1 flex items-center gap-2 uppercase tracking-wide">
            <Calendar className="h-4 w-4" />
            Zahlungshistorie
          </h2>
          <AnimatedCard delay={200}>
            <div className="divide-y divide-border/50">
              {mockData.payments.map((payment, index) => (
                <CardContent key={payment.id} className="p-4 relative">
                  {/* Timeline connector */}
                  {index < mockData.payments.length - 1 && (
                    <div className="absolute left-8 top-14 bottom-0 w-0.5 bg-border/50" />
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Timeline dot */}
                      <div className={`w-3 h-3 rounded-full z-10 ${
                        payment.amount < 0 ? 'bg-success' : 'bg-primary'
                      }`} />
                      <div>
                        <p className="font-medium">{payment.type}</p>
                        <p className="text-sm text-muted-foreground">{payment.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold text-lg ${payment.amount < 0 ? 'text-success' : ''}`}>
                        {payment.amount < 0 ? '+' : '-'}{Math.abs(payment.amount).toFixed(2)} €
                      </p>
                      <StatusBadge 
                        status={payment.status === 'bezahlt' ? 'success' : 'info'} 
                        label={payment.status}
                        showDot={false}
                      />
                    </div>
                  </div>
                </CardContent>
              ))}
            </div>
          </AnimatedCard>
        </div>
      </div>
    </MobileLayout>
  );
}

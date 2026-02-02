import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  return (
    <MobileLayout>
      {/* Header */}
      <div className="gradient-primary px-4 pt-12 pb-8">
        <h1 className="text-2xl font-bold text-white">Finanzen</h1>
        <p className="text-white/80 mt-1">Ihre Zahlungsübersicht</p>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Balance Card */}
        <Card className="shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground">
              Kontostand
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {mockData.balance >= 0 ? (
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-destructive" />
                </div>
              )}
              <div>
                <p className={`text-3xl font-bold ${mockData.balance >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {mockData.balance >= 0 ? '+' : ''}{mockData.balance.toFixed(2)} €
                </p>
                <p className="text-sm text-muted-foreground">
                  {mockData.balance >= 0 ? 'Guthaben' : 'Nachzahlung'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rent Breakdown */}
        <Card className="shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground flex items-center gap-2">
              <Euro className="h-4 w-4" />
              Monatliche Miete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Kaltmiete</span>
              <span className="font-medium">{mockData.rent.cold.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Nebenkosten</span>
              <span className="font-medium">{mockData.rent.utilities.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-semibold">Gesamtbetrag</span>
              <span className="text-xl font-bold text-primary">{mockData.rent.total.toFixed(2)} €</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            ZAHLUNGSHISTORIE
          </h2>
          <Card className="shadow divide-y">
            {mockData.payments.map((payment) => (
              <CardContent key={payment.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{payment.type}</p>
                    <p className="text-sm text-muted-foreground">{payment.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${payment.amount < 0 ? 'text-success' : ''}`}>
                      {payment.amount < 0 ? '+' : '-'}{Math.abs(payment.amount).toFixed(2)} €
                    </p>
                    <Badge 
                      variant={payment.status === 'bezahlt' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            ))}
          </Card>
        </div>
      </div>
    </MobileLayout>
  );
}

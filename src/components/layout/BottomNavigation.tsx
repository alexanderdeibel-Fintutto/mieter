import { Home, Wallet, Plus, MessageCircle, Menu, X } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/finanzen", icon: Wallet, label: "Finanzen" },
  { to: "#melden", icon: Plus, label: "Melden", isAction: true },
  { to: "/chat", icon: MessageCircle, label: "Chat" },
  { to: "/mehr", icon: Menu, label: "Mehr" },
];

const reportActions = [
  { to: "/mangel-melden", label: "Mangel melden", icon: "🔧" },
  { to: "/zaehler-ablesen", label: "Zähler ablesen", icon: "📊" },
  { to: "/dokument-anfragen", label: "Dokument anfragen", icon: "📄" },
];

export function BottomNavigation() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Floating Action Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Floating Action Menu */}
      {isMenuOpen && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3">
          {reportActions.map((action, index) => (
            <NavLink
              key={action.to}
              to={action.to}
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 bg-card px-4 py-3 rounded-full shadow-lg animate-fab-open"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="text-xl">{action.icon}</span>
              <span className="font-medium text-foreground">{action.label}</span>
            </NavLink>
          ))}
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg">
        <div className="flex items-center justify-around h-20 max-w-lg mx-auto px-2 pb-safe">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.to !== "#melden" && location.pathname === item.to;

            if (item.isAction) {
              return (
                <button
                  key={item.label}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={cn(
                    "flex flex-col items-center justify-center -mt-6 transition-all duration-200",
                  )}
                >
                  <div className={cn(
                    "w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-lg transition-transform",
                    isMenuOpen && "rotate-45"
                  )}>
                    {isMenuOpen ? (
                      <X className="h-6 w-6 text-white" />
                    ) : (
                      <Plus className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <span className="text-xs mt-1 text-muted-foreground">{item.label}</span>
                </button>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-[60px]",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-6 w-6", isActive && "stroke-[2.5px]")} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}

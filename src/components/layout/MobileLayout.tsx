import { ReactNode } from "react";
import { BottomNavigation } from "./BottomNavigation";

interface MobileLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export function MobileLayout({ children, showNav = true }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className={showNav ? "pb-24" : ""}>
        {children}
      </main>
      {showNav && <BottomNavigation />}
    </div>
  );
}

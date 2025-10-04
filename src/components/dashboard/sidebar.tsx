
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Book,
  Car,
  Briefcase,
  Users,
  FileText,
  LayoutDashboard,
  PanelLeft,
  Settings,
} from "lucide-react";
import Logo from "@/components/logo";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "partner", "driver"] },
  { href: "/dashboard/bookings", label: "Bookings", icon: Book, roles: ["admin", "partner", "driver"] },
  { href: "/dashboard/drivers", label: "Drivers", icon: Car, roles: ["admin"] },
  { href: "/dashboard/partners", label: "Partners", icon: Briefcase, roles: ["admin"] },
  { href: "/dashboard/operators", label: "Operators", icon: Briefcase, roles: ["admin"] },
  { href: "/dashboard/clients", label: "Clients", icon: Users, roles: ["admin"] },
  { href: "/dashboard/reports", label: "Reports", icon: FileText, roles: ["admin"] },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, roles: ["admin"] },
];

function NavLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href) && (href !== "/dashboard" || pathname === href);
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
        isActive && "bg-muted text-primary"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function SidebarNav() {
    const { user } = useUser();
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(() => user ? doc(firestore, `users/${user.uid}`) : null, [user, firestore]);
    const { data: userProfile } = useDoc(userDocRef);

    if (!user || !userProfile) return null;

    return (
        <nav className="grid items-start gap-1 px-2 text-sm font-medium">
            {NAV_ITEMS.filter(item => item.roles.includes((userProfile as any).role)).map(item => (
                <NavLink key={item.href} {...item} />
            ))}
        </nav>
    )
}

function DesktopSidebar() {
  return (
    <aside className="hidden border-r bg-card md:block w-64">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-6">
          <Logo />
        </div>
        <div className="flex-1 overflow-auto py-2">
          <SidebarNav />
        </div>
      </div>
    </aside>
  );
}

export function MobileSheet() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 md:hidden h-8 w-8">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col w-64 p-0">
                <SheetHeader>
                  <Logo />
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-auto py-2">
                    <SidebarNav />
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default function DashboardSidebar() {
    return (
        <DesktopSidebar />
    );
}

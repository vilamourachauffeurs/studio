"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  PanelLeft,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import Logo from "../logo";
import DashboardSidebar from "./sidebar";


export default function DashboardHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname.startsWith('/dashboard/bookings')) return 'Bookings';
    if (pathname.startsWith('/dashboard/drivers')) return 'Drivers';
    if (pathname.startsWith('/dashboard/partners')) return 'Partners';
    if (pathname.startsWith('/dashboard/clients')) return 'Clients';
    if (pathname.startsWith('/dashboard/reports')) return 'Reports';
    return "Dashboard";
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <div className="md:hidden">
            <DashboardSidebar />
        </div>
        <div className="relative ml-auto flex-1 md:grow-0">
            {/* Search can be implemented later */}
            {/* <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            /> */}
        </div>
        <h1 className="flex-1 text-xl font-headline hidden md:block">{getPageTitle()}</h1>
        <Button variant="outline" size="icon" className="h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
        </Button>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
                <Avatar>
                    <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                    <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                </Avatar>
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </header>
  );
}

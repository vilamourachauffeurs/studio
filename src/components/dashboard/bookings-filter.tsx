
"use client";

import { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { BookingStatus } from "@/lib/types";
import { ChevronDown } from "lucide-react";

const ALL_STATUSES: BookingStatus[] = [
    "draft",
    "pending_admin",
    "approved",
    "assigned",
    "confirmed",
    "in_progress",
    "completed",
    "cancelled",
];

type BookingsFilterProps = {
    statusFilter: BookingStatus[];
    setStatusFilter: Dispatch<SetStateAction<BookingStatus[]>>;
    pickupFilter: string;
    setPickupFilter: Dispatch<SetStateAction<string>>;
    dropoffFilter: string;
    setDropoffFilter: Dispatch<SetStateAction<string>>;
};

export function BookingsFilter({
    statusFilter,
    setStatusFilter,
    pickupFilter,
    setPickupFilter,
    dropoffFilter,
    setDropoffFilter,
}: BookingsFilterProps) {

    const toggleStatusFilter = (status: BookingStatus) => {
        setStatusFilter(prev => 
          prev.includes(status) 
            ? prev.filter(s => s !== status)
            : [...prev, status]
        );
    };

    const clearFilters = () => {
        setStatusFilter([]);
        setPickupFilter("");
        setDropoffFilter("");
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow space-y-6 py-4">
                <div className="space-y-2">
                    <Label htmlFor="pickup">Pickup Location</Label>
                    <Input 
                        id="pickup" 
                        placeholder="Filter by pickup location..." 
                        value={pickupFilter} 
                        onChange={(e) => setPickupFilter(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="dropoff">Drop-off Location</Label>
                    <Input 
                        id="dropoff" 
                        placeholder="Filter by drop-off location..." 
                        value={dropoffFilter} 
                        onChange={(e) => setDropoffFilter(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Status</Label>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                                <span>{statusFilter.length > 0 ? `${statusFilter.length} selected` : "Select status..."}</span>
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                            <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {ALL_STATUSES.map(status => (
                            <DropdownMenuCheckboxItem
                                key={status}
                                checked={statusFilter.includes(status)}
                                onCheckedChange={() => toggleStatusFilter(status)}
                                onSelect={(e) => e.preventDefault()}
                                className="capitalize"
                            >
                                {status.replace(/_/g, ' ')}
                            </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
             <div className="mt-auto pt-4 border-t">
                <Button onClick={clearFilters} variant="ghost" className="w-full">Clear All Filters</Button>
            </div>
        </div>
    )
}

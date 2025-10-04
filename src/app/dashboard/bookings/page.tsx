
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import BookingsTable from "@/components/dashboard/bookings-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { Booking, BookingStatus } from "@/lib/types";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { ListFilter } from "lucide-react";

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

const DEFAULT_FILTER: BookingStatus[] = [
    "pending_admin",
    "approved",
    "assigned",
    "confirmed",
    "in_progress"
];

export default function BookingsPage() {
  const firestore = useFirestore();
  const [statusFilter, setStatusFilter] = useState<BookingStatus[]>(DEFAULT_FILTER);

  const bookingsCollectionRef = useMemoFirebase(() => collection(firestore, 'bookings'), [firestore]);
  const bookingsQuery = useMemoFirebase(() => query(bookingsCollectionRef, orderBy('pickupTime', 'desc')), [bookingsCollectionRef]);
  const { data: bookings, isLoading } = useCollection<Booking>(bookingsQuery);

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    if (statusFilter.length === 0) return bookings;
    return bookings.filter(booking => statusFilter.includes(booking.status));
  }, [bookings, statusFilter]);

  const toggleStatusFilter = (status: BookingStatus) => {
    setStatusFilter(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-headline">Bookings</h1>
            <p className="text-muted-foreground">
                Manage all company bookings from here.
            </p>
        </div>
        <div className="flex items-center gap-2">
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filter Status
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
            <Button asChild>
                <Link href="/dashboard/bookings/new">Create New Booking</Link>
            </Button>
        </div>
      </div>
      <Card className="shadow-lg">
          <CardHeader>
              <CardTitle>All Bookings</CardTitle>
              <CardDescription>A list of all bookings in the system, grouped by day.</CardDescription>
          </CardHeader>
          <CardContent>
             {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full bg-muted" />
                    <Skeleton className="h-12 w-full bg-muted" />
                    <Skeleton className="h-12 w-full" />
                </div>
             ) : <BookingsTable bookings={filteredBookings || []} />}
          </CardContent>
      </Card>
    </div>
  );
}

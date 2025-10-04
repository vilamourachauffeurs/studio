
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import BookingsTable from "@/components/dashboard/bookings-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { Booking, BookingStatus } from "@/lib/types";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { ListFilter } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { BookingsFilter } from "@/components/dashboard/bookings-filter";

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
  const [pickupFilter, setPickupFilter] = useState<string>("");
  const [dropoffFilter, setDropoffFilter] = useState<string>("");

  const bookingsCollectionRef = useMemoFirebase(() => collection(firestore, 'bookings'), [firestore]);
  const bookingsQuery = useMemoFirebase(() => query(bookingsCollectionRef, orderBy('pickupTime', 'desc')), [bookingsCollectionRef]);
  const { data: bookings, isLoading } = useCollection<Booking>(bookingsQuery);

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    return bookings.filter(booking => {
        const statusMatch = statusFilter.length === 0 ? true : statusFilter.includes(booking.status);
        const pickupMatch = !pickupFilter || booking.pickupLocation.toLowerCase().includes(pickupFilter.toLowerCase());
        const dropoffMatch = !dropoffFilter || booking.dropoffLocation.toLowerCase().includes(dropoffFilter.toLowerCase());
        return statusMatch && pickupMatch && dropoffMatch;
    });
  }, [bookings, statusFilter, pickupFilter, dropoffFilter]);

  const activeFilterCount = (statusFilter.length > 0 ? 1 : 0) + (pickupFilter ? 1 : 0) + (dropoffFilter ? 1 : 0);

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
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 gap-1 relative">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filter
                  </span>
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Bookings</SheetTitle>
                  <SheetDescription>
                    Refine the list of bookings based on different criteria.
                  </SheetDescription>
                </SheetHeader>
                <BookingsFilter
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    pickupFilter={pickupFilter}
                    setPickupFilter={setPickupFilter}
                    dropoffFilter={dropoffFilter}
                    setDropoffFilter={setDropoffFilter}
                />
              </SheetContent>
            </Sheet>
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

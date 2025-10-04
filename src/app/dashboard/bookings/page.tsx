
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import BookingsTable from "@/components/dashboard/bookings-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { Booking, BookingStatus } from "@/lib/types";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const ALL_STATUSES: (BookingStatus | 'all')[] = [
    'all',
    "draft",
    "pending_admin",
    "approved",
    "assigned",
    "confirmed",
    "in_progress",
    "completed",
    "cancelled",
];

export default function BookingsPage() {
  const firestore = useFirestore();
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');

  const bookingsCollectionRef = useMemoFirebase(() => collection(firestore, 'bookings'), [firestore]);
  const bookingsQuery = useMemoFirebase(() => query(bookingsCollectionRef, orderBy('pickupTime', 'desc')), [bookingsCollectionRef]);
  const { data: bookings, isLoading } = useCollection<Booking>(bookingsQuery);

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    if (statusFilter === 'all') return bookings;
    return bookings.filter(booking => booking.status === statusFilter);
  }, [bookings, statusFilter]);

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
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BookingStatus | 'all')}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    {ALL_STATUSES.map(status => (
                        <SelectItem key={status} value={status} className="capitalize">
                            {status.replace(/_/g, ' ')}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
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

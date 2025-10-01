
"use client";

import { Button } from "@/components/ui/button";
import BookingsTable from "@/components/dashboard/bookings-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { Booking } from "@/lib/types";
import Link from "next/link";

export default function BookingsPage() {
  const firestore = useFirestore();
  const bookingsCollectionRef = useMemoFirebase(() => collection(firestore, 'bookings'), [firestore]);
  const bookingsQuery = useMemoFirebase(() => query(bookingsCollectionRef, orderBy('pickupTime', 'desc')), [bookingsCollectionRef]);
  const { data: bookings, isLoading } = useCollection<Booking>(bookingsQuery);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-headline">Bookings</h1>
            <p className="text-muted-foreground">
                Manage all company bookings from here.
            </p>
        </div>
        <Button asChild>
            <Link href="/dashboard/bookings/new">Create New Booking</Link>
        </Button>
      </div>
      <Card className="shadow-lg">
          <CardHeader>
              <CardTitle>All Bookings</CardTitle>
              <CardDescription>A list of all bookings in the system.</CardDescription>
          </CardHeader>
          <CardContent>
             {isLoading ? <p>Loading bookings...</p> : <BookingsTable bookings={bookings || []} />}
          </CardContent>
      </Card>
    </div>
  );
}

    
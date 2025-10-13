
"use client";

import { DollarSign, Book } from "lucide-react";
import { StatsCard } from "./stats-card";
import BookingsTable from "./bookings-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import Link from "next/link";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, where, orderBy, limit, doc, Timestamp } from "firebase/firestore";
import type { Booking } from "@/lib/types";

export default function OperatorView() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => (user ? doc(firestore, `users/${user.uid}`) : null), [user, firestore]);
  const { data: userProfile } = useDoc(userDocRef);

  // @ts-ignore
  const relatedId = userProfile?.relatedId;

  const bookingsCollectionRef = useMemoFirebase(() => collection(firestore, 'bookings'), [firestore]);

  const operatorBookingsQuery = useMemoFirebase(() => {
    if (!relatedId) return null;
    return query(
      bookingsCollectionRef, 
      where('operatorId', '==', relatedId),
      orderBy('pickupTime', 'asc')
    );
  }, [bookingsCollectionRef, relatedId]);

  const { data: operatorBookings } = useCollection<Booking>(operatorBookingsQuery);

  // Get current time to filter out past bookings
  const now = new Date();

  const upcomingBookingsQuery = useMemoFirebase(() => {
    if (!relatedId) return null;
    
    return query(
        bookingsCollectionRef,
        where('operatorId', '==', relatedId),
        orderBy('pickupTime', 'asc'),
        limit(5)
    );
  }, [bookingsCollectionRef, relatedId]);

  const { data: upcomingBookings } = useCollection<Booking>(upcomingBookingsQuery);

  // Filter to only show upcoming bookings (not past ones)
  const filteredUpcomingBookings = upcomingBookings?.filter(b => {
    const pickupTime = b.pickupTime instanceof Timestamp 
      ? b.pickupTime.toDate() 
      : new Date(b.pickupTime);
    return pickupTime >= now;
  }) || [];

  const pendingBookings = operatorBookings?.filter(b => {
    const pickupTime = b.pickupTime instanceof Timestamp 
      ? b.pickupTime.toDate() 
      : new Date(b.pickupTime);
    return pickupTime >= now && b.status === 'pending_admin';
  }) || [];

  if (!relatedId) {
    return (
      <div className="space-y-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline">Account setup required</CardTitle>
            <CardDescription>
              Your user is marked as an operator but is not linked to an operator record yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please ask an admin to set the <code>relatedId</code> on your user profile to the corresponding
              entry in <code>operators/{'{operatorId}'}</code>. Once linked, your bookings and stats will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tableRows = filteredUpcomingBookings.length > 0
    ? filteredUpcomingBookings
    : [];

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-3xl font-headline">Welcome, Operator!</h2>
                <p className="text-muted-foreground">Here's what's happening with your bookings.</p>
            </div>
            <Button asChild>
                <Link href="/dashboard/bookings/new">Create New Booking</Link>
            </Button>
        </div>
      <div className="grid gap-4 md:grid-cols-2">
        <StatsCard
          title="Total Bookings"
          value={operatorBookings?.length.toString() || '0'}
          description="All time"
          icon={<Book className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Total Commission"
          value="$1,800.00"
          description="+12% from last month"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
      <Card className="shadow-md">
        <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="font-headline">Upcoming Bookings</CardTitle>
                <CardDescription>
                    {pendingBookings.length} of your bookings are pending approval.
                </CardDescription>
            </div>
            <Button asChild size="sm">
                <Link href="/dashboard/bookings">View All</Link>
            </Button>
        </div>
        </CardHeader>
        <CardContent>
          <BookingsTable bookings={tableRows} />
        </CardContent>
      </Card>
    </div>
  );
}


"use client";

import { DollarSign, Book } from "lucide-react";
import { StatsCard } from "./stats-card";
import BookingsTable from "./bookings-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import Link from "next/link";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, where, orderBy, limit, doc } from "firebase/firestore";
import type { Booking } from "@/lib/types";

export default function PartnerView() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => (user ? doc(firestore, `users/${user.uid}`) : null), [user, firestore]);
  const { data: userProfile } = useDoc(userDocRef);

  // @ts-ignore
  const relatedId = userProfile?.relatedId;
  // @ts-ignore
  const userRole = userProfile?.role;

  const bookingsCollectionRef = useMemoFirebase(() => collection(firestore, 'bookings'), [firestore]);

  const partnerBookingsQuery = useMemoFirebase(() => {
    if (!relatedId || !userRole) return null;

    if (userRole === 'partner') {
      return query(bookingsCollectionRef, where('partnerId', '==', relatedId));
    }
    if (userRole === 'operator') {
      return query(bookingsCollectionRef, where('operatorId', '==', relatedId));
    }
    return null;
  }, [bookingsCollectionRef, relatedId, userRole]);

  const { data: partnerBookings } = useCollection<Booking>(partnerBookingsQuery);

  const recentBookingsQuery = useMemoFirebase(() => {
    if (!relatedId || !userRole) return null;
    
    if (userRole === 'partner') {
        return query(
          bookingsCollectionRef,
          where('partnerId', '==', relatedId),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
    }
    if (userRole === 'operator') {
        return query(
            bookingsCollectionRef,
            where('operatorId', '==', relatedId),
            orderBy('createdAt', 'desc'),
            limit(5)
        );
    }
    return null;
  }, [bookingsCollectionRef, relatedId, userRole]);

  const { data: recentBookings } = useCollection<Booking>(recentBookingsQuery);

  const pendingBookings = partnerBookings?.filter(b => b.status === 'pending_admin') || [];

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-3xl font-headline">Welcome!</h2>
                <p className="text-muted-foreground">Here's what's happening with your bookings.</p>
            </div>
            <Button asChild>
                <Link href="/dashboard/bookings/new">Create New Booking</Link>
            </Button>
        </div>
      <div className="grid gap-4 md:grid-cols-2">
        <StatsCard
          title="Total Bookings"
          value={partnerBookings?.length.toString() || '0'}
          description="All time"
          icon={<Book className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Total Commission"
          value="$2,500.00"
          description="+15% from last month"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
      <Card className="shadow-md">
        <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="font-headline">Your Recent Bookings</CardTitle>
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
          <BookingsTable bookings={recentBookings || []} />
        </CardContent>
      </Card>
    </div>
  );
}

    
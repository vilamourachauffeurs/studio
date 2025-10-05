
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import BookingsTable from "@/components/dashboard/bookings-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, query, orderBy, where, doc } from "firebase/firestore";
import type { Booking, BookingStatus } from "@/lib/types";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function BookingsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  
  const userDocRef = useMemoFirebase(() => (user ? doc(firestore, `users/${user.uid}`) : null), [user, firestore]);
  const { data: userProfile } = useDoc(userDocRef);

  const bookingsCollectionRef = useMemoFirebase(() => collection(firestore, 'bookings'), [firestore]);
  
  const bookingsQuery = useMemoFirebase(() => {
    if (!userProfile) return null;

    // @ts-ignore
    const userRole = userProfile.role;
    // @ts-ignore
    const relatedId = userProfile.relatedId;

    if (userRole === 'admin') {
      return query(bookingsCollectionRef, orderBy('pickupTime', 'desc'));
    } else if (userRole === 'partner' && relatedId) {
      return query(bookingsCollectionRef, where('partnerId', '==', relatedId), orderBy('pickupTime', 'desc'));
    } else if (userRole === 'operator' && relatedId) {
      return query(bookingsCollectionRef, where('operatorId', '==', relatedId), orderBy('pickupTime', 'desc'));
    } else if (userRole === 'driver' && relatedId) {
      return query(bookingsCollectionRef, where('driverId', '==', relatedId), orderBy('pickupTime', 'desc'));
    }

    // Fallback for users (like partners/operators without a relatedId) to see bookings they created
    return query(bookingsCollectionRef, where('createdById', '==', user.uid), orderBy('pickupTime', 'desc'));
  }, [bookingsCollectionRef, userProfile, user]);

  const { data: bookings, isLoading } = useCollection<Booking>(bookingsQuery);

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
             ) : <BookingsTable bookings={bookings || []} />}
          </CardContent>
      </Card>
    </div>
  );
}

    
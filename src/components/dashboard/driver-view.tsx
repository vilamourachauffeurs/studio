"use client";

import { DollarSign, Car, Star } from "lucide-react";
import { StatsCard } from "./stats-card";
import BookingsTable from "./bookings-table";
import { drivers } from "@/lib/data";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import Link from "next/link";
import { collection, query, where, doc, orderBy, Timestamp } from "firebase/firestore";
import type { Booking, Driver } from "@/lib/types";

export default function DriverView() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userProfile } = useDoc(userDocRef);
  
  // @ts-ignore
  const driverId = userProfile?.relatedId;

  const driverDocRef = useMemoFirebase(() => driverId ? doc(firestore, 'drivers', driverId) : null, [firestore, driverId]);
  const { data: driver } = useDoc<Driver>(driverDocRef);

  const bookingsCollectionRef = useMemoFirebase(() => collection(firestore, 'bookings'), [firestore]);

  const driverBookingsQuery = useMemoFirebase(() => {
    if (!driverId) return null;
    return query(
      bookingsCollectionRef, 
      where('driverId', '==', driverId),
      orderBy('pickupTime', 'asc')
    );
  }, [bookingsCollectionRef, driverId]);

  const { data: driverBookings } = useCollection<Booking>(driverBookingsQuery);

  // Get current time to filter out past bookings
  const now = new Date();
  
  const upcomingBookings = driverBookings
    ?.filter((b) => {
      const pickupTime = b.pickupTime instanceof Timestamp 
        ? b.pickupTime.toDate() 
        : new Date(b.pickupTime);
      return pickupTime >= now && (b.status === "assigned" || b.status === "confirmed");
    })
    .slice(0, 5);

  const newJobsCount = driverBookings?.filter(b => {
    const pickupTime = b.pickupTime instanceof Timestamp 
      ? b.pickupTime.toDate() 
      : new Date(b.pickupTime);
    return pickupTime >= now && b.status === 'assigned';
  }).length || 0;

  return (
    <div className="space-y-6">
        <div>
            <h2 className="text-3xl font-headline">Hello, {user?.displayName || user?.email}!</h2>
            <p className="text-muted-foreground">Here are your stats and upcoming jobs.</p>
        </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Last Month's Earnings"
          // @ts-ignore
          value={`$${driver?.performance?.lastMonthEarnings.toLocaleString() || '0'}`}
          description="Before commission"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Completed Jobs"
          // @ts-ignore
          value={driver?.performance?.completedJobs.toString() || '0'}
          description="All time"
          icon={<Car className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="On-Time Rate"
          // @ts-ignore
          value={`${driver?.performance?.onTimePercent || '100'}%`}
          description="Excellent performance"
          icon={<Star className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex justify-between items-center">
              <div>
                  <CardTitle className="font-headline">Upcoming Jobs</CardTitle>
                  <CardDescription>
                      You have {newJobsCount} new jobs to confirm.
                  </CardDescription>
              </div>
              <Button asChild size="sm">
                  <Link href="/dashboard/bookings">View All</Link>
              </Button>
          </div>
        </CardHeader>
        <CardContent>
          <BookingsTable bookings={upcomingBookings || []} />
        </CardContent>
      </Card>
    </div>
  );
}


"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { doc } from "firebase/firestore";
import { useFirestore, useDoc } from "@/firebase";
import type { Booking } from "@/lib/types";
import BookingDetails from "@/components/dashboard/booking-details";
import { Skeleton } from "@/components/ui/skeleton";

export default function BookingDetailsPage() {
  const { id } = useParams();
  const firestore = useFirestore();
  const bookingId = Array.isArray(id) ? id[0] : id;

  const bookingRef = useMemo(
    () => (bookingId ? doc(firestore, "bookings", bookingId) : null),
    [firestore, bookingId]
  );

  const { data: booking, isLoading, error } = useDoc<Booking>(bookingRef);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/2" />
        <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-48 col-span-2" />
            <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive">Error: {error.message}</p>;
  }

  if (!booking) {
    return <p>Booking not found.</p>;
  }

  return <BookingDetails booking={booking} />;
}

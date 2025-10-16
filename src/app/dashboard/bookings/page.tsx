
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import BookingsTable from "@/components/dashboard/bookings-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, query, orderBy, where, doc, Timestamp } from "firebase/firestore";
import type { Booking, BookingStatus } from "@/lib/types";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { startOfDay, startOfMonth, endOfMonth, subMonths, format, endOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DateFilterType = 'all' | 'thisMonth' | 'lastMonth' | 'last3Months' | 'custom';

export default function BookingsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  
  const [pastDateFilter, setPastDateFilter] = useState<DateFilterType>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  const userDocRef = useMemoFirebase(() => (user ? doc(firestore, `users/${user.uid}`) : null), [user, firestore]);
  const { data: userProfile } = useDoc(userDocRef);

  const bookingsCollectionRef = useMemoFirebase(() => collection(firestore, 'bookings'), [firestore]);
  
  const bookingsQuery = useMemoFirebase(() => {
    if (!userProfile || !user) return null;

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
    } else if (userRole === 'driver') {
      // NEW ARCHITECTURE: For drivers, user.uid = driver document ID
      return query(bookingsCollectionRef, where('driverId', '==', user.uid), orderBy('pickupTime', 'desc'));
    }

    // Fallback for users (like partners/operators without a relatedId) to see bookings they created
    return query(bookingsCollectionRef, where('createdById', '==', user.uid), orderBy('pickupTime', 'desc'));
  }, [bookingsCollectionRef, userProfile, user]);

  const { data: bookings, isLoading } = useCollection<Booking>(bookingsQuery);

  // Split bookings into current (today and future) and past
  const { currentBookings, pastBookings } = useMemo(() => {
    if (!bookings) return { currentBookings: [], pastBookings: [] };
    
    const today = startOfDay(new Date());
    
    const current: Booking[] = [];
    const past: Booking[] = [];
    
    bookings.forEach(booking => {
      const pickupTime = booking.pickupTime instanceof Timestamp 
        ? booking.pickupTime.toDate() 
        : new Date(booking.pickupTime);
      const pickupDay = startOfDay(pickupTime);
      
      if (pickupDay >= today) {
        current.push(booking);
      } else {
        past.push(booking);
      }
    });
    
    return { currentBookings: current, pastBookings: past };
  }, [bookings]);

  // Filter past bookings based on date filter selection
  const filteredPastBookings = useMemo(() => {
    if (!pastBookings || pastBookings.length === 0) return [];
    
    const now = new Date();
    
    switch (pastDateFilter) {
      case 'all':
        return pastBookings;
      
      case 'thisMonth': {
        const start = startOfMonth(now);
        const end = endOfMonth(now);
        return pastBookings.filter(booking => {
          const pickupTime = booking.pickupTime instanceof Timestamp 
            ? booking.pickupTime.toDate() 
            : new Date(booking.pickupTime);
          return pickupTime >= start && pickupTime <= end;
        });
      }
      
      case 'lastMonth': {
        const lastMonth = subMonths(now, 1);
        const start = startOfMonth(lastMonth);
        const end = endOfMonth(lastMonth);
        return pastBookings.filter(booking => {
          const pickupTime = booking.pickupTime instanceof Timestamp 
            ? booking.pickupTime.toDate() 
            : new Date(booking.pickupTime);
          return pickupTime >= start && pickupTime <= end;
        });
      }
      
      case 'last3Months': {
        const threeMonthsAgo = subMonths(now, 3);
        const start = startOfMonth(threeMonthsAgo);
        return pastBookings.filter(booking => {
          const pickupTime = booking.pickupTime instanceof Timestamp 
            ? booking.pickupTime.toDate() 
            : new Date(booking.pickupTime);
          return pickupTime >= start;
        });
      }
      
      case 'custom': {
        if (!dateRange?.from) return pastBookings;
        return pastBookings.filter(booking => {
          const pickupTime = booking.pickupTime instanceof Timestamp 
            ? booking.pickupTime.toDate() 
            : new Date(booking.pickupTime);
          const afterStart = pickupTime >= startOfDay(dateRange.from);
          const beforeEnd = !dateRange.to || pickupTime <= endOfDay(dateRange.to);
          return afterStart && beforeEnd;
        });
      }
      
      default:
        return pastBookings;
    }
  }, [pastBookings, pastDateFilter, dateRange]);

  const handleQuickFilter = (filterType: DateFilterType) => {
    setPastDateFilter(filterType);
    if (filterType !== 'custom') {
      setDateRange(undefined);
    }
  };

  // @ts-ignore
  const userRole = userProfile?.role;
  const showCreateButton = userRole === 'admin' || userRole === 'operator' || userRole === 'partner';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-headline">Bookings</h1>
            <p className="text-muted-foreground">
                Manage all company bookings from here.
            </p>
        </div>
        {showCreateButton && (
          <div className="flex items-center gap-2">
              <Button asChild>
                  <Link href="/dashboard/bookings/new">Create New Booking</Link>
              </Button>
          </div>
        )}
      </div>
      
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="current">
            Current Bookings ({currentBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past Bookings ({pastBookings.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="mt-6">
          <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Current Bookings</CardTitle>
                <CardDescription>Bookings from today onwards, grouped by day.</CardDescription>
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
              ) : <BookingsTable bookings={currentBookings} />}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="past" className="mt-6">
          <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Past Bookings</CardTitle>
                <CardDescription>All bookings before today, grouped by day.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Filter Buttons */}
              <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/50 rounded-lg border">
                <span className="text-sm font-medium text-muted-foreground mr-2">Filter by:</span>
                <Button
                  variant={pastDateFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleQuickFilter('all')}
                >
                  All Time
                </Button>
                <Button
                  variant={pastDateFilter === 'thisMonth' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleQuickFilter('thisMonth')}
                >
                  This Month
                </Button>
                <Button
                  variant={pastDateFilter === 'lastMonth' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleQuickFilter('lastMonth')}
                >
                  Last Month
                </Button>
                <Button
                  variant={pastDateFilter === 'last3Months' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleQuickFilter('last3Months')}
                >
                  Last 3 Months
                </Button>
                
                {/* Custom Date Range */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={pastDateFilter === 'custom' ? 'default' : 'outline'}
                      size="sm"
                      className={cn(
                        "gap-2",
                        pastDateFilter === 'custom' && "ring-2 ring-primary"
                      )}
                    >
                      <CalendarIcon className="h-4 w-4" />
                      Custom Range
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4" align="start">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Select Date Range</label>
                        <p className="text-xs text-muted-foreground">
                          Click to select start date, then click end date to complete the range.
                        </p>
                      </div>
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={(range) => {
                          setDateRange(range);
                          if (range?.from) {
                            setPastDateFilter('custom');
                          }
                        }}
                        numberOfMonths={2}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setDateRange(undefined);
                            setPastDateFilter('all');
                          }}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Active Filter Display */}
                {pastDateFilter === 'custom' && dateRange?.from && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-md text-sm border border-primary/20">
                    {format(dateRange.from, 'MMM d, yyyy')}
                    {dateRange.to && (
                      <>
                        {' - '}
                        {format(dateRange.to, 'MMM d, yyyy')}
                      </>
                    )}
                    <button
                      onClick={() => {
                        setDateRange(undefined);
                        setPastDateFilter('all');
                      }}
                      className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                
                <span className="ml-auto text-sm text-muted-foreground">
                  {filteredPastBookings.length} booking{filteredPastBookings.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Bookings Table */}
              {isLoading ? (
                  <div className="space-y-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full bg-muted" />
                      <Skeleton className="h-12 w-full bg-muted" />
                      <Skeleton className="h-12 w-full" />
                  </div>
              ) : <BookingsTable bookings={filteredPastBookings} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    
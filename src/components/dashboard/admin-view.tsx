
"use client";

import { useState, useMemo, useEffect } from "react";
import { DollarSign, Users, Book, Car } from "lucide-react";
import { StatsCard } from "./stats-card";
import { BookingsChart } from "./bookings-chart";
import BookingsTable from "./bookings-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import Link from "next/link";
import { Button } from "../ui/button";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, limit, Timestamp } from "firebase/firestore";
import type { Booking } from "@/lib/types";
import { subDays, subMonths, subWeeks, subYears, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval } from "date-fns";

type TimeRange = "Daily" | "Weekly" | "Monthly" | "Yearly";
type ChartData = { name: string; bookings: number; revenue: number };

export default function AdminView() {
  const [timeRange, setTimeRange] = useState<TimeRange>("Monthly");
  const firestore = useFirestore();
  
  const bookingsCollectionRef = useMemoFirebase(() => collection(firestore, 'bookings'), [firestore]);

  const recentBookingsQuery = useMemoFirebase(() => query(bookingsCollectionRef, orderBy('createdAt', 'desc'), limit(5)), [bookingsCollectionRef]);
  const { data: recentBookings } = useCollection<Booking>(recentBookingsQuery);

  const pendingBookingsQuery = useMemoFirebase(() => query(bookingsCollectionRef, where('status', '==', 'pending_admin')), [bookingsCollectionRef]);
  const { data: pendingBookings } = useCollection<Booking>(pendingBookingsQuery);
  
  const allBookingsQuery = useMemoFirebase(() => query(bookingsCollectionRef, orderBy('pickupTime', 'desc')), [bookingsCollectionRef]);
  const { data: allBookings } = useCollection<Booking>(allBookingsQuery);

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);

  useEffect(() => {
    if (!allBookings) return;

    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
        case "Daily":
            startDate = subDays(now, 1);
            break;
        case "Weekly":
            startDate = startOfWeek(subWeeks(now, 1));
            break;
        case "Monthly":
            startDate = startOfMonth(subMonths(now, 1));
            break;
        case "Yearly":
            startDate = startOfYear(subYears(now, 1));
            break;
        default:
            startDate = subMonths(now, 1);
    }
    
    const filteredBookings = allBookings.filter(booking => {
        const pickupDate = booking.pickupTime instanceof Timestamp ? booking.pickupTime.toDate() : new Date(booking.pickupTime);
        return pickupDate >= startDate && pickupDate <= now;
    });

    const newTotalBookings = filteredBookings.length;
    const newTotalRevenue = filteredBookings.reduce((sum, booking) => sum + booking.cost, 0);

    setTotalBookings(newTotalBookings);
    setTotalRevenue(newTotalRevenue);
    
    let processedData: { [key: string]: { bookings: number; revenue: number } } = {};

     if (timeRange === "Yearly") {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      processedData = monthNames.reduce((acc, month) => ({ ...acc, [month]: { bookings: 0, revenue: 0 } }), {});

      filteredBookings.forEach(booking => {
        const pickupDate = booking.pickupTime instanceof Timestamp ? booking.pickupTime.toDate() : new Date(booking.pickupTime);
        const month = format(pickupDate, "MMM");
        if (processedData[month]) {
            processedData[month].bookings++;
            processedData[month].revenue += booking.cost;
        }
      });
    } else if (timeRange === "Monthly") {
        const daysInMonth = eachDayOfInterval({ start: startDate, end: now });
        processedData = daysInMonth.reduce((acc, day) => ({ ...acc, [format(day, 'dd')]: { bookings: 0, revenue: 0 } }), {});

        filteredBookings.forEach(booking => {
            const pickupDate = booking.pickupTime instanceof Timestamp ? booking.pickupTime.toDate() : new Date(booking.pickupTime);
            const day = format(pickupDate, "dd");
             if (processedData[day]) {
                processedData[day].bookings++;
                processedData[day].revenue += booking.cost;
            }
        });
    } else if (timeRange === 'Weekly') {
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        processedData = weekDays.reduce((acc, day) => ({ ...acc, [day]: { bookings: 0, revenue: 0 } }), {});

        filteredBookings.forEach(booking => {
            const pickupDate = booking.pickupTime instanceof Timestamp ? booking.pickupTime.toDate() : new Date(booking.pickupTime);
            const dayOfWeek = format(pickupDate, "E");
            if (processedData[dayOfWeek]) {
                processedData[dayOfWeek].bookings++;
                processedData[dayOfWeek].revenue += booking.cost;
            }
        });
    } else if (timeRange === 'Daily') {
        processedData = Array.from({length: 24}, (_, i) => `${i.toString().padStart(2, '0')}:00`).reduce((acc, hour) => ({ ...acc, [hour]: { bookings: 0, revenue: 0 } }), {});
        filteredBookings.forEach(booking => {
            const pickupDate = booking.pickupTime instanceof Timestamp ? booking.pickupTime.toDate() : new Date(booking.pickupTime);
            const hour = `${format(pickupDate, "HH")}:00`;
             if (processedData[hour]) {
                processedData[hour].bookings++;
                processedData[hour].revenue += booking.cost;
            }
        });
    }


    const newChartData = Object.keys(processedData).map(key => ({
      name: key,
      bookings: processedData[key].bookings,
      revenue: processedData[key].revenue
    }));
    
    setChartData(newChartData);

  }, [allBookings, timeRange]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          description={`In the last ${timeRange.toLowerCase().slice(0, -2)}`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Total Bookings"
          value={totalBookings.toString()}
          description={`In the last ${timeRange.toLowerCase().slice(0, -2)}`}
          icon={<Book className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Active Drivers"
          value="23"
          description="+5 since last hour"
          icon={<Car className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="New Clients"
          value="57"
          description="+12 since last month"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4 shadow-md">
            <CardHeader className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="font-headline">Overview</CardTitle>
                  <CardDescription>
                    Bookings and revenue overview for the selected time range.
                  </CardDescription>
                </div>
                 <div className="flex items-center gap-2">
                    <Button variant={timeRange === 'Daily' ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange('Daily')}>Daily</Button>
                    <Button variant={timeRange === 'Weekly' ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange('Weekly')}>Weekly</Button>
                    <Button variant={timeRange === 'Monthly' ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange('Monthly')}>Monthly</Button>
                    <Button variant={timeRange === 'Yearly' ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange('Yearly')}>Yearly</Button>
                </div>
            </CardHeader>
            <CardContent>
                <BookingsChart data={chartData} />
            </CardContent>
        </Card>
         <Card className="col-span-1 lg:col-span-3 shadow-md">
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="font-headline">Recent Bookings</CardTitle>
                    <CardDescription>
                        You have {pendingBookings?.length || 0} pending bookings.
                    </CardDescription>
                </div>
                <Button asChild size="sm">
                    <Link href="/dashboard/bookings">View All</Link>
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            <BookingsTable bookings={recentBookings || []} isDashboard={true} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

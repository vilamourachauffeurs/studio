import { DollarSign, Users, Book, Car } from "lucide-react";
import { StatsCard } from "./stats-card";
import { BookingsChart } from "./bookings-chart";
import BookingsTable from "./bookings-table";
import { bookings } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import Link from "next/link";
import { Button } from "../ui/button";

export default function AdminView() {
  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value="$45,231.89"
          description="+20.1% from last month"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Total Bookings"
          value="2,350"
          description="+180.1% from last month"
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
            <CardHeader>
                <CardTitle className="font-headline">Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <BookingsChart />
            </CardContent>
        </Card>
         <Card className="col-span-1 lg:col-span-3 shadow-md">
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="font-headline">Recent Bookings</CardTitle>
                    <CardDescription>
                        You have {bookings.filter(b => b.status === 'pending_admin').length} pending bookings.
                    </CardDescription>
                </div>
                <Button asChild size="sm">
                    <Link href="/dashboard/bookings">View All</Link>
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            <BookingsTable bookings={recentBookings} isDashboard={true} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

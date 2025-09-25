import { DollarSign, Car, Star } from "lucide-react";
import { StatsCard } from "./stats-card";
import BookingsTable from "./bookings-table";
import { bookings, drivers } from "@/lib/data";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import Link from "next/link";

export default function DriverView() {
  const { user } = useAuth();
  const driver = drivers.find((d) => d.id === user?.id);
  const driverBookings = bookings.filter((b) => b.driverId === user?.id);
  const upcomingBookings = driverBookings
    .filter((b) => b.status === "assigned" || b.status === "confirmed")
    .slice(0, 5);

  return (
    <div className="space-y-6">
        <div>
            <h2 className="text-3xl font-headline">Hello, {user?.name}!</h2>
            <p className="text-muted-foreground">Here are your stats and upcoming jobs.</p>
        </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Last Month's Earnings"
          value={`$${driver?.performance?.lastMonthEarnings.toLocaleString() || '0'}`}
          description="Before commission"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Completed Jobs"
          value={driver?.performance?.completedJobs.toString() || '0'}
          description="All time"
          icon={<Car className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="On-Time Rate"
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
                      You have {upcomingBookings.filter(b => b.status === 'assigned').length} new jobs to confirm.
                  </CardDescription>
              </div>
              <Button asChild size="sm">
                  <Link href="/dashboard/bookings">View All</Link>
              </Button>
          </div>
        </CardHeader>
        <CardContent>
          <BookingsTable bookings={upcomingBookings} isDashboard={true} />
        </CardContent>
      </Card>
    </div>
  );
}

import { DollarSign, Book } from "lucide-react";
import { StatsCard } from "./stats-card";
import BookingsTable from "./bookings-table";
import { bookings } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import Link from "next/link";
import { useUser } from "@/firebase";

export default function PartnerView() {
  const { user } = useUser();
  const partnerBookings = bookings.filter(
    (b) => b.createdById === user?.uid
  );
  const recentBookings = partnerBookings.slice(0, 5);

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-3xl font-headline">Welcome, Partner!</h2>
                <p className="text-muted-foreground">Here's what's happening with your bookings.</p>
            </div>
            <Button>Create New Booking</Button>
        </div>
      <div className="grid gap-4 md:grid-cols-2">
        <StatsCard
          title="Total Bookings"
          value={partnerBookings.length.toString()}
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
                    {partnerBookings.filter(b => b.status === 'pending_admin').length} of your bookings are pending approval.
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
  );
}

import { Button } from "@/components/ui/button";
import BookingsTable from "@/components/dashboard/bookings-table";
import { bookings } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-headline">Bookings</h1>
            <p className="text-muted-foreground">
                Manage all company bookings from here.
            </p>
        </div>
        <Button>Create New Booking</Button>
      </div>
      <Card className="shadow-lg">
          <CardHeader>
              <CardTitle>All Bookings</CardTitle>
              <CardDescription>A list of all bookings in the system.</CardDescription>
          </CardHeader>
          <CardContent>
             <BookingsTable bookings={bookings} />
          </CardContent>
      </Card>
    </div>
  );
}

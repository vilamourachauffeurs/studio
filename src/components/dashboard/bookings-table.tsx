"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  MoreHorizontal,
  CheckCircle,
  XCircle,
  User,
  Clock,
  Car,
  Rocket,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/firebase";
import type { Booking, BookingStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AssignDriverDialog } from "./assign-driver-dialog";
import { useToast } from "@/hooks/use-toast";
import { getNotesSummary } from "@/lib/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { doc, getDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";

const statusStyles: Record<BookingStatus, string> = {
  draft: "bg-gray-200 text-gray-800",
  pending_admin: "bg-yellow-200 text-yellow-800",
  approved: "bg-blue-200 text-blue-800",
  assigned: "bg-purple-200 text-purple-800",
  confirmed: "bg-green-200 text-green-800",
  in_progress: "bg-indigo-200 text-indigo-800",
  completed: "bg-primary/20 text-primary",
  cancelled: "bg-red-200 text-red-800",
};

function BookingActions({ booking }: { booking: Booking }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (user && firestore) {
      const userDocRef = doc(firestore, "users", user.uid);
      getDoc(userDocRef).then(docSnap => {
          if (docSnap.exists()) {
              setUserRole(docSnap.data().role);
          }
      })
    }
  }, [user, firestore]);


  const handleSummarize = async () => {
    setIsSummarizing(true);
    setSummary(null);
    const result = await getNotesSummary({ notes: booking.notes });
    if (result.success) {
      setSummary(result.data.summary);
      toast({
        title: "Summary Generated",
        description: "AI has summarized the client notes.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
    setIsSummarizing(false);
  };

  if (!user || !userRole) return null;

  return (
    <>
      <AssignDriverDialog
        booking={booking}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(booking.id)}>
            Copy Booking ID
          </DropdownMenuItem>

          {userRole === "admin" && (
            <>
              {booking.status === "pending_admin" && (
                <DropdownMenuItem>
                  <CheckCircle className="mr-2 h-4 w-4" /> Approve
                </DropdownMenuItem>
              )}
              {booking.status === "approved" && (
                <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                  <Car className="mr-2 h-4 w-4" /> Assign Driver
                </DropdownMenuItem>
              )}
              {booking.notes && (
                <DropdownMenuItem onClick={handleSummarize} disabled={isSummarizing}>
                  <Rocket className="mr-2 h-4 w-4" />{" "}
                  {isSummarizing ? "Summarizing..." : "Summarize Notes"}
                </DropdownMenuItem>
              )}
            </>
          )}

          {userRole === "driver" && booking.driverId === user.uid && (
            <>
              {booking.status === "assigned" && (
                <DropdownMenuItem>
                  <CheckCircle className="mr-2 h-4 w-4" /> Accept Job
                </DropdownMenuItem>
              )}
              {booking.status === "assigned" && (
                <DropdownMenuItem className="text-destructive">
                  <XCircle className="mr-2 h-4 w-4" /> Decline Job
                </DropdownMenuItem>
              )}
              {booking.status === "confirmed" && (
                <DropdownMenuItem>
                  <Clock className="mr-2 h-4 w-4" /> Start Job
                </DropdownMenuItem>
              )}
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" /> View Client
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
       {summary && (
        <Alert className="mt-2">
            <AlertTitle className="font-headline">AI Summary</AlertTitle>
            <AlertDescription>{summary}</AlertDescription>
        </Alert>
      )}
    </>
  );
}

export default function BookingsTable({
  bookings,
  isDashboard = false,
}: {
  bookings: Booking[];
  isDashboard?: boolean;
}) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (user && firestore) {
      const userDocRef = doc(firestore, "users", user.uid);
      getDoc(userDocRef).then(docSnap => {
          if (docSnap.exists()) {
              setUserRole(docSnap.data().role);
          }
      })
    }
  }, [user, firestore]);

  const filteredBookings =
    userRole === "admin"
      ? bookings
      : bookings.filter((b) => {
          if (userRole === "partner") return b.createdById === user?.uid;
          if (userRole === "driver") return b.driverId === user?.uid;
          return false;
        });

  if (filteredBookings.length === 0) {
    return <div className="text-center text-muted-foreground py-8">No bookings found.</div>
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead className={cn(isDashboard && "hidden md:table-cell")}>Pickup</TableHead>
            <TableHead className={cn(isDashboard && "hidden lg:table-cell")}>Date & Time</TableHead>
            {!isDashboard && <TableHead>Driver</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredBookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell>
                <div className="font-medium">{booking.client?.name}</div>
                <div className="text-sm text-muted-foreground hidden md:inline">
                  {booking.client?.company}
                </div>
              </TableCell>
              <TableCell className={cn(isDashboard && "hidden md:table-cell")}>{booking.pickupLocation}</TableCell>
              <TableCell className={cn(isDashboard && "hidden lg:table-cell")}>
                {format(booking.pickupTime, "EEE, MMM d, yyyy @ h:mm a")}
              </TableCell>
              {!isDashboard && (
                <TableCell>{booking.driver?.name || "Unassigned"}</TableCell>
              )}
              <TableCell>
                <Badge
                  className={cn("capitalize", statusStyles[booking.status])}
                  variant="outline"
                >
                  {booking.status.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell>
                <BookingActions booking={booking} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

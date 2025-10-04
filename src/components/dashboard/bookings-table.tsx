
"use client";

import { useState, useMemo } from "react";
import {
  MoreHorizontal,
  CheckCircle,
  XCircle,
  User,
  Clock,
  Car,
  Rocket,
  Eye,
  Users,
} from "lucide-react";
import { format, isSameDay } from "date-fns";

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
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import type { Booking, BookingStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AssignDriverDialog } from "./assign-driver-dialog";
import { useToast } from "@/hooks/use-toast";
import { getNotesSummary } from "@/lib/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Timestamp } from "firebase/firestore";

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
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => user ? doc(firestore, `users/${user.uid}`) : null, [user, firestore]);
  const { data: userProfile } = useDoc(userDocRef);

  const userRole = userProfile ? (userProfile as any).role : null;

  const handleSummarize = async () => {
    if (!booking.notes) return;
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
          <DropdownMenuItem onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}>
            <Eye className="mr-2 h-4 w-4" /> View Details
          </DropdownMenuItem>
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

const toDate = (timestamp: Timestamp | Date): Date => {
    return timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
};

export default function BookingsTable({
  bookings,
}: {
  bookings: Booking[];
}) {
  const router = useRouter();

  const handleRowClick = (bookingId: string) => {
    router.push(`/dashboard/bookings/${bookingId}`);
  };

  const groupedBookings = useMemo(() => {
    if (!bookings || bookings.length === 0) return [];
    
    return bookings.reduce((acc, booking) => {
      const bookingDate = toDate(booking.pickupTime);
      const dateStr = format(bookingDate, 'yyyy-MM-dd');
      const existingGroup = acc.find(group => group.date === dateStr);
      if (existingGroup) {
        existingGroup.bookings.push(booking);
      } else {
        acc.push({ date: dateStr, bookings: [booking] });
      }
      return acc;
    }, [] as { date: string, bookings: Booking[] }[]);
  }, [bookings]);

  if (groupedBookings.length === 0) {
    return <div className="text-center text-muted-foreground py-8">No bookings found for the selected status.</div>
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead style={{ width: '150px' }}>Date / Time</TableHead>
            <TableHead>Pickup</TableHead>
            <TableHead>Drop-off</TableHead>
            <TableHead style={{ width: '100px' }}>PAX</TableHead>
            <TableHead style={{ width: '150px' }}>Status</TableHead>
            <TableHead style={{ width: '80px' }}><span className="sr-only">Actions</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedBookings.map((group, groupIndex) => (
            group.bookings.map((booking) => {
              const isEvenDay = groupIndex % 2 === 0;
              const pickupDate = toDate(booking.pickupTime);

              return (
                <TableRow
                  key={booking.id}
                  onClick={() => handleRowClick(booking.id)}
                  className={cn("cursor-pointer", isEvenDay ? "bg-card" : "bg-muted")}
                >
                  <TableCell>
                    <div className="font-medium">{format(pickupDate, "dd/MM")}</div>
                    <div className="text-sm text-muted-foreground">{format(pickupDate, "HH:mm")}</div>
                  </TableCell>
                  <TableCell>{booking.pickupLocation}</TableCell>
                  <TableCell>{booking.dropoffLocation}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{booking.pax}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn("capitalize", statusStyles[booking.status])}
                      variant="outline"
                    >
                      {booking.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <BookingActions booking={booking} />
                  </TableCell>
                </TableRow>
              );
            })
          ))}
        </TableBody>
      </Table>
    </div>
  );
}



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
  Pencil,
  Filter,
  Calendar as CalendarIcon,
  Zap,
} from "lucide-react";
import { format, isSameDay, startOfDay } from "date-fns";

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
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import type { Booking, BookingStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AssignDriverDialog } from "./assign-driver-dialog";
import { ChangeStatusDialog } from "./change-status-dialog";
import { useToast } from "@/hooks/use-toast";
import { getNotesSummary } from "@/lib/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Timestamp } from "firebase/firestore";
import { Input } from "../ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { Calendar } from "../ui/calendar";

const ALL_STATUSES: BookingStatus[] = [
    "draft",
    "pending_admin",
    "approved",
    "assigned",
    "confirmed",
    "in_progress",
    "completed",
    "cancelled",
];

const DEFAULT_FILTER: BookingStatus[] = [
    "pending_admin",
    "approved",
    "assigned",
    "confirmed",
    "in_progress"
];


const statusStyles: Record<BookingStatus, string> = {
  draft: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  pending_admin: "bg-yellow-200 text-yellow-800 hover:bg-yellow-300",
  approved: "bg-blue-200 text-blue-800 hover:bg-blue-300",
  assigned: "bg-purple-200 text-purple-800 hover:bg-purple-300",
  confirmed: "bg-green-200 text-green-800 hover:bg-green-300",
  in_progress: "bg-indigo-200 text-indigo-800 hover:bg-indigo-300",
  completed: "bg-primary/20 text-primary hover:bg-primary/30",
  cancelled: "bg-red-200 text-red-800 hover:bg-red-300",
};

function BookingActions({ booking }: { booking: Booking }) {
  const { user } = useUser();
  const firestore = useFirestore();
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

function BookingTableRow({ booking, isEvenDay }: { booking: Booking; isEvenDay: boolean }) {
  const router = useRouter();
  const [isAssignDriverOpen, setIsAssignDriverOpen] = useState(false);
  const [isChangeStatusOpen, setIsChangeStatusOpen] = useState(false);

  const handleRowClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    const target = e.target as HTMLElement;
    // Prevent navigation if a button or interactive element within the row was clicked
    if (target.closest('button, [role="button"], a, [role="menuitemcheckbox"], [role="menuitem"]')) {
        return;
    }
    router.push(`/dashboard/bookings/${booking.id}`);
  };

  const pickupDate = toDate(booking.pickupTime);

  return (
    <>
      <AssignDriverDialog booking={booking} open={isAssignDriverOpen} onOpenChange={setIsAssignDriverOpen} />
      <ChangeStatusDialog booking={booking} open={isChangeStatusOpen} onOpenChange={setIsChangeStatusOpen} />
      <TableRow
        onClick={handleRowClick}
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
        <TableCell onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
                <Badge
                    onClick={() => setIsChangeStatusOpen(true)}
                    className={cn("capitalize cursor-pointer", statusStyles[booking.status])}
                    variant="outline"
                >
                    <Pencil className="mr-2 h-3 w-3" />
                    {booking.status.replace(/_/g, " ")}
                </Badge>
                {booking.bookingType === 'rightNow' && (
                     <Badge variant="destructive" className="animate-pulse">
                        <Zap className="mr-1 h-3 w-3" />
                        URGENT
                    </Badge>
                )}
            </div>
        </TableCell>
        <TableCell onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            {booking.status === 'approved' && (
              <Button size="sm" variant="outline" onClick={() => setIsAssignDriverOpen(true)}>
                <Car className="mr-2 h-4 w-4" />
                Assign
              </Button>
            )}
            <BookingActions booking={booking} />
          </div>
        </TableCell>
      </TableRow>
    </>
  );
}


export default function BookingsTable({
  bookings,
}: {
  bookings: Booking[];
}) {
    const [statusFilter, setStatusFilter] = useState<BookingStatus[]>(DEFAULT_FILTER);
    const [pickupFilter, setPickupFilter] = useState<string>("");
    const [dropoffFilter, setDropoffFilter] = useState<string>("");
    const [paxFilter, setPaxFilter] = useState<string>("");
    const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

    const filterSuggestions = useMemo(() => {
        const today = startOfDay(new Date());
        const futureBookings = bookings.filter(b => toDate(b.pickupTime) >= today);

        const uniquePickups = [...new Set(futureBookings.map(b => b.pickupLocation))];
        const uniqueDropoffs = [...new Set(futureBookings.map(b => b.dropoffLocation))];
        const uniquePax = [...new Set(futureBookings.map(b => b.pax.toString()))].sort((a,b) => parseInt(a) - parseInt(b));

        return {
            pickups: uniquePickups,
            dropoffs: uniqueDropoffs,
            pax: uniquePax,
        };
    }, [bookings]);


    const filteredBookings = useMemo(() => {
        if (!bookings) return [];
        return bookings.filter(booking => {
            const bookingDate = toDate(booking.pickupTime);
            const statusMatch = statusFilter.length === 0 ? true : statusFilter.includes(booking.status);
            const pickupMatch = !pickupFilter || booking.pickupLocation.toLowerCase().includes(pickupFilter.toLowerCase());
            const dropoffMatch = !dropoffFilter || booking.dropoffLocation.toLowerCase().includes(dropoffFilter.toLowerCase());
            const paxMatch = !paxFilter || booking.pax.toString() === paxFilter;
            const dateMatch = !dateFilter || isSameDay(bookingDate, dateFilter);

            return statusMatch && pickupMatch && dropoffMatch && paxMatch && dateMatch;
        });
    }, [bookings, statusFilter, pickupFilter, dropoffFilter, paxFilter, dateFilter]);

    const toggleStatusFilter = (status: BookingStatus) => {
        setStatusFilter(prev =>
            prev.includes(status)
            ? prev.filter(s => s !== status)
            : [...prev, status]
        );
    };

    const groupedBookings = useMemo(() => {
        if (!filteredBookings || filteredBookings.length === 0) return [];
        
        return filteredBookings.reduce((acc, booking) => {
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
    }, [filteredBookings]);

  if (bookings.length === 0) {
    return <div className="text-center text-muted-foreground py-8">No bookings created yet.</div>
  }


  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead style={{ width: '150px' }}>
                <div className="flex items-center gap-2">
                    Date / Time
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className={cn("h-6 w-6", dateFilter && "text-primary")}>
                                <Filter className="h-4 w-4"/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                             <Calendar
                                mode="single"
                                selected={dateFilter}
                                onSelect={setDateFilter}
                                initialFocus
                            />
                             {dateFilter && <div className="p-2 border-t"><Button variant="outline" size="sm" className="w-full" onClick={() => setDateFilter(undefined)}>Clear Filter</Button></div>}
                        </PopoverContent>
                    </Popover>
                </div>
            </TableHead>
            <TableHead>
                <div className="flex items-center gap-2">
                    Pickup
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className={cn("h-6 w-6", pickupFilter && "text-primary")}>
                                <Filter className="h-4 w-4"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent onClick={(e) => e.stopPropagation()} className="p-2">
                            <Input 
                                placeholder="Filter by pickup..."
                                value={pickupFilter}
                                onChange={(e) => setPickupFilter(e.target.value)}
                                className="w-48 mb-2"
                            />
                             {filterSuggestions.pickups.map(p => (
                                <DropdownMenuItem key={p} onSelect={() => setPickupFilter(p)}>{p}</DropdownMenuItem>
                            ))}
                            {pickupFilter && <DropdownMenuItem onClick={() => setPickupFilter("")} className="text-destructive">Clear Filter</DropdownMenuItem>}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </TableHead>
            <TableHead>
                 <div className="flex items-center gap-2">
                    Drop-off
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className={cn("h-6 w-6", dropoffFilter && "text-primary")}>
                                <Filter className="h-4 w-4"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent onClick={(e) => e.stopPropagation()} className="p-2">
                            <Input 
                                placeholder="Filter by dropoff..."
                                value={dropoffFilter}
                                onChange={(e) => setDropoffFilter(e.target.value)}
                                className="w-48 mb-2"
                            />
                            {filterSuggestions.dropoffs.map(d => (
                                <DropdownMenuItem key={d} onSelect={() => setDropoffFilter(d)}>{d}</DropdownMenuItem>
                            ))}
                             {dropoffFilter && <DropdownMenuItem onClick={() => setDropoffFilter("")} className="text-destructive">Clear Filter</DropdownMenuItem>}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </TableHead>
            <TableHead style={{ width: '100px' }}>
                <div className="flex items-center gap-2">
                        PAX
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className={cn("h-6 w-6", paxFilter && "text-primary")}>
                                    <Filter className="h-4 w-4"/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent onClick={(e) => e.stopPropagation()} className="p-2">
                                {filterSuggestions.pax.map(p => (
                                    <DropdownMenuItem key={p} onSelect={() => setPaxFilter(p)}>{p}</DropdownMenuItem>
                                ))}
                                {paxFilter && <DropdownMenuItem onClick={() => setPaxFilter("")} className="text-destructive">Clear Filter</DropdownMenuItem>}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
            </TableHead>
            <TableHead style={{ width: '180px' }}>
                 <div className="flex items-center gap-2">
                    Status
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className={cn("h-6 w-6", statusFilter.length !== DEFAULT_FILTER.length && "text-primary")}>
                                <Filter className="h-4 w-4"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                            {ALL_STATUSES.map(status => (
                            <DropdownMenuCheckboxItem
                                key={status}
                                checked={statusFilter.includes(status)}
                                onCheckedChange={() => toggleStatusFilter(status)}
                                onSelect={(e) => e.preventDefault()}
                                className="capitalize"
                            >
                                {status.replace(/_/g, ' ')}
                            </DropdownMenuCheckboxItem>
                            ))}
                             <DropdownMenuSeparator />
                             <DropdownMenuItem onClick={() => setStatusFilter(DEFAULT_FILTER)}>Reset to Default</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => setStatusFilter([])}>Clear All</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                 </div>
            </TableHead>
            <TableHead style={{ width: '150px' }}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
            {groupedBookings.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground h-32">
                        No bookings found for the selected filters.
                    </TableCell>
                </TableRow>
            )}
          {groupedBookings.map((group, groupIndex) => (
            group.bookings.map((booking) => (
               <BookingTableRow key={booking.id} booking={booking} isEvenDay={groupIndex % 2 === 0} />
            ))
          ))}
        </TableBody>
      </Table>
    </div>
  );
}



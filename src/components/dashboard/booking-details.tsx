
"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Car,
  Clock,
  Euro,
  FilePen,
  FileSignature,
  Flag,
  MapPin,
  MoreVertical,
  Pencil,
  StickyNote,
  User,
  Users,
  XCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge";
import type { Booking, BookingStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";
import { AssignDriverDialog } from "./assign-driver-dialog";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { updateBookingStatus } from "@/lib/actions";
import { ChangeStatusDialog } from "./change-status-dialog";

const statusStyles: Record<BookingStatus, string> = {
    draft: "border-gray-300 bg-gray-200 text-gray-800",
    pending_admin: "border-yellow-300 bg-yellow-200 text-yellow-800",
    approved: "border-blue-300 bg-blue-200 text-blue-800",
    assigned: "border-purple-300 bg-purple-200 text-purple-800",
    confirmed: "border-green-300 bg-green-200 text-green-800",
    in_progress: "border-indigo-300 bg-indigo-200 text-indigo-800",
    completed: "border-primary/30 bg-primary/20 text-primary",
    cancelled: "border-red-300 bg-red-200 text-red-800",
};

const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    }
    return new Date(timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};


function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  const Icon = icon;
  return (
    <div className="flex items-start">
      <div className="flex items-center w-40">
        <Icon className="h-5 w-5 mr-3 text-muted-foreground" />
        <span className="font-medium">{label}</span>
      </div>
      <div className="flex-1 text-muted-foreground">{value}</div>
    </div>
  );
}

export default function BookingDetails({ booking }: { booking: Booking }) {
    const router = useRouter();
    const { toast } = useToast();
    const [isAssignDriverOpen, setIsAssignDriverOpen] = useState(false);
    const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);
    const [isChangeStatusOpen, setIsChangeStatusOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);


    const handleCancelBooking = async () => {
        setIsCancelling(true);
        const result = await updateBookingStatus(booking.id, "cancelled");
        setIsCancelling(false);
        if (result.success) {
            toast({ title: "Booking Cancelled", description: `Booking #${booking.id.substring(0,7)} has been cancelled.`});
            setIsCancelAlertOpen(false);
            router.refresh(); // Re-fetches data on the page
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
    }


  return (
    <div className="space-y-6">
        <AssignDriverDialog booking={booking} open={isAssignDriverOpen} onOpenChange={setIsAssignDriverOpen} />
        <ChangeStatusDialog booking={booking} open={isChangeStatusOpen} onOpenChange={setIsChangeStatusOpen} />
         <AlertDialog open={isCancelAlertOpen} onOpenChange={setIsCancelAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently cancel the booking.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Dismiss</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancelBooking} disabled={isCancelling}>
                    {isCancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Continue
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
                 <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
                <div>
                    <h1 className="text-3xl font-headline flex items-center gap-4">
                        <span>Booking #{booking.id.substring(0, 7)}</span>
                         <div className={cn("flex items-center rounded-full border text-base font-medium overflow-hidden", statusStyles[booking.status])}>
                            <span className="capitalize px-3 py-1">{booking.status.replace("_", " ")}</span>
                             <div className="h-full w-px bg-current opacity-40"></div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-none hover:bg-black/10"
                                onClick={() => setIsChangeStatusOpen(true)}
                            >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Change Status</span>
                            </Button>
                         </div>
                    </h1>
                    <p className="text-muted-foreground">
                        Created on {formatTimestamp(booking.createdAt)}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => router.push(`/dashboard/bookings/${booking.id}/edit`)}><FilePen className="mr-2" /> Edit Booking</Button>
                <Button onClick={() => setIsAssignDriverOpen(true)}><Car className="mr-2"/> Assign Driver</Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <MoreVertical />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-destructive" onClick={() => setIsCancelAlertOpen(true)}>
                             <XCircle className="mr-2"/>
                            <span>Cancel Booking</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 shadow-lg">
                <CardHeader>
                    <CardTitle>Journey Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <InfoRow icon={MapPin} label="Pickup" value={booking.pickupLocation} />
                    <InfoRow icon={MapPin} label="Dropoff" value={booking.dropoffLocation} />
                    <InfoRow icon={Clock} label="Pickup Time" value={formatTimestamp(booking.pickupTime)} />
                </CardContent>
            </Card>
             <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Passenger & Payment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <InfoRow icon={User} label="Client" value={booking.clientName || 'N/A'} />
                    <InfoRow icon={Users} label="Passengers" value={booking.pax} />
                    <InfoRow icon={Euro} label="Cost" value={`€${booking.cost.toFixed(2)}`} />
                     <InfoRow icon={FileSignature} label="Payment" value={<span className="capitalize">{booking.paymentType}</span>} />
                </CardContent>
            </Card>
        </div>
         <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Internal Details</CardTitle>
            </CardHeader>
             <CardContent className="space-y-4">
                 <InfoRow icon={StickyNote} label="Notes" value={booking.notes || 'No notes provided.'} />
                 <Separator />
                 <InfoRow icon={FileSignature} label="Requested By" value={booking.requestedBy || 'N/A'} />
                 <InfoRow icon={Car} label="Assigned Driver" value={booking.driver?.name || 'Unassigned'} />
             </CardContent>
         </Card>
    </div>
  );
}

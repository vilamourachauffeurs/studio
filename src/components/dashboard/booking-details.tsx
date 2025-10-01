
"use client";

import {
  Car,
  ChevronDown,
  Clock,
  Euro,
  FilePen,
  FileSignature,
  Flag,
  MapPin,
  MoreVertical,
  StickyNote,
  User,
  Users,
  XCircle,
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
import { Badge } from "@/components/ui/badge";
import type { Booking, BookingStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";

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
  return (
    <div className="space-y-6">
        <div className="flex items-start justify-between">
            <div>
                <h1 className="text-3xl font-headline flex items-center gap-4">
                    <span>Booking #{booking.id.substring(0, 7)}</span>
                     <Badge
                        className={cn("capitalize text-base", statusStyles[booking.status])}
                        variant="outline"
                        >
                        {booking.status.replace("_", " ")}
                    </Badge>
                </h1>
                <p className="text-muted-foreground">
                    Created on {formatTimestamp(booking.createdAt)}
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline"><FilePen className="mr-2" /> Edit Booking</Button>
                <Button><Car className="mr-2"/> Assign Driver</Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <MoreVertical />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                            <Flag className="mr-2"/>
                            <span>Change Status</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
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

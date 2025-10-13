
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { Booking, BookingStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useFirestore } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";

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


type ChangeStatusDialogProps = {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChangeStatusDialog({
  booking,
  open,
  onOpenChange,
}: ChangeStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus>(booking.status);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();


  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const bookingRef = doc(firestore, "bookings", booking.id);
      await updateDoc(bookingRef, { status: selectedStatus });
      
      toast({
        title: "Status Updated",
        description: `Booking status changed to ${selectedStatus.replace("_", " ")}.`,
      });
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      console.error("Error updating booking status:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update booking status.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Change Booking Status</DialogTitle>
          <DialogDescription>
            Update the status for booking #{booking.id.substring(0,7)}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="status">New Status</Label>
            <Select
              onValueChange={(value) => setSelectedStatus(value as BookingStatus)}
              defaultValue={selectedStatus}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                {ALL_STATUSES.map((status) => (
                  <SelectItem key={status} value={status} className="capitalize">
                    {status.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleUpdate} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Status
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


"use client";

import { useState, useEffect } from "react";
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
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Rocket } from "lucide-react";
import type { Booking, Driver } from "@/lib/types";
import { getDriverSuggestion } from "@/lib/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, updateDoc } from "firebase/firestore";

type AssignDriverDialogProps = {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AssignDriverDialog({
  booking,
  open,
  onOpenChange,
}: AssignDriverDialogProps) {
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<{
    driverId: string;
    reason: string;
  } | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();

  const driversCollectionRef = useMemoFirebase(() => collection(firestore, 'drivers'), [firestore]);
  const { data: drivers, isLoading: driversLoading } = useCollection<Driver>(driversCollectionRef);

  useEffect(() => {
    if (booking.driverId) {
      setSelectedDriverId(booking.driverId);
    }
  }, [booking]);

  const handleSuggestion = async () => {
    setIsLoading(true);
    setSuggestion(null);
    const result = await getDriverSuggestion({
      bookingId: booking.id,
      pickupLocation: booking.pickupLocation,
      dropoffLocation: booking.dropoffLocation,
      pickupTime: typeof booking.pickupTime === 'string' ? booking.pickupTime : booking.pickupTime.toISOString(),
      notes: booking.notes,
    });
    setIsLoading(false);

    if (result.success) {
      setSuggestion(result.data);
      setSelectedDriverId(result.data.driverId);
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleAssign = async () => {
    if (!selectedDriverId) {
        toast({
            title: "No driver selected",
            description: "Please select a driver to assign to the booking.",
            variant: "destructive",
        });
        return;
    }
    
    const bookingRef = doc(firestore, 'bookings', booking.id);
    const driver = drivers?.find(d => d.id === selectedDriverId);
    const driverName = driver?.name || 'The selected driver';

    try {
        await updateDoc(bookingRef, {
            driverId: selectedDriverId,
            status: 'assigned',
            // Clear out other assignments
            partnerId: null, 
            operatorId: null
        });
        
        toast({
            title: "Driver Assigned!",
            description: `${driverName} has been assigned to booking #${booking.id.substring(0,7)}.`
        });
        onOpenChange(false);
    } catch (error) {
        console.error("Error assigning driver:", error);
        toast({
            title: "Error",
            description: "There was a problem assigning the driver.",
            variant: "destructive"
        })
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Assign Driver to Booking</DialogTitle>
          <DialogDescription>
            Assign a driver to booking #{booking.id.substring(0,7)}. Use our AI to get a
            driver suggestion.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="driver">Select Driver</Label>
            <Select
              onValueChange={setSelectedDriverId}
              value={selectedDriverId || undefined}
            >
              <SelectTrigger id="driver">
                <SelectValue placeholder="Select a driver to assign" />
              </SelectTrigger>
              <SelectContent>
                {driversLoading ? (
                    <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                ) : (
                    <SelectGroup>
                        <SelectLabel>Drivers</SelectLabel>
                        {drivers?.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                            {driver.name} - ({driver.status})
                        </SelectItem>
                        ))}
                    </SelectGroup>
                )}
              </SelectContent>
            </Select>
          </div>
          {suggestion && (
            <Alert>
                <Rocket className="h-4 w-4" />
              <AlertTitle className="font-headline">AI Suggestion</AlertTitle>
              <AlertDescription>
                <strong>Reason:</strong> {suggestion.reason}
              </AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline"
            onClick={handleSuggestion}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Rocket className="mr-2 h-4 w-4" />
            )}
            Suggest Driver
          </Button>
          <Button onClick={handleAssign}>Assign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

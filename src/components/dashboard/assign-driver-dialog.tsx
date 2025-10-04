
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
import { Loader2, Rocket } from "lucide-react";
import type { Booking, Driver } from "@/lib/types";
import { drivers } from "@/lib/data";
import { getDriverSuggestion } from "@/lib/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

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
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<{
    driverId: string;
    reason: string;
  } | null>(null);
  const { toast } = useToast();

  const handleSuggestion = async () => {
    setIsLoading(true);
    setSuggestion(null);
    const result = await getDriverSuggestion({
      pickupLocation: booking.pickupLocation,
      dropoffLocation: booking.dropoffLocation,
      pickupTime: typeof booking.pickupTime === 'string' ? booking.pickupTime : booking.pickupTime.toISOString(),
      notes: booking.notes,
    });
    setIsLoading(false);

    if (result.success) {
      setSuggestion(result.data);
      setSelectedDriver(result.data.driverId);
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleAssign = () => {
    if (!selectedDriver) {
        toast({
            title: "No driver selected",
            description: "Please select a driver to assign.",
            variant: "destructive",
        });
        return;
    }
    // Here you would typically call an action to update the booking
    toast({
        title: "Driver Assigned!",
        description: `${drivers.find(d => d.id === selectedDriver)?.name} has been assigned to booking #${booking.bookingId}.`
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Assign Driver</DialogTitle>
          <DialogDescription>
            Assign a driver to booking #{booking.bookingId}. Use our AI to get a
            suggestion.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="driver">Select Driver</Label>
            <Select
              onValueChange={setSelectedDriver}
              value={selectedDriver || undefined}
            >
              <SelectTrigger id="driver">
                <SelectValue placeholder="Select a driver" />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.name} - ({driver.status})
                  </SelectItem>
                ))}
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
            Suggest with AI
          </Button>
          <Button onClick={handleAssign}>Assign Driver</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

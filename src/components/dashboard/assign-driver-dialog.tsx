
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
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Rocket } from "lucide-react";
import type { Booking, Driver, Partner, Operator } from "@/lib/types";
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
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<{
    driverId: string;
    reason: string;
  } | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();

  const driversCollectionRef = useMemoFirebase(() => collection(firestore, 'drivers'), [firestore]);
  const { data: drivers, isLoading: driversLoading } = useCollection<Driver>(driversCollectionRef);

  const partnersCollectionRef = useMemoFirebase(() => collection(firestore, 'partners'), [firestore]);
  const { data: partners, isLoading: partnersLoading } = useCollection<Partner>(partnersCollectionRef);
  
  const operatorsCollectionRef = useMemoFirebase(() => collection(firestore, 'operators'), [firestore]);
  const { data: operators, isLoading: operatorsLoading } = useCollection<Operator>(operatorsCollectionRef);


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
      setSelectedEntity(`driver_${result.data.driverId}`);
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleAssign = async () => {
    if (!selectedEntity) {
        toast({
            title: "No selection made",
            description: "Please select a driver or partner to assign.",
            variant: "destructive",
        });
        return;
    }
    
    const [type, id] = selectedEntity.split('_');
    const bookingRef = doc(firestore, 'bookings', booking.id);
    let entityName = "Unknown";

    try {
        if (type === 'driver') {
            const driver = drivers?.find(d => d.id === id);
            entityName = driver?.name || 'Driver';
            await updateDoc(bookingRef, { driverId: id, partnerId: null, status: 'assigned' });
        } else if (type === 'partner') {
            const partner = partners?.find(p => p.id === id);
            entityName = partner?.name || 'Partner';
            await updateDoc(bookingRef, { partnerId: id, driverId: null, status: 'assigned' });
        } else if (type === 'operator') {
            const operator = operators?.find(o => o.id === id);
            entityName = operator?.name || 'Operator';
            // Assuming operators are treated like partners for assignment
            await updateDoc(bookingRef, { partnerId: id, driverId: null, status: 'assigned' });
        }
        
        toast({
            title: `${type.charAt(0).toUpperCase() + type.slice(1)} Assigned!`,
            description: `${entityName} has been assigned to booking #${booking.id.substring(0,7)}.`
        });
        onOpenChange(false);
    } catch (error) {
        console.error("Error assigning entity:", error);
        toast({
            title: "Error",
            description: "There was a problem assigning the entity.",
            variant: "destructive"
        })
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Assign to Booking</DialogTitle>
          <DialogDescription>
            Assign a driver or partner to booking #{booking.id.substring(0,7)}. Use our AI to get a
            driver suggestion.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="entity">Select Driver or Partner</Label>
            <Select
              onValueChange={setSelectedEntity}
              value={selectedEntity || undefined}
            >
              <SelectTrigger id="entity">
                <SelectValue placeholder="Select a driver, operator, or partner" />
              </SelectTrigger>
              <SelectContent>
                {driversLoading || partnersLoading || operatorsLoading ? (
                    <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                ) : (
                    <>
                        <SelectGroup>
                            <SelectLabel>Drivers</SelectLabel>
                            {drivers?.map((driver) => (
                            <SelectItem key={driver.id} value={`driver_${driver.id}`}>
                                {driver.name} - ({driver.status})
                            </SelectItem>
                            ))}
                        </SelectGroup>
                        <SelectGroup>
                            <SelectLabel>Operators</SelectLabel>
                            {operators?.map((operator) => (
                            <SelectItem key={operator.id} value={`operator_${operator.id}`}>
                                {operator.name}
                            </SelectItem>
                            ))}
                        </SelectGroup>
                        <SelectGroup>
                            <SelectLabel>Partners</SelectLabel>
                            {partners?.map((partner) => (
                            <SelectItem key={partner.id} value={`partner_${partner.id}`}>
                                {partner.name}
                            </SelectItem>
                            ))}
                        </SelectGroup>
                    </>
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

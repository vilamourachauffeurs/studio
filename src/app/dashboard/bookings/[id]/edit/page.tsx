
"use client";

import { useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, setHours, setMinutes } from "date-fns";
import { CalendarIcon, Euro, Users, Briefcase, MapPin, User, FileSignature } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useMemoFirebase, useUser, useDoc, useCollection } from "@/firebase";
import { collection, serverTimestamp, doc, updateDoc, Timestamp } from "firebase/firestore";
import type { Partner, Booking } from "@/lib/types";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const bookingFormSchema = z.object({
  pickupLocation: z.string().min(1, "Pickup location is required."),
  dropoffLocation: z.string().min(1, "Drop-off location is required."),
  pickupTime: z.date({
    required_error: "A date and time is required.",
  }),
  pax: z.coerce.number().min(1, "At least one passenger is required."),
  vehicleType: z.enum(["Sedan", "Minivan"]),
  clientName: z.string().optional(),
  requestedBy: z.string().optional(),
  partnerId: z.string().optional(),
  cost: z.coerce.number().min(0, "Cost must be a positive number."),
  paymentType: z.enum(["credit_card", "account", "cash"]),
  notes: z.string().optional(),
  bookingType: z.enum(["rightNow", "inAdvance"]),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];


export default function EditBookingPage() {
  const { id } = useParams();
  const bookingId = Array.isArray(id) ? id[0] : id;
  const { toast } = useToast();
  const firestore = useFirestore();
  const router = useRouter();

  const bookingRef = useMemoFirebase(() => bookingId ? doc(firestore, "bookings", bookingId) : null, [firestore, bookingId]);
  const { data: booking, isLoading: isBookingLoading } = useDoc<Booking>(bookingRef);

  const partnersCollectionRef = useMemoFirebase(() => collection(firestore, 'partners'), [firestore]);
  const { data: partners } = useCollection<Partner>(partnersCollectionRef);
  
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
        pickupLocation: "",
        dropoffLocation: "",
        pax: 1,
        vehicleType: "Sedan",
        clientName: "",
        requestedBy: "",
        partnerId: "",
        cost: 0,
        paymentType: "account",
        notes: "",
        pickupTime: undefined,
        bookingType: "inAdvance",
    }
  });

  const pax = form.watch("pax");
  const bookingType = form.watch("bookingType");

  useEffect(() => {
    if (pax > 4) {
      form.setValue("vehicleType", "Minivan");
    } else {
      form.setValue("vehicleType", "Sedan");
    }
  }, [pax, form]);

  useEffect(() => {
    if (bookingType === 'rightNow') {
        const currentTime = form.getValues('pickupTime') || new Date();
        form.setValue('pickupTime', new Date(currentTime));
    }
  }, [bookingType, form]);


  useEffect(() => {
    if (booking) {
        let pickupTimeDate: Date | undefined = undefined;
        if (booking.pickupTime) {
            pickupTimeDate = booking.pickupTime instanceof Timestamp 
                ? booking.pickupTime.toDate() 
                : new Date(booking.pickupTime);
        }

      form.reset({
        ...booking,
        pickupTime: pickupTimeDate,
        partnerId: booking.partnerId || "",
        clientName: booking.clientName ?? "",
        requestedBy: booking.requestedBy ?? "",
        notes: booking.notes ?? "",
        vehicleType: booking.vehicleType || "Sedan",
        bookingType: booking.bookingType || "inAdvance",
      })
    }
  }, [booking, form])

  async function onSubmit(data: BookingFormValues) {
    if (!bookingId) return;

    try {
        const bookingDocRef = doc(firestore, 'bookings', bookingId);
        await updateDoc(bookingDocRef, {
            ...data,
        });

        toast({
            title: "Booking Updated!",
            description: `The booking details have been successfully updated.`,
        });
        router.push(`/dashboard/bookings/${bookingId}`);
    } catch (error) {
        console.error("Error updating booking:", error);
        toast({
            title: "Error",
            description: "There was a problem updating the booking.",
            variant: "destructive"
        })
    }
  }

  if (isBookingLoading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-1/3" />
            <Card className="shadow-lg max-w-4xl mx-auto">
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-8">
                     <div className="grid md:grid-cols-2 gap-8">
                        <Skeleton className="h-10" />
                        <Skeleton className="h-10" />
                        <Skeleton className="h-10" />
                        <Skeleton className="h-10" />
                        <Skeleton className="h-10" />
                        <Skeleton className="h-10" />
                     </div>
                </CardContent>
            </Card>
        </div>
    )
  }

  if (!booking) {
      return <p>Booking not found.</p>
  }


  return (
    <div className="space-y-6">
       <div>
            <h1 className="text-3xl font-headline">Edit Booking #{booking.id.substring(0, 7)}</h1>
            <p className="text-muted-foreground">
                Update the details for this booking.
            </p>
        </div>
      <Card className="shadow-lg max-w-4xl mx-auto">
        <CardHeader>
            <CardTitle>Booking Details</CardTitle>
            <CardDescription>All fields are required unless otherwise noted.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="bookingType"
                  render={({ field }) => (
                    <FormItem className="space-y-3 md:col-span-2">
                      <FormLabel>Booking Type</FormLabel>
                      <FormControl>
                        <ToggleGroup
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <ToggleGroupItem value="inAdvance">In Advance</ToggleGroupItem>
                          <ToggleGroupItem value="rightNow">Right Now (Urgent)</ToggleGroupItem>
                        </ToggleGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pickupLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pickup Location</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="e.g., 123 Main St, Anytown" {...field} className="pl-10"/>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dropoffLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Drop-off Location</FormLabel>
                      <FormControl>
                         <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="e.g., Anytown Airport" {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="pickupTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Pickup Date & Time</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground",
                                    bookingType === 'rightNow' && "opacity-50 cursor-not-allowed"
                                )}
                                disabled={bookingType === 'rightNow'}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                                {field.value ? (
                                    format(field.value, "PPP 'at' HH:mm")
                                ) : (
                                    <span>Pick a date and time</span>
                                )}
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 flex" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                    const currentValue = field.value || new Date();
                                    if (!date) return;
                                    const newDate = setMinutes(setHours(date, currentValue.getHours()), currentValue.getMinutes());
                                    field.onChange(newDate);
                                }}
                                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                                initialFocus
                            />
                            <div className="flex border-l">
                                <ScrollArea className="h-80 w-20">
                                    <div className="p-1">
                                        {hours.map(hour => (
                                            <Button
                                                key={hour}
                                                variant={field.value && format(field.value, "HH") === hour ? "default" : "ghost"}
                                                className="w-full justify-center"
                                                onClick={() => field.onChange(setHours(field.value || new Date(), parseInt(hour)))}
                                            >
                                                {hour}
                                            </Button>
                                        ))}
                                    </div>
                                </ScrollArea>
                                <ScrollArea className="h-80 w-20 border-l">
                                     <div className="p-1">
                                        {minutes.map(minute => (
                                            <Button
                                                key={minute}
                                                variant={field.value && format(field.value, "mm") === minute ? "default" : "ghost"}
                                                className="w-full justify-center"
                                                onClick={() => field.onChange(setMinutes(field.value || new Date(), parseInt(minute)))}
                                            >
                                                {minute}
                                            </Button>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                            </PopoverContent>
                        </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="grid grid-cols-2 gap-8">
                    <FormField
                    control={form.control}
                    name="pax"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Passengers (PAX)</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input type="number" {...field} className="pl-10" />
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="vehicleType"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Vehicle Type</FormLabel>
                        <FormControl>
                            <ToggleGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                className="pt-2"
                                >
                                <ToggleGroupItem value="Sedan">Sedan</ToggleGroupItem>
                                <ToggleGroupItem value="Minivan">Minivan</ToggleGroupItem>
                            </ToggleGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <FormField
                  control={form.control}
                  name="requestedBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requested By (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <FileSignature className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="e.g., John at reception" {...field} value={field.value ?? ""} className="pl-10"/>
                        </div>
                      </FormControl>
                       <FormDescription>
                          The person who requested the booking (if different from account).
                        </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="e.g., Jane Smith" {...field} value={field.value ?? ""} className="pl-10"/>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={form.control}
                    name="partnerId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Operator / Partner (Optional)</FormLabel>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                <SelectTrigger className="pl-10">
                                    <SelectValue placeholder="Select a partner if applicable" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {partners?.map(partner => (
                                    <SelectItem key={partner.id} value={partner.id}>{partner.name}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <FormDescription>
                            If this booking is on behalf of a partner company.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost (€)</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input type="number" step="1" placeholder="e.g. 150" {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={form.control}
                    name="paymentType"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Payment Type</FormLabel>
                         <div className="relative">
                            <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                <SelectTrigger className="pl-10">
                                    <SelectValue placeholder="Select payment type" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="credit_card">Credit Card</SelectItem>
                                    <SelectItem value="account">Account</SelectItem>
                                    <SelectItem value="cash">Cash</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="md:col-span-2">
                    <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. Client has extra luggage" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

              </div>

              <Button type="submit" className="w-full md:w-auto" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Updating..." : "Update Booking"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

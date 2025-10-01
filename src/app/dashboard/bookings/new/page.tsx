
"use client";

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
import { addDocumentNonBlocking, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import type { Partner } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useCollection } from "@/firebase";
import { ScrollArea } from "@/components/ui/scroll-area";

const bookingFormSchema = z.object({
  pickupLocation: z.string().min(1, "Pickup location is required."),
  dropoffLocation: z.string().min(1, "Drop-off location is required."),
  pickupTime: z.date({
    required_error: "A date and time is required.",
  }),
  pax: z.coerce.number().min(1, "At least one passenger is required."),
  clientName: z.string().optional(),
  requestedBy: z.string().optional(),
  partnerId: z.string().optional(),
  cost: z.coerce.number().min(0, "Cost must be a positive number."),
  paymentType: z.enum(["credit_card", "account", "cash"]),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];


export default function NewBookingPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  const partnersCollectionRef = useMemoFirebase(() => collection(firestore, 'partners'), [firestore]);
  const { data: partners } = useCollection<Partner>(partnersCollectionRef);
  
  const bookingsCollectionRef = useMemoFirebase(() => collection(firestore, 'bookings'), [firestore]);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      pickupLocation: "",
      dropoffLocation: "",
      pax: 1,
      clientName: "",
      requestedBy: "",
      partnerId: "",
      cost: 0,
      paymentType: "account",
      notes: "",
      pickupTime: new Date(),
    },
  });

  async function onSubmit(data: BookingFormValues) {
    if (!user) {
        toast({
            title: "Error",
            description: "You must be logged in to create a booking.",
            variant: "destructive"
        });
        return;
    }

    try {
      addDocumentNonBlocking(bookingsCollectionRef, {
          ...data,
          status: "pending_admin",
          createdById: user.uid,
          createdAt: serverTimestamp(),
      });

      toast({
        title: "Booking Created!",
        description: "The new booking has been saved and is pending approval.",
      });
      router.push("/dashboard/bookings");
    } catch (error) {
        console.error("Error creating booking:", error);
        toast({
            title: "Error",
            description: "There was a problem creating the booking.",
            variant: "destructive"
        })
    }
  }

  return (
    <div className="space-y-6">
       <div>
            <h1 className="text-3xl font-headline">Create New Booking</h1>
            <p className="text-muted-foreground">
                Fill out the form below to add a new booking to the system.
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
                                    !field.value && "text-muted-foreground"
                                )}
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
                                    if (!date) return;
                                    const newDate = new Date(field.value.getTime());
                                    newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
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
                                                variant={format(field.value, "HH") === hour ? "default" : "ghost"}
                                                className="w-full justify-center"
                                                onClick={() => field.onChange(setHours(field.value, parseInt(hour)))}
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
                                                variant={format(field.value, "mm") === minute ? "default" : "ghost"}
                                                className="w-full justify-center"
                                                onClick={() => field.onChange(setMinutes(field.value, parseInt(minute)))}
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
                <FormField
                  control={form.control}
                  name="pax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Passengers (PAX)</FormLabel>
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <FormItem className="md:col-start-2">
                        <FormLabel>Payment Type</FormLabel>
                         <div className="relative">
                            <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                {form.formState.isSubmitting ? "Creating..." : "Create Booking"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

    
    
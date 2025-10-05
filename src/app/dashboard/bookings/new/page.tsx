
"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, setHours, setMinutes } from "date-fns";
import { CalendarIcon, Euro, Users, Briefcase, MapPin, User, FileSignature, Car, Clock, Building } from "lucide-react";

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
  SelectGroup,
  SelectLabel,
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
import { useFirestore, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, serverTimestamp, doc, addDoc } from "firebase/firestore";
import type { Partner, Operator } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useCollection } from "@/firebase";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  operatorId: z.string().optional(),
  cost: z.coerce.number().min(0, "Cost must be a positive number."),
  paymentType: z.enum(["driver", "mb", "account"]),
  notes: z.string().optional(),
  bookingType: z.enum(["rightNow", "inAdvance"]),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];


export default function NewBookingPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => user ? doc(firestore, `users/${user.uid}`) : null, [user, firestore]);
  const { data: userProfile } = useDoc(userDocRef);

  const partnersCollectionRef = useMemoFirebase(() => collection(firestore, 'partners'), [firestore]);
  const { data: partners } = useCollection<Partner>(partnersCollectionRef);
  
  const operatorsCollectionRef = useMemoFirebase(() => collection(firestore, 'operators'), [firestore]);
  const { data: operators } = useCollection<Operator>(operatorsCollectionRef);

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
      operatorId: "",
      cost: 0,
      paymentType: "driver",
      notes: "",
      pickupTime: new Date(),
      bookingType: "inAdvance",
    },
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
            form.setValue('pickupTime', new Date());
        }
    }, [bookingType, form]);

  async function onSubmit(data: BookingFormValues) {
    if (!user || !userProfile) {
        toast({
            title: "Error",
            description: "You must be logged in to create a booking.",
            variant: "destructive"
        });
        return;
    }

    // @ts-ignore
    const isAdmin = userProfile.role === 'admin';
    const bookingStatus = isAdmin ? 'approved' : 'pending_admin';
    
    try {
        const docRef = await addDoc(collection(firestore, "bookings"), {
            ...data,
            status: bookingStatus,
            createdById: user.uid,
            createdAt: serverTimestamp(),
        });
        
        toast({
            title: "Booking Created!",
            description: `Booking #${docRef.id.substring(0,7)} has been saved with status: ${bookingStatus.replace('_', ' ')}.`,
        });
        router.push("/dashboard/bookings");
    } catch (error: any) {
        console.error("Error creating booking:", error);
        toast({
            title: "Error",
            description: "There was a problem creating the booking." + (error?.message || ""),
            variant: "destructive"
        })
    }
  }
  
  const handleEntitySelect = (value: string) => {
    const [type, id] = value.split('_');
    if (type === 'operator') {
        form.setValue('operatorId', id);
        form.setValue('partnerId', undefined);
    } else if (type === 'partner') {
        form.setValue('partnerId', id);
        form.setValue('operatorId', undefined);
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
                  name="bookingType"
                  render={({ field }) => (
                    <FormItem className="space-y-3 md:col-span-2">
                      <FormLabel>Booking Type</FormLabel>
                      <FormControl>
                        <ToggleGroup
                          type="single"
                          value={field.value}
                          onValueChange={field.onChange}
                          defaultValue="inAdvance"
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
                          type="single"
                          value={field.value}
                          onValueChange={field.onChange}
                          className="pt-2"
                          defaultValue="Sedan"
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
                    name="partnerId" // Keep one name for the form state, logic will handle which ID is which
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Operator / Partner (Optional)</FormLabel>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                            <Select onValueChange={handleEntitySelect} value={form.getValues().operatorId ? `operator_${form.getValues().operatorId}` : form.getValues().partnerId ? `partner_${form.getValues().partnerId}` : undefined}>
                                <FormControl>
                                <SelectTrigger className="pl-10">
                                    <SelectValue placeholder="Select an operator or partner" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {operators && operators.length > 0 && (
                                        <SelectGroup>
                                            <SelectLabel>Operators</SelectLabel>
                                            {operators.map(o => <SelectItem key={o.id} value={`operator_${o.id}`}>{o.name}</SelectItem>)}
                                        </SelectGroup>
                                    )}
                                    {partners && partners.length > 0 && (
                                        <SelectGroup>
                                            <SelectLabel>Partners</SelectLabel>
                                            {partners.map(p => <SelectItem key={p.id} value={`partner_${p.id}`}>{p.name}</SelectItem>)}
                                        </SelectGroup>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <FormDescription>
                            If this booking is on behalf of an operator or partner company.
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
                        <FormControl>
                            <ToggleGroup
                                type="single"
                                value={field.value}
                                onValueChange={field.onChange}
                                className="pt-2"
                                defaultValue="driver"
                            >
                                <ToggleGroupItem value="driver">Driver</ToggleGroupItem>
                                <ToggleGroupItem value="mb">MB</ToggleGroupItem>
                                <ToggleGroupItem value="account">Account</ToggleGroupItem>
                            </ToggleGroup>
                        </FormControl>
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

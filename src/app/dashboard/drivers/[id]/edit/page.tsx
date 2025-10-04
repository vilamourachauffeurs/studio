
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, differenceInYears } from "date-fns";
import { CalendarIcon, User, Mail, Phone, Hash, CreditCard, KeyRound, ArrowLeft } from "lucide-react";
import { doc, updateDoc, Timestamp } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import type { Driver } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const driverFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Invalid email address."),
  phone: z.string().min(1, "Phone number is required."),
  birthday: z.date({
    required_error: "A birth date is required.",
  }),
  age: z.coerce.number().min(18, "Driver must be at least 18 years old."),
  nationalId: z.string().optional(),
  driversLicense: z.string().optional(),
});

type DriverFormValues = z.infer<typeof driverFormSchema>;

export default function EditDriverPage() {
  const { id } = useParams();
  const driverId = Array.isArray(id) ? id[0] : id;
  const { toast } = useToast();
  const firestore = useFirestore();
  const router = useRouter();

  const driverRef = useMemoFirebase(() => driverId ? doc(firestore, "drivers", driverId) : null, [firestore, driverId]);
  const { data: driver, isLoading: isDriverLoading } = useDoc<Driver>(driverRef);

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverFormSchema),
  });

  const birthday = form.watch("birthday");

  React.useEffect(() => {
    if (birthday) {
      form.setValue("age", differenceInYears(new Date(), birthday));
    }
  }, [birthday, form]);

  React.useEffect(() => {
    if (driver) {
      let birthdayDate: Date | undefined = undefined;
      if (driver.birthday) {
        birthdayDate = driver.birthday instanceof Timestamp
            ? driver.birthday.toDate()
            : new Date(driver.birthday);
      }
      form.reset({
        ...driver,
        birthday: birthdayDate,
        nationalId: driver.nationalId || "",
        driversLicense: driver.driversLicense || "",
      });
    }
  }, [driver, form]);

  async function onSubmit(data: DriverFormValues) {
    if (!driverId) return;

    try {
        const driverDocRef = doc(firestore, 'drivers', driverId);
        await updateDoc(driverDocRef, {
            ...data,
        });

        toast({
            title: "Driver Updated!",
            description: `The details for ${data.name} have been successfully updated.`,
        });
        router.push(`/dashboard/drivers`);
    } catch (error) {
        console.error("Error updating driver:", error);
        toast({
            title: "Error",
            description: "There was a problem updating the driver.",
            variant: "destructive"
        })
    }
  }
  
  if (isDriverLoading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-1/3" />
            <Card className="shadow-lg max-w-4xl mx-auto">
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
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

  if (!driver) {
      return <p>Driver not found.</p>
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
            </Button>
            <div>
                <h1 className="text-3xl font-headline">Edit Driver: {driver.name}</h1>
                <p className="text-muted-foreground">
                    Update the details for this driver.
                </p>
            </div>
        </div>
      <Card className="shadow-lg max-w-4xl mx-auto">
        <CardHeader>
            <CardTitle>Driver Details</CardTitle>
            <CardDescription>Fields marked with an asterisk (*) are required.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="e.g., John Doe" {...field} className="pl-10"/>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                         <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input type="email" placeholder="e.g., john.doe@example.com" {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                         <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="e.g., +1 234 567 890" {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div></div>
                 <FormField
                  control={form.control}
                  name="birthday"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Birth *</FormLabel>
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
                                    format(field.value, "PPP")
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                fromYear={new Date().getFullYear() - 100}
                                toYear={new Date().getFullYear() - 18}
                                captionLayout="dropdown-buttons"
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input type="number" {...field} className="pl-10" readOnly />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nationalId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>National ID (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="National ID Number" {...field} value={field.value ?? ""} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="driversLicense"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Driver's License (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="License Number" {...field} value={field.value ?? ""} className="pl-10"/>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full md:w-auto" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Updating..." : "Update Driver"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

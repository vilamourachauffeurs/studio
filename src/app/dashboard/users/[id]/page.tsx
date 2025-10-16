
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, User as UserIcon, Mail, Phone, Briefcase, Building, Car } from "lucide-react";
import { doc, updateDoc, collection } from "firebase/firestore";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useDoc, useMemoFirebase, useCollection } from "@/firebase";
import type { User, Partner, Operator, Driver } from "@/lib/types";

const userFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Invalid email address."),
  phone: z.string().min(1, "Phone number is required."),
  role: z.enum(["admin", "partner", "driver", "operator"]),
  relatedId: z.string().optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function EditUserPage() {
  const { id } = useParams();
  const userId = Array.isArray(id) ? id[0] : id;
  const { toast } = useToast();
  const firestore = useFirestore();
  const router = useRouter();

  const userRef = useMemoFirebase(() => userId ? doc(firestore, "users", userId) : null, [firestore, userId]);
  const { data: user, isLoading: isUserLoading } = useDoc<User>(userRef);

  const partnersRef = useMemoFirebase(() => collection(firestore, 'partners'), [firestore]);
  const { data: partners } = useCollection<Partner>(partnersRef);

  const operatorsRef = useMemoFirebase(() => collection(firestore, 'operators'), [firestore]);
  const { data: operators } = useCollection<Operator>(operatorsRef);

  const driversRef = useMemoFirebase(() => collection(firestore, 'drivers'), [firestore]);
  const { data: drivers } = useCollection<Driver>(driversRef);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "driver",
      relatedId: "",
    },
  });

  const role = form.watch("role");

  React.useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        // @ts-ignore
        phone: user.phone || "",
        // @ts-ignore
        role: user.role || "driver",
        // @ts-ignore
        relatedId: user.relatedId || "",
      });
    }
  }, [user, form]);

  async function onSubmit(data: UserFormValues) {
    if (!userId) return;

    try {
      const userDocRef = doc(firestore, 'users', userId);
      // For drivers, don't save relatedId (they use user.uid as driver ID)
      const updateData = data.role === 'driver' 
        ? { ...data, relatedId: null }
        : { ...data };
      
      await updateDoc(userDocRef, updateData);

      toast({
        title: "User Updated!",
        description: `The details for ${data.name} have been successfully updated.`,
      });
      router.push(`/dashboard/users`);
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "There was a problem updating the user's details.",
        variant: "destructive",
      });
    }
  }

  const renderRelatedEntitySelect = () => {
    if (role === 'partner') {
      return (
        <FormField
          control={form.control}
          name="relatedId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Related Partner</FormLabel>
                <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Select a partner" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {partners?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )
    }
    if (role === 'operator') {
      return (
        <FormField
          control={form.control}
          name="relatedId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Related Operator</FormLabel>
                <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Select an operator" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {operators?.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )
    }
    if (role === 'driver') {
      // Drivers no longer use relatedId - their driver profile ID matches their user ID
      return (
        <div className="md:col-span-2 p-4 bg-muted/50 rounded-lg border">
          <p className="text-sm text-muted-foreground">
            <Car className="inline h-4 w-4 mr-2" />
            Driver profile is automatically linked using the same ID as this user account.
            Edit driver-specific details (license, commission, etc.) in the Drivers section.
          </p>
        </div>
      )
    }
    return null;
  }
  
  if (isUserLoading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-1/3" />
            <Card className="shadow-lg max-w-4xl mx-auto">
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-8 mt-6">
                     <div className="grid md:grid-cols-2 gap-8">
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

  if (!user) {
      return <p>User not found.</p>
  }


  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
            </Button>
            <div>
                <h1 className="text-3xl font-headline">Edit User: {user.name}</h1>
                <p className="text-muted-foreground">
                    Update the details for this user.
                </p>
            </div>
        </div>
      <Card className="shadow-lg max-w-4xl mx-auto">
        <CardHeader>
            <CardTitle>User Details</CardTitle>
            <CardDescription>Update the user's information and role.</CardDescription>
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
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
                      <FormLabel>Email</FormLabel>
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
                      <FormLabel>Phone Number</FormLabel>
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
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                <SelectTrigger className="pl-10">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="partner">Partner</SelectItem>
                                    <SelectItem value="operator">Operator</SelectItem>
                                    <SelectItem value="driver">Driver</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {renderRelatedEntitySelect()}
              </div>

              <Button type="submit" className="w-full md:w-auto" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}


"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, User as UserIcon, Mail, Phone, Briefcase } from "lucide-react";
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
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import type { User } from "@/lib/types";

const userFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Invalid email address."),
  phone: z.string().min(1, "Phone number is required."),
  role: z.enum(["admin", "partner", "driver"]),
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

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "driver",
    },
  });

  React.useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        // @ts-ignore
        phone: user.phone || "",
        // @ts-ignore
        role: user.role || "driver",
      });
    }
  }, [user, form]);

  async function onSubmit(data: UserFormValues) {
    if (!userId) return;

    try {
      const userDocRef = doc(firestore, 'users', userId);
      await updateDoc(userDocRef, {
        ...data,
      });

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
                                    <SelectItem value="driver">Driver</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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

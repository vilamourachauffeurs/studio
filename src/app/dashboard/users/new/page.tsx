
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Mail, Phone, User as UserIcon, KeyRound, Briefcase, Building, Car } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth } from "firebase/auth";

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
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from "@/firebase";
import { firebaseConfig } from "@/firebase/config";
import { useRouter } from "next/navigation";
import type { Partner, Operator, Driver } from "@/lib/types";
import type { SecurityRuleContext } from "@/firebase/errors";

const userFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Invalid email address."),
  phone: z.string().min(1, "Phone number is required."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.enum(["admin", "partner", "driver", "operator"]),
  relatedId: z.string().optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function NewUserPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const router = useRouter();
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "driver",
      relatedId: "",
    },
  });

  const role = form.watch("role");

  const partnersRef = useMemoFirebase(() => collection(firestore, 'partners'), [firestore]);
  const { data: partners } = useCollection<Partner>(partnersRef);

  const operatorsRef = useMemoFirebase(() => collection(firestore, 'operators'), [firestore]);
  const { data: operators } = useCollection<Operator>(operatorsRef);

  const driversRef = useMemoFirebase(() => collection(firestore, 'drivers'), [firestore]);
  const { data: drivers } = useCollection<Driver>(driversRef);

  async function onSubmit(data: UserFormValues) {
    const tempAppName = `temp-user-creation-${Date.now()}`;
    const tempApp = initializeApp(firebaseConfig, tempAppName);
    const tempAuth = getAuth(tempApp);

    try {
        const userCredential = await createUserWithEmailAndPassword(tempAuth, data.email, data.password);
        const user = userCredential.user;

        const newUserDoc = {
            id: user.uid,
            name: data.name,
            email: data.email,
            phone: data.phone,
            role: data.role,
            relatedId: data.relatedId || null,
        };
        
        const userDocRef = doc(firestore, "users", user.uid);

        setDoc(userDocRef, newUserDoc)
          .then(() => {
            toast({
                title: "User Created!",
                description: `${data.name} has been added to the system as a ${data.role}.`,
            });
            router.push("/dashboard/users");
          })
          .catch((serverError) => {
            const permissionError = new FirestorePermissionError({
              path: userDocRef.path,
              operation: 'create',
              requestResourceData: newUserDoc,
            } satisfies SecurityRuleContext);
            
            errorEmitter.emit('permission-error', permissionError);
          });

    } catch (error: any) {
        // This will catch errors from createUserWithEmailAndPassword
        console.error("Error creating auth user:", error);
        toast({
            title: "Authentication Error",
            description: error.message || "There was a problem creating the user's authentication account.",
            variant: "destructive"
        })
    } finally {
        await deleteApp(tempApp);
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
      return (
        <FormField
          control={form.control}
          name="relatedId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Related Driver</FormLabel>
                <div className="relative">
                    <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Select a driver profile" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {drivers?.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )
    }
    return null;
  }

  return (
    <div className="space-y-6">
       <div>
            <h1 className="text-3xl font-headline">Add New User</h1>
            <p className="text-muted-foreground">
                Fill out the form below to add a new user to the system.
            </p>
        </div>
      <Card className="shadow-lg max-w-4xl mx-auto">
        <CardHeader>
            <CardTitle>User Details</CardTitle>
            <CardDescription>All fields are required.</CardDescription>
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
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                         <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                {form.formState.isSubmitting ? "Creating..." : "Create User"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

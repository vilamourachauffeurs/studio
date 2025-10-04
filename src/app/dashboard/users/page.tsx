
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, query, doc } from "firebase/firestore";
import type { User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function UsersPage() {
    const firestore = useFirestore();
    const router = useRouter();
    const { user: authUser } = useUser();

    const userDocRef = useMemoFirebase(() => authUser ? doc(firestore, `users/${authUser.uid}`) : null, [authUser, firestore]);
    const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

    const isAdmin = userProfile && (userProfile as any).role === 'admin';

    const usersCollectionRef = useMemoFirebase(() => isAdmin ? collection(firestore, 'users') : null, [firestore, isAdmin]);
    const usersQuery = useMemoFirebase(() => usersCollectionRef ? query(usersCollectionRef) : null, [usersCollectionRef]);
    const { data: users, isLoading: areUsersLoading } = useCollection<User>(usersQuery);

    const isLoading = isProfileLoading || areUsersLoading;

    const handleRowClick = (userId: string) => {
        router.push(`/dashboard/users/${userId}`);
    };

    if (!isProfileLoading && !isAdmin) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-destructive">You do not have permission to view this page.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-headline">Users</h1>
                    <p className="text-muted-foreground">
                        Manage all users in the system.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/users/new">Add New User</Link>
                </Button>
            </div>
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>A list of all registered users.</CardDescription>
                </CardHeader>
                <CardContent>
                     {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                     ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Role</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users?.map(user => (
                                    <TableRow key={user.id} onClick={() => handleRowClick(user.id)} className="cursor-pointer">
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.phone}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="capitalize">{user.role}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                     )}
                </CardContent>
            </Card>
        </div>
    );
}

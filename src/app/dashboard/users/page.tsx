
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import type { User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function UsersPage() {
    const firestore = useFirestore();
    const router = useRouter();
    const usersCollectionRef = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
    const usersQuery = useMemoFirebase(() => query(usersCollectionRef), [usersCollectionRef]);
    const { data: users, isLoading } = useCollection<User>(usersQuery);

    const handleRowClick = (userId: string) => {
        router.push(`/dashboard/users/${userId}`);
    };

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

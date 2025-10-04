
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import type { Driver } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function DriversPage() {
    const firestore = useFirestore();
    const router = useRouter();
    const driversCollectionRef = useMemoFirebase(() => collection(firestore, 'drivers'), [firestore]);
    const driversQuery = useMemoFirebase(() => query(driversCollectionRef), [driversCollectionRef]);
    const { data: drivers, isLoading } = useCollection<Driver>(driversQuery);

    const handleRowClick = (driverId: string) => {
        router.push(`/dashboard/drivers/${driverId}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-headline">Drivers</h1>
                    <p className="text-muted-foreground">
                        View and manage all drivers.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/drivers/new">Add New Driver</Link>
                </Button>
            </div>
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>All Drivers</CardTitle>
                    <CardDescription>A list of all drivers in your system.</CardDescription>
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
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>On-Time %</TableHead>
                                    <TableHead>Completed Jobs</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {drivers?.map(driver => (
                                    <TableRow key={driver.id} onClick={() => handleRowClick(driver.id)} className="cursor-pointer">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={driver.avatarUrl} alt={driver.name} />
                                                    <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    {driver.name}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{driver.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={driver.status === 'online' ? 'default' : 'secondary'} className={driver.status === 'online' ? 'bg-green-500' : ''}>
                                                {driver.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{driver.performance?.onTimePercent || 'N/A'}%</TableCell>
                                        <TableCell>{driver.performance?.completedJobs || 0}</TableCell>
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


"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import type { Partner } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function PartnersPage() {
    const firestore = useFirestore();
    const router = useRouter();
    const partnersCollectionRef = useMemoFirebase(() => collection(firestore, 'partners'), [firestore]);
    const partnersQuery = useMemoFirebase(() => query(partnersCollectionRef), [partnersCollectionRef]);
    const { data: partners, isLoading } = useCollection<Partner>(partnersQuery);

    const handleRowClick = (partnerId: string) => {
        router.push(`/dashboard/partners/${partnerId}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-headline">Partners</h1>
                    <p className="text-muted-foreground">
                        View and manage all partners.
                    </p>
                </div>
                 <Button asChild>
                    <Link href="/dashboard/partners/new">Add New Partner</Link>
                </Button>
            </div>
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>All Partners</CardTitle>
                    <CardDescription>A list of all partners in your system.</CardDescription>
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
                                    <TableHead>Company Name</TableHead>
                                    <TableHead>Contact Person</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Commission Rate</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {partners?.map(partner => (
                                    <TableRow key={partner.id} onClick={() => handleRowClick(partner.id)} className="cursor-pointer">
                                        <TableCell className="font-medium">{partner.name}</TableCell>
                                        <TableCell>{partner.contactPerson}</TableCell>
                                        <TableCell>{partner.email}</TableCell>
                                        <TableCell>{partner.commissionRate}%</TableCell>
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

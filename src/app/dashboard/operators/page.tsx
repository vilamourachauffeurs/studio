
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import type { Operator } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function OperatorsPage() {
    const firestore = useFirestore();
    const router = useRouter();
    const operatorsCollectionRef = useMemoFirebase(() => collection(firestore, 'operators'), [firestore]);
    const operatorsQuery = useMemoFirebase(() => query(operatorsCollectionRef), [operatorsCollectionRef]);
    const { data: operators, isLoading } = useCollection<Operator>(operatorsQuery);

    const handleRowClick = (operatorId: string) => {
        // We will implement this in a future step
        // router.push(`/dashboard/operators/${operatorId}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-headline">Operators</h1>
                    <p className="text-muted-foreground">
                        View and manage all operators.
                    </p>
                </div>
                 <Button asChild>
                    <Link href="/dashboard/operators/new">Add New Operator</Link>
                </Button>
            </div>
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>All Operators</CardTitle>
                    <CardDescription>A list of all operators in your system.</CardDescription>
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
                                {operators?.map(operator => (
                                    <TableRow key={operator.id} onClick={() => handleRowClick(operator.id)} className="cursor-pointer">
                                        <TableCell className="font-medium">{operator.name}</TableCell>
                                        <TableCell>{operator.contactPerson}</TableCell>
                                        <TableCell>{operator.email}</TableCell>
                                        <TableCell>{operator.commissionRate}%</TableCell>
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

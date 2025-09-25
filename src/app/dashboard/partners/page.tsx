import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { partners } from "@/lib/data";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem } from "@/components/ui/dropdown-menu";

export default function PartnersPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-headline">Partners</h1>
                    <p className="text-muted-foreground">
                        View and manage all partners.
                    </p>
                </div>
                <Button>Add New Partner</Button>
            </div>
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>All Partners</CardTitle>
                    <CardDescription>A list of all partners in your system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Company Name</TableHead>
                                <TableHead>Contact Person</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Bookings</TableHead>
                                <TableHead>Commission Rate</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {partners.map(partner => (
                                <TableRow key={partner.id}>
                                    <TableCell className="font-medium">{partner.name}</TableCell>
                                    <TableCell>{partner.contactPerson}</TableCell>
                                    <TableCell>{partner.email}</TableCell>
                                    <TableCell>{partner.bookingsCount}</TableCell>
                                    <TableCell>{partner.commissionRate}%</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { drivers } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DriversPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-headline">Drivers</h1>
                    <p className="text-muted-foreground">
                        View and manage all drivers.
                    </p>
                </div>
                <Button>Add New Driver</Button>
            </div>
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>All Drivers</CardTitle>
                    <CardDescription>A list of all drivers in your system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>On-Time %</TableHead>
                                <TableHead>Completed Jobs</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {drivers.map(driver => (
                                <TableRow key={driver.id}>
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
                                    <TableCell>{driver.performance?.onTimePercent}%</TableCell>
                                    <TableCell>{driver.performance?.completedJobs}</TableCell>
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

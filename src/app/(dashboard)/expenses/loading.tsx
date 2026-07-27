import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Loading() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Expense Reports</h2>
                    <p className="text-muted-foreground">Track your company operating expenses.</p>
                </div>
                <Button disabled><Plus className="h-4 w-4 mr-2" /> Add Manual Expense</Button>
            </div>
            <hr />
            <div className="rounded-md border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="text-center font-bold">Date</TableHead>
                            <TableHead className="text-center font-bold">Unit #</TableHead>
                            <TableHead className="text-center font-bold">Category</TableHead>
                            <TableHead className="text-center font-bold">Vendor</TableHead>
                            <TableHead className="text-center font-bold">Amount</TableHead>
                            <TableHead className="w-30 text-center font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell className="text-center"><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
                                <TableCell className="text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                                <TableCell className="text-center"><Skeleton className="h-6 w-20 mx-auto rounded-full" /></TableCell>
                                <TableCell className="text-center"><Skeleton className="h-4 w-32 mx-auto" /></TableCell>
                                <TableCell className="text-center"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                                <TableCell className="text-center"><Skeleton className="h-8 w-8 mx-auto rounded-md" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

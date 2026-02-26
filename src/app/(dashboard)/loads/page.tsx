import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteLoad } from "@/lib/actions";

export default async function LoadsPage () {
    const loads = await db.load.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            truck: {
                select: {
                    unitNumber: true,
                    driverName: true
                }
            }
        }
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Active Loads</h2>
                    <p className="text-muted-foreground">Monitor and dispatch freight across the fleet.</p>
                </div>
                <Button asChild className="bg-sky-600 hover:bg-sky-700">
                    <Link href="/loads/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Load
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-30">Load ID</TableHead>
                            <TableHead>Assigned Truck</TableHead>
                            <TableHead>Driver</TableHead>
                            <TableHead className="text-right">Miles</TableHead>
                            <TableHead className="text-right">Revenue</TableHead>
                            <TableHead className="text-right">Rate/Mile</TableHead>
                            <TableHead className="text-right">Date</TableHead>
                            <TableHead className="w-25 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {loads.map((load) => {
                            const rpm = load.miles > 0 ? (load.amount / load.miles).toFixed(2) : "0.00";

                            return (
                                <TableRow key={load.id} className="hover:bg-slate-50/50">
                                    <TableCell className="font-mono text-xs text-slate-500 uppercase">
                                        #{load.id.slice(-6)}
                                    </TableCell>

                                    <TableCell className="font-bold text-sky-700">
                                        {load.truck?.unitNumber || "Unassigned"}
                                    </TableCell>
                                    
                                    <TableCell>{load.truck?.driverName || "-"}</TableCell>
                                    <TableCell className="text-right">{load.miles} mi</TableCell>
                                    
                                    <TableCell className="text-right font-semibold text-emerald-600">
                                        ${load.amount.toLocaleString()}
                                    </TableCell>
                                    
                                    <TableCell className="text-right text-muted-foreground">
                                        ${rpm}
                                    </TableCell>
                                    
                                    <TableCell className="text-right text-xs">
                                        {new Date(load.createdAt).toLocaleDateString()}
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                <Link href={`/loads/${load.id}`}>
                                                    <Pencil className="w-4 h-4 text-slate-600" />
                                                </Link>
                                            </Button>

                                            <form action={deleteLoad.bind(null, load.id)}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </form>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}

                        {loads.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                    No active loads found. Click "Create New Load" to start.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

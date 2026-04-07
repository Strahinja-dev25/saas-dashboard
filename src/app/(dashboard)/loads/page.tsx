import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Plus, Pencil, Trash2, Play, CheckCircle2, XCircle, Activity, Clock, Gauge, ArrowUpDown } from "lucide-react";

import Link from "next/link";
import { Search } from "@/components/dashboard/search";
import { LoadService } from "@/services/loads/load-service";
import { LoadStatus } from "@prisma/client";
import { deleteLoad, updateLoadStatus } from "@/lib/actions";

// Formatira decimalne sate u ispravan format (sati i minuti)
function formatHOS(decimalHours: number) {
    const totalMinutes = Math.round(decimalHours * 60);
    
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    
    return `${hrs}h ${mins < 10 ? '0' : ''}${mins}m`;
}

// Pretvara razlicite statuse HOS-a u odgovarajuce boje
function getHosBadgeClass(hours: number) {
    if (hours < 3)
        return "bg-red-50 text-red-600 border-red-200";
    if (hours < 7)
        return "bg-amber-50 text-amber-600 border-amber-200";
    
    return "bg-emerald-50 text-emerald-600 border-emerald-200";
}

interface PageProps {
    searchParams: Promise<{ 
        query?: string;
        page?: string;
        sort?: string;
        order?: string;
    }>;
}

export default async function LoadsPage ({ searchParams }: PageProps) {
    const ITEMS_PER_PAGE = 20;

    const params = await searchParams;
    const query = params.query || "";
    const currentPage = Number(params.page) || 1;

    const sortBy = params.sort || "createdAt";
    const sortOrder = (params.order as "asc" | "desc") || "asc";

    const { loads, totalPages } = await LoadService.getActiveLoads(query, currentPage, ITEMS_PER_PAGE, sortBy, sortOrder);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Active Loads</h2>
                    <p className="text-muted-foreground">Monitor current fleet movements and revenue.</p>
                </div>

                <Search placeholder="Search by load ID, unit #, or driver name..." />

                <Button variant="outline" asChild>
                    <Link href="/loads/history">History Archive</Link>
                </Button>

                <Button asChild>
                    <Link href="/loads/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Load
                    </Link>
                </Button>
            </div>

            <hr />

            <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-40 text-center font-bold">Load ID</TableHead>
                            <TableHead className="w-40 text-center font-bold">Assigned Truck</TableHead>
                            <TableHead className="w-40 text-center font-bold">Driver</TableHead>

                            <TableHead className="w-40 text-center font-bold">
                                <Link 
                                    href={`?query=${query}&page=${currentPage}&sort=amount&order=${sortOrder === 'asc' ? 'desc' : 'asc'}`}
                                    className="flex items-center justify-center gap-1 hover:text-sky-600 transition-colors mx-auto"
                                >
                                    Revenue
                                    <ArrowUpDown className="h-3 w-3" />
                                </Link>
                            </TableHead>

                            <TableHead className="w-40 text-center font-bold">
                                <Link 
                                    href={`?query=${query}&page=${currentPage}&sort=status&order=${sortOrder === 'asc' ? 'desc' : 'asc'}`}
                                    className="flex items-center justify-center gap-1 hover:text-sky-600 transition-colors mx-auto"
                                >
                                    Status
                                    <ArrowUpDown className="h-3 w-3" />
                                </Link>
                            </TableHead>

                            <TableHead className="w-40 text-center font-bold">Date</TableHead>
                            <TableHead className="w-40 text-center font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {loads.map((load) => (
                            <TableRow key={load.id} className="transition-colors">
                                <TableCell className="text-center font-mono text-xs text-slate-500">
                                    #{load.id.slice(-6).toUpperCase()}
                                </TableCell>

                                <TableCell className="text-center font-bold text-sky-700">
                                    {load.truck?.unitNumber || "Unassigned"}
                                </TableCell>

                                <TableCell className="text-center">
                                    {load.truck?.driver ? (
                                        <HoverCard openDelay={300} closeDelay={100}>
                                            <HoverCardTrigger className="font-semibold hover:text-sky-600 transition-colors cursor-default">
                                                {load.truck.driver.name}
                                            </HoverCardTrigger>
                                            
                                            {/* Iskacuci prozor */}
                                            <HoverCardContent className="w-64 bg-white p-4 shadow-xl border-slate-200 text-left animate-in zoom-in-95 fade-in-0 duration-150">
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-semibold border-b pb-2 flex items-center justify-between">
                                                        Driver Info
                                                        {load.truck.driver.isDriving && <Gauge className="h-4 w-4 text-sky-500 animate-pulse" />}
                                                    </h4>
                                                    
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-slate-500 flex items-center gap-1"><Activity className="h-3 w-3"/> ELD:</span>
                                                        <span className={load.truck.driver.eldStatus === "CONNECTED" ? "text-emerald-600 font-bold" : "text-red-600 font-bold"}>
                                                            {load.truck.driver.eldStatus}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3"/> HOS:</span>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getHosBadgeClass(load.truck.driver.hosAvailable)}`}>
                                                            {formatHOS(load.truck.driver.hosAvailable)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </HoverCardContent>
                                        </HoverCard>
                                    ) : (
                                        <span className="text-slate-400 italic">-</span>
                                    )}
                                </TableCell>

                                <TableCell className="text-center">
                                    ${load.amount.toLocaleString()}
                                </TableCell>
                                    
                                <TableCell className="text-center text-muted-foreground">
                                    {load.status === LoadStatus.PENDING &&
                                    <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded text-[10px] font-bold uppercase border border-amber-100">Pending</span>}

                                    {load.status === LoadStatus.ASSIGNED &&
                                    <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-[10px] font-bold uppercase border border-blue-100">Assigned</span>}

                                    {load.status === LoadStatus.IN_TRANSIT &&
                                    <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-[10px] font-bold uppercase border border-emerald-100">In Transit</span>}
                                </TableCell>
                                    
                                <TableCell className="text-center text-xs">
                                    {new Date(load.createdAt).toLocaleDateString()}
                                </TableCell>

                                <TableCell className="text-center">
                                    <div className="flex items-center justify-end gap-2">
                                        
                                        {/* 1. Start trip (radi samo ako je ASSIGNED) */}
                                        {load.status === "ASSIGNED" && (
                                            load.truck?.driver ? (
                                                <form action={updateLoadStatus.bind(null, load.id, "IN_TRANSIT")}>
                                                    <Button type="submit" variant="outline" size="sm" className="h-8 px-2 text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 shadow-sm">
                                                        <Play className="h-2.5 w-2.5 fill-current" />
                                                        Start
                                                    </Button>
                                                </form>
                                            ) : (
                                                <Button variant="outline" size="sm" disabled className="h-8 px-2 text-xs font-semibold">
                                                    <Play className="h-2.5 w-2.5 fill-current" />
                                                    Start
                                                </Button>
                                            )
                                        )}

                                        {/* 2. Mark as delivered (radi samo ako je IN_TRANSIT) */}
                                        {load.status === "IN_TRANSIT" && (
                                            <form action={updateLoadStatus.bind(null, load.id, "DELIVERED")}>
                                                <Button type="submit" variant="outline" size="sm" className="h-8 px-2 text-xs font-semibold bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-sm">
                                                    <CheckCircle2 className="h-2.5 w-2.5 fill-current" />
                                                    Deliver
                                                </Button>
                                            </form>
                                        )}

                                        {/* 3. Cancel (Ako jos traje, a zelimo da prekinemo) */}
                                        {(load.status === "PENDING" || load.status === "ASSIGNED" || load.status === "IN_TRANSIT") && (
                                            <form action={updateLoadStatus.bind(null, load.id, "CANCELLED")}>
                                                <Button type="submit" variant="outline" size="sm" className="h-8 px-2 text-xs font-semibold bg-red-50 text-red-700 border-red-200 hover:bg-red-100 shadow-sm">
                                                    <XCircle className="h-2.5 w-2.5" />
                                                    Cancel
                                                </Button>
                                            </form>
                                        )}

                                        <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block"></div>

                                        {/* 4. Edit i Delete */}
                                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                            <Link href={`/loads/${load.id}`}>
                                                <Pencil className="w-4 h-4 text-slate-400" />
                                            </Link>
                                        </Button>
                                        <form action={deleteLoad.bind(null, load.id)}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-100">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </form>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}

                        {loads.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                    No active loads found for this terminal.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            
            { /* Pagination controls */ }
            <div className="mt-4 flex items-center justify-center gap-2">
                {currentPage <= 1 ? (
                    <Button variant="outline" disabled>Previous</Button>
                ) : (
                    <Button variant="outline" asChild>
                        <Link href={`?query=${query}&sort=${sortBy}&order=${sortOrder}&page=${currentPage - 1}`}>
                            Previous
                        </Link>
                    </Button>
                )}

                <span className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                </span>

                {currentPage >= totalPages ? (
                    <Button variant="outline" disabled>Next</Button>
                ) : (
                    <Button variant="outline" disabled={currentPage >= totalPages} asChild>
                        <Link href={`?query=${query}&sort=${sortBy}&order=${sortOrder}&page=${currentPage + 1}`}>
                            Next
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
}

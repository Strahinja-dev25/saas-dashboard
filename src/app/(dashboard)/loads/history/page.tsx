import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { deleteLoad } from "@/lib/actions";
import { Search } from "@/components/dashboard/search";
import { LoadService } from "@/services/loads/load-service";
import { LoadStatus } from "@prisma/client";

interface PageProps {
    searchParams: Promise<{ 
        query?: string;
        page?: string;
    }>;
}

export default async function LoadHistoryPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const query = params.query || "";
    const currentPage = Number(params.page) || 1;

    // POZIVAMO FUNKCIJU ZA ISTORIJU
    const { loads, totalPages } = await LoadService.getLoadHistory(query, currentPage);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                            <Link href="/loads"><ArrowLeft className="h-4 w-4" /></Link>
                        </Button>
                        <h2 className="text-3xl font-bold tracking-tight">History Archive</h2>
                    </div>
                    <p className="text-muted-foreground ml-10">Completed and cancelled loads registry.</p>
                </div>

                <Search placeholder="Search history of loads..." />
            </div>

            <hr />
            
            <div className="rounded-md border bg-white shadow-sm overflow-hidden opacity-90"> {/* Blago providno da odaje utisak arhive */}
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-32 text-center font-bold text-slate-700 uppercase text-[11px]">Load ID</TableHead>
                            <TableHead className="font-bold text-slate-700">Truck & Driver</TableHead>
                            <TableHead className="text-right font-bold text-slate-700">Final Revenue</TableHead>
                            <TableHead className="text-center font-bold text-slate-700">Status</TableHead>
                            <TableHead className="text-right font-bold text-slate-700">Completion Date</TableHead>
                            <TableHead className="w-24 text-right font-bold text-slate-700">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {loads.map((load) => (
                        <TableRow key={load.id} className="grayscale-[0.5] hover:grayscale-0 transition-all">
                            <TableCell className="text-center font-mono text-xs text-slate-500">
                                #{load.id.slice(-6).toUpperCase()}
                            </TableCell>

                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium text-slate-700">
                                        {load.truck?.unitNumber || "N/A"}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        {load.truck?.driver?.name || "No driver"}
                                    </span>
                                </div>
                            </TableCell>

                            <TableCell className="text-right font-bold text-slate-600">
                                ${load.amount.toLocaleString()}
                            </TableCell>

                            <TableCell className="text-center">
                                {load.status === LoadStatus.DELIVERED ? (
                                    <span className="flex items-center justify-center gap-1 text-emerald-600 text-[10px] font-bold uppercase bg-emerald-50 px-2 py-1 rounded">
                                        <CheckCircle2 className="h-3 w-3" /> Delivered
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-1 text-red-600 text-[10px] font-bold uppercase bg-red-50 px-2 py-1 rounded">
                                        <XCircle className="h-3 w-3" /> Cancelled
                                    </span>
                                )}
                            </TableCell>

                            <TableCell className="text-right text-xs text-slate-500">
                                {new Date(load.updatedAt).toLocaleDateString()}
                            </TableCell>

                            <TableCell className="text-right">
                                <form action={deleteLoad.bind(null, load.id)}>
                                    <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </form>
                            </TableCell>
                        </TableRow>
                        ))}

                        {loads.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground italic">
                                    Archive is empty.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* PAGINACIJA */}
            <div className="mt-4 flex items-center justify-center gap-2">
                <Button variant="outline" disabled={currentPage <= 1} asChild={currentPage > 1}>
                    {currentPage <= 1 ? "Previous" : <Link href={`?query=${query}&page=${currentPage - 1}`}>Previous</Link>}
                </Button>
                <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
                <Button variant="outline" disabled={currentPage >= totalPages} asChild={currentPage < totalPages}>
                    {currentPage >= totalPages ? "Next" : <Link href={`?query=${query}&page=${currentPage + 1}`}>Next</Link>}
                </Button>
            </div>
        </div>
    );
}

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Pencil } from "lucide-react";
import { db } from "@/lib/db";
import Link from "next/link";
import { deleteTruck } from "@/lib/actions";
import { Search } from "@/components/fleet/search";

interface PageProps {
    searchParams: Promise<{ 
        query?: string;
        page?: string;
    }>;
}

export default async function TrucksPage ({ searchParams }: PageProps) {
    const { query, page } = await searchParams;

    const ITEMS_PER_PAGE = 20;
    const currentPage = Number(page) || 1;
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    const totalTrucksCount = await db.truck.count({
        where: query ? {
            OR: [
                { unitNumber: { contains: query, mode: 'insensitive' as const } },
                { driverName: { contains: query, mode: 'insensitive' as const } },
                { location: { contains: query, mode: 'insensitive' as const } },
            ],
        } : {}
    });
    const totalPages = Math.ceil(totalTrucksCount / ITEMS_PER_PAGE);

    const trucks = await db.truck.findMany({
        where: query ? {
            OR: [
                { unitNumber: { contains: query, mode: 'insensitive' as const } },
                { driverName: { contains: query, mode: 'insensitive' as const } },
                { location: { contains: query, mode: 'insensitive' as const } },
            ],
        } : {},
        orderBy: { createdAt: 'desc' },
        take: ITEMS_PER_PAGE,
        skip: offset,
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Fleet Status</h2>
                    <p className="text-muted-foreground">Manage your trucks and trailers here.</p>
                </div>

                <Search />

                <Button asChild>
                    <Link href="/fleet/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Unit
                    </Link>
                </Button>
            </div>

            <hr />
            
            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-40 text-center font-bold text-slate-700">Unit #</TableHead>
                            <TableHead className="text-center font-bold text-slate-700">Driver</TableHead>
                            <TableHead className="w-40 text-center font-bold text-slate-700">Status</TableHead>
                            <TableHead className="text-center font-bold text-slate-700">Location</TableHead>
                            <TableHead className="w-40 text-center font-bold text-slate-700">Equipment</TableHead>
                            <TableHead className="w-30 text-center font-bold text-slate-700">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {trucks.map((truck) => (
                        <TableRow key={truck.id}>
                            <TableCell className="text-center font-medium">{truck.unitNumber}</TableCell>
                            <TableCell className="text-center">{truck.driverName}</TableCell>
                            <TableCell className="text-center">
                                {truck.status === "AVAILABLE" &&
                                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-semibold">Available</span>}

                                {truck.status === "IN_TRANSIT" &&
                                <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-xs font-semibold">In Transit</span>}

                                {truck.status === "MAINTENANCE" &&
                                <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded text-xs font-semibold">Maintenance</span>}

                                {truck.status === "OUT_OF_SERVICE" &&
                                <span className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs font-semibold">Out of Service</span>}
                            </TableCell>
                            <TableCell className="text-center">{truck.location}</TableCell>
                            <TableCell className="text-center text-muted-foreground">{truck.equipmentType}</TableCell>

                            <TableCell className="text-right w-25">
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link href={`/fleet/${truck.id}`}>
                                            <Pencil className="w-4 h-4" />
                                        </Link>
                                    </Button>

                                    <form action={deleteTruck.bind(null, truck.id)}>
                                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-100">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </div>
                            </TableCell>
                        </TableRow>
                        ))}

                        {trucks.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No trucks found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
                {currentPage <= 1 ? (
                    <Button variant="outline" disabled>Prethodna</Button>
                ) : (
                    <Button variant="outline" asChild>
                        <Link href={`?query=${query || ""}&page=${currentPage - 1}`}>
                            Prethodna
                        </Link>
                    </Button>
                )}

                <span className="text-sm font-medium">
                    Strana {currentPage} od {totalPages}
                </span>

                {currentPage >= totalPages ? (
                    <Button variant="outline" disabled>Sledeća</Button>
                ) : (
                    <Button variant="outline" disabled={currentPage >= totalPages} asChild>
                        <Link href={`?query=${query || ""}&page=${currentPage + 1}`}>
                            Sledeća
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
}

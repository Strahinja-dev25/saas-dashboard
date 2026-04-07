import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Pencil, UserCheck, UserX, Gauge, ArrowUpDown } from "lucide-react";

import Link from "next/link";
import { deleteDriver } from "@/lib/actions";
import { Search } from "@/components/dashboard/search";
import { DriverService } from "@/services/drivers/driver-service";

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

export default async function DriversPage({ searchParams }: PageProps) {
    const ITEMS_PER_PAGE = 20;

    const params = await searchParams;
    const query = params.query || "";
    const currentPage = Number(params.page) || 1;

    const sortBy = params.sort || "name";
    const sortOrder = (params.order as "asc" | "desc") || "asc";

    const { drivers, totalPages } = await DriverService.getDrivers(query, currentPage, ITEMS_PER_PAGE, sortBy, sortOrder);

    return (
        <>
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Drivers</h2>
                    <p className="text-muted-foreground">Manage your fleet's drivers and ELD compliance.</p>
                </div>

                <Search placeholder="Search drivers by name or email..." />

                <Button asChild>
                    <Link href="/drivers/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Driver
                    </Link>
                </Button>
            </div>

            <hr />
            
            <div className="rounded-md border bg-card text-card-foreground">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-60 text-center font-bold">Name</TableHead>
                            <TableHead className="text-center font-bold">Email</TableHead>
                            <TableHead className="w-60 text-center font-bold">
                                <Link 
                                    href={`?query=${query}&page=${currentPage}&sort=hosAvailable&order=${sortOrder === 'asc' ? 'desc' : 'asc'}`}
                                    className="flex items-center justify-center gap-1 hover:text-sky-600 transition-colors mx-auto"
                                >
                                    HOS Available
                                    <ArrowUpDown className="h-3 w-3" />
                                </Link>
                            </TableHead>
                            <TableHead className="w-40 text-center font-bold">ELD Status</TableHead>
                            <TableHead className="text-center font-bold">Joined Date</TableHead>
                            <TableHead className="w-40 text-center font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {drivers.map((driver) => (
                        <TableRow key={driver.id}>
                            <TableCell className="text-center font-medium">
                                <div className="flex items-center gap-2 justify-center">
                                    <span className="font-semibold">{driver.name}</span>
                                    {driver.isDriving && (
                                        <div className="flex items-center text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                            <Gauge className="h-4 w-4" />
                                        </div>
                                    )}
                                </div>
                            </TableCell>

                            <TableCell className="text-center">{driver.email}</TableCell>
                            
                            <TableCell className="text-center">
                                <span className={`px-2 py-1 rounded text-xs font-bold border ${getHosBadgeClass(driver.hosAvailable)}`}>
                                    {formatHOS(driver.hosAvailable)}
                                </span>
                            </TableCell>

                            <TableCell className="text-center">
                                {driver.eldStatus === "CONNECTED" ? (
                                        <span className="flex items-center justify-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-100 uppercase">
                                            <UserCheck className="h-3 w-3" /> Connected
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-1 text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded border border-red-100 uppercase">
                                            <UserX className="h-3 w-3" /> Disconnected
                                        </span>
                                    )}
                            </TableCell>

                            <TableCell className="text-center">{new Date(driver.createdAt).toLocaleDateString()}</TableCell>

                            <TableCell className="text-center w-25">
                                <div className="flex justify-center gap-2">
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link href={`/drivers/${driver.id}`}>
                                            <Pencil className="w-4 h-4" />
                                        </Link>
                                    </Button>

                                    <form action={deleteDriver.bind(null, driver.id)}>
                                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-100">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </div>
                            </TableCell>
                        </TableRow>
                        ))}

                        {drivers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No drivers found.
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
        </>
    );
}

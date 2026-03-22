import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Pencil, UserCheck, UserX } from "lucide-react";

import Link from "next/link";
import { deleteDriver } from "@/lib/actions";
import { Search } from "@/components/dashboard/search";
import { DriverService } from "@/services/drivers/driver-service";

interface PageProps {
    searchParams: Promise<{ 
        query?: string;
        page?: string;
    }>;
}

export default async function DriversPage({ searchParams }: PageProps) {
    const ITEMS_PER_PAGE = 20;

    const params = await searchParams;
    const query = params.query || "";
    const currentPage = Number(params.page) || 1;

    const { drivers, totalPages } = await DriverService.getDrivers(query, currentPage, ITEMS_PER_PAGE);

    return (
        <>
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Drivers</h2>
                    <p className="text-muted-foreground">Manage your fleet's drivers and ELD compliance.</p>
                </div>

                <Search placeholderName="Search drivers..." />

                <Button asChild>
                    <Link href="/drivers/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Driver
                    </Link>
                </Button>
            </div>

            <hr />
            
            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-40 text-center font-bold text-slate-700">Name</TableHead>
                            <TableHead className="text-center font-bold text-slate-700">Email</TableHead>
                            <TableHead className="w-40 text-center font-bold text-slate-700">ELD Status</TableHead>
                            <TableHead className="text-center font-bold text-slate-700">Joined Date</TableHead>
                            <TableHead className="w-40 text-center font-bold text-slate-700">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {drivers.map((driver) => (
                        <TableRow key={driver.id}>
                            <TableCell className="text-center font-medium">{driver.name}</TableCell>
                            <TableCell className="text-center">{driver.email}</TableCell>
                            
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

                            <TableCell className="text-right w-25">
                                <div className="flex justify-end gap-2">
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
        </>
    );
}

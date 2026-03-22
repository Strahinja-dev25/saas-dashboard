import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Pencil } from "lucide-react";

import Link from "next/link";
import { deleteTruck } from "@/lib/actions";
import { Search } from "@/components/dashboard/search";
import { AssignDriverModal } from "@/components/fleet/assign-driver-modal";
import { TruckService } from "@/services/fleet/truck-service";
import { DriverService } from "@/services/drivers/driver-service";

interface PageProps {
    searchParams: Promise<{ 
        query?: string;
        page?: string;
    }>;
}

export default async function FleetPage ({ searchParams }: PageProps) {
    const ITEMS_PER_PAGE = 20;

    const params = await searchParams;
    const query = params.query || "";
    const currentPage = Number(params.page) || 1;

    const { trucks, totalPages } = await TruckService.getFleet(query, currentPage, ITEMS_PER_PAGE);
    const allDrivers = await DriverService.getDriversForAssignment();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Fleet Status</h2>
                    <p className="text-muted-foreground">Manage your trucks and trailers here.</p>
                </div>

                <Search placeholderName="Search unit # or driver name..." />

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
                        {trucks.map((truck) => {
                            const isOperable = truck.status === "AVAILABLE" || truck.status === "IN_TRANSIT";
                        
                            return (
                                <TableRow key={truck.id}>
                                    <TableCell className="text-center font-medium">{truck.unitNumber}</TableCell>

                                    <TableCell className="text-center">
                                        {truck?.driver?.name ? (
                                            // Postoji vozac, prikazujemo njegovo ime i opciju za promenu/odvajanje
                                            <div className="flex items-center justify-center gap-1">
                                                <span className="font-semibold text-slate-900">
                                                    {truck.driver.name}
                                                </span>
                                                <AssignDriverModal 
                                                    truckId={truck.id} 
                                                    currentDriverId={truck.driverId}
                                                    currentHos={truck.hosRemaining}
                                                    drivers={allDrivers} 
                                                    disabled={!isOperable}
                                                />
                                            </div>
                                        ) : (
                                            // Nema vozaca, prikazujemo dugme za dodeljivanje
                                            <AssignDriverModal 
                                                truckId={truck.id} 
                                                currentDriverId={truck.driverId}
                                                currentHos={truck.hosRemaining}
                                                drivers={allDrivers}
                                                disabled={!isOperable}
                                            />
                                        )}
                                    </TableCell>

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
                            );
                        })}

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
                        
            { /* Pagination controls */ }
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

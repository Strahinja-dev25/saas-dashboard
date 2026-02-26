import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { DollarSign, Truck, Map, Activity } from "lucide-react";
import { LucideIcon } from 'lucide-react';
import { db } from '@/lib/db';
//import { Product } from "@prisma/client";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentLoads } from "@/components/dashboard/recent-loads";

interface StatItem {
    label: string;
    value: string;
    description: string;
    icon: LucideIcon;
    color: string;
};

interface DetailedLoadItem {
    id: string;
    amount: number;
    miles: number;
    createdAt: Date;
    truck: {
        unitNumber: string;
        driverName: string;
    } | null;
};

export default async function Home () {
    // Prva kartica
    const loadsAggregation = await db.load.aggregate({
        _sum: { amount: true, miles: true }
    });

    const totalRevenue = loadsAggregation._sum.amount || 0;
    const totalMiles = loadsAggregation._sum.miles || 0;

    // Druga kartica
    const activeTrucks = await db.truck.count({
        where: { status: "IN_TRANSIT" }
    });

    const totalTrucks = await db.truck.count();

    // Treca kartica
    const rpm = totalMiles > 0 ? (totalRevenue / totalMiles) : 0;

    // Cetvrta kartica
    const pendingLoads = await db.load.count({
        where: { truckId: null }
    });

    const stats: StatItem[] = [
        { 
            label: "Total Gross Revenue", 
            value: `$${totalRevenue.toLocaleString()}`,
            description: "All-time earnings", 
            icon: DollarSign, 
            color: "text-emerald-500" 
        },
        { 
            label: "Active Trucks", 
            value: activeTrucks.toString(), 
            description: `Out of ${totalTrucks} total units`, 
            icon: Truck, 
            color: "text-sky-500" 
        },
        { 
            label: "Avg. Revenue / Mile", 
            value: `$${rpm.toFixed(2)}`, 
            description: "Fleet average RPM", 
            icon: Activity, 
            color: "text-amber-500" 
        },
        { 
            label: "Available Loads", 
            value: pendingLoads.toString(),
            description: "Pending dispatch", 
            icon: Map, 
            color: "text-indigo-500" 
        },
    ];

    // Za grafikon (Mesečna zarada od tura)
    const loadsForChart = await db.load.findMany({
        where: {
            createdAt: {
                gte: new Date(new Date().getFullYear(), 0, 1),
            }
        }
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Avg", "Sep", "Okt", "Nov", "Dec"];
    const graphData = monthNames.map(name => ({ name, total: 0 }));

    loadsForChart.forEach(load => {
        const month = load.createdAt.getMonth();
        graphData[month].total += load.amount;
    });

    // Za listu poslednjih prodaja
    const recentLoads = await db.load.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
            truck: {
                select: {
                    unitNumber: true,
                    driverName: true,
                },
            },
        },
    });

    // Za tabelu poslednjih 7 transakcija
    const detailedLoads: DetailedLoadItem[] = await db.load.findMany({
        take: 7,
        orderBy: { createdAt: "desc" },
        include: {
            truck: {
                select: {
                    unitNumber: true,
                    driverName: true,
                }
            }
        }
    });

    return (
        <div className="space-y-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                { stats.map((stat) => (
                    <Card key={stat.label}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>

                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-slate-500">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-10">
                <div className="lg:col-span-6">
                    <RevenueChart data={graphData} />
                </div>

                <div className="lg:col-span-4">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Recent Loads</CardTitle>
                        </CardHeader>

                        <CardContent>
                            <RecentLoads loads={recentLoads} />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid gap-4 grid-cols-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Dispatches</CardTitle>
                        <p className="text-sm text-muted-foreground italic">Overview of the last 7 loads with mileage and revenue.</p>
                    </CardHeader>

                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-30 text-center text-[11px] uppercase font-bold">Load ID</TableHead>
                                    <TableHead className="text-left">Driver</TableHead>
                                    <TableHead className="text-center">Unit #</TableHead>
                                    <TableHead className="text-right">Miles</TableHead>
                                    <TableHead className="text-right">Rate / Mile</TableHead>
                                    <TableHead className="text-right">Gross Pay</TableHead>
                                    <TableHead className="w-45 text-right">Date</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {detailedLoads.map(load => {
                                    const rpm = load.miles > 0 ? (load.amount / load.miles).toFixed(2) : "0.00";

                                    return (
                                        <TableRow key={load.id} className="hover:bg-slate-50/80 transition-colors">
                                            <TableCell className="text-center">#{load.id.slice(-6).toUpperCase()}</TableCell>
                                            
                                            <TableCell className="font-bold text-center">
                                                {load.truck ? load.truck.driverName : <span className="text-amber-500">Unassigned</span>}
                                            </TableCell>
                                            
                                            <TableCell className="text-muted-foreground text-center">{load.truck ? load.truck.unitNumber : "-"}</TableCell>
                                            <TableCell className="font-semibold text-center">{load.miles} mi</TableCell>
                                            
                                            <TableCell className="text-center">${rpm}</TableCell>
                                            <TableCell className="text-center">${load.amount.toLocaleString()}</TableCell>
                                            
                                            <TableCell className="text-muted-foreground text-center">
                                                {new Date(load.createdAt).toLocaleDateString("en-US", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

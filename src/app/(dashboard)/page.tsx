import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { DollarSign, Truck, Map, Activity } from "lucide-react";
import { LucideIcon } from 'lucide-react';
import { getDashboardStats } from '@/lib/dashboard';
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { ActiveLoads } from "@/components/dashboard/active-loads";
import { db } from "@/lib/db";
import { LoadStatus } from "@prisma/client";

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
    status: LoadStatus;
    createdAt: Date;
    truck: {
        unitNumber: string;
        driver: {
            name: string;
        } | null;
    } | null;
};

export default async function Home () {
    const { totalRevenue, activeTrucks, totalTrucks, pendingLoads, rpm } = await getDashboardStats();

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
            status: LoadStatus.DELIVERED,
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

    // Za listu aktivnih tura (PENDING i ASSIGNED)
    const activeLoads = await db.load.findMany({
        where: {
            status: {
                in: [LoadStatus.PENDING, LoadStatus.ASSIGNED],
            },
        },
        take: 5,
        orderBy: {
            createdAt: "desc",
        },
        include: {
            truck: {
                include: {
                    driver: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
        },
    });

    // Za tabelu poslednjih 7 tura
    const detailedLoads: DetailedLoadItem[] = await db.load.findMany({
        take: 7,
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            amount: true,
            miles: true,
            status: true,
            createdAt: true,
            truck: {
                select: {
                    unitNumber: true,
                    driver: { select: { name: true } },
                },
            },
        },
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
                            <CardTitle>Active Loads</CardTitle>
                        </CardHeader>

                        <CardContent>
                            <ActiveLoads loads={activeLoads} />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid gap-4 grid-cols-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Loads</CardTitle>
                        <p className="text-sm text-muted-foreground italic">Overview of the last 7 loads</p>
                    </CardHeader>

                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-30 text-center text-[11px] uppercase font-bold">Load ID</TableHead>
                                    <TableHead className="text-center">Driver</TableHead>
                                    <TableHead className="text-center">Truck #</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-center">Amount</TableHead>
                                    <TableHead className="w-45 text-center">Date</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {detailedLoads.map(load => {
                                    const rpm = load.miles > 0 ? (load.amount / load.miles).toFixed(2) : "0.00";

                                    return (
                                        <TableRow key={load.id} className="hover:bg-slate-50/80 transition-colors">
                                            <TableCell className="text-center">#{load.id.slice(-6).toUpperCase()}</TableCell>
                                            
                                            <TableCell className="font-bold text-center">
                                                {load.truck?.driver?.name || <span className="text-amber-500">Unassigned</span>}
                                            </TableCell>
                                            
                                            <TableCell className="text-muted-foreground text-center">{load.truck?.unitNumber || "-"}</TableCell>

                                            <TableCell className="font-semibold text-center">
                                                {load.status === LoadStatus.DELIVERED && <span className="text-emerald-500">Delivered</span>}
                                                {load.status === LoadStatus.ASSIGNED && <span className="text-sky-500">Assigned</span>}
                                                {load.status === LoadStatus.PENDING && <span className="text-amber-500">Pending</span>}
                                            </TableCell>
                                            
                                            <TableCell className="text-center">{load.amount.toLocaleString("en-US", { style: "currency", currency: "USD" })}</TableCell>
                                            
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

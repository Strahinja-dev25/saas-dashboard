import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { DollarSign, Truck, Map, Activity } from "lucide-react";

import { DashboardService } from '@/services/dashboard-service';
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { ActiveLoads } from "@/components/dashboard/active-loads";
import { StatItem, DetailedLoadItem } from "@/types/index";

export default async function Home () {
    // Za 4 kartice
    const { totalRevenue, activeTrucks, totalTrucks, pendingLoads, rpm } = await DashboardService.getStats();

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
    const graphData = await DashboardService.getChartData();

    // Za listu aktivnih tura (PENDING i ASSIGNED)
    const activeLoads = await DashboardService.getActiveLoadsList();

    // Za tabelu poslednjih 7 tura
    const detailedLoads: DetailedLoadItem[] = await DashboardService.getRecentTransactions();

    return (
        <div className="space-y-6">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                { stats.map((stat) => (
                    <Card key={stat.label} className="glass-panel border-white/5 hover:border-primary/30 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-transparent">
                            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                            <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                                <stat.icon className="h-4 w-4" />
                            </div>
                        </CardHeader>

                        <CardContent className="bg-transparent">
                            <div className="text-3xl font-black tracking-tight">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
            
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-10">
                <div className="lg:col-span-6">
                    <RevenueChart data={graphData} />
                </div>

                <div className="lg:col-span-4">
                    <Card className="h-full glass-panel border-white/5">
                        <CardHeader className="bg-transparent border-b border-white/5 pb-4">
                            <CardTitle>Active Loads</CardTitle>
                        </CardHeader>

                        <CardContent className="bg-transparent pt-4">
                            <ActiveLoads loads={activeLoads} />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid gap-6 grid-cols-1">
                <Card className="glass-panel border-white/5">
                    <CardHeader className="bg-transparent border-b border-white/5 pb-4">
                        <CardTitle>Recent Loads</CardTitle>
                        <p className="text-sm text-muted-foreground italic mt-1">Overview of the last 7 loads</p>
                    </CardHeader>

                    <CardContent className="bg-transparent pt-0">
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
                                        <TableRow key={load.id} className="transition-colors">
                                            <TableCell className="text-center">#{load.id.slice(-6).toUpperCase()}</TableCell>
                                            
                                            <TableCell className="font-bold text-center">
                                                {load.truck?.driver?.name || <span className="text-amber-500">Unassigned</span>}
                                            </TableCell>
                                            
                                            <TableCell className="text-muted-foreground text-center">{load.truck?.unitNumber || "-"}</TableCell>

                                            <TableCell className="font-semibold text-center">
                                                {load.status === "DELIVERED" && <span className="text-emerald-500">Delivered</span>}
                                                {load.status === "ASSIGNED" && <span className="text-sky-500">Assigned</span>}
                                                {load.status === "PENDING" && <span className="text-amber-500">Pending</span>}
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

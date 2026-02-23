import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { DollarSign, Users, Package, Boxes } from "lucide-react";
import { LucideIcon } from 'lucide-react';
import { db } from '@/lib/db';
import { Product } from "@prisma/client"; // Definisemo tip producta iz client fajla
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentSales } from "@/components/dashboard/recent-sales";

interface StatItem {
    label: string;
    value: string;
    description: string;
    icon: LucideIcon;
    color: string;
};

interface DetailedSaleItem {
    id: string;
    amount: number;
    status: string;
    createdAt: Date;
    customer: {
        name: string;
        email: string;
    };
};

export default async function Home () {
    // Prva kartica
    const salesAggregation = await db.sale.aggregate({
        _sum: { amount: true }
    });

    const totalRevenue = salesAggregation._sum.amount || 0;
    
    // Druga kartica
    const customersCount = await db.customer.count();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const newCustomersToday = await db.customer.count({
        where: { createdAt: { gte: startOfToday } },
    });

    // Treca kartica
    const productsCount = await db.product.count();
    const lowStockCount = await db.product.count({
        where: { stock: { lt: 5 } }
    });

    // Cetvrta kartica
    const products = await db.product.findMany();
    const totalValue = products.reduce((acc: number, product: Product) => acc + (product.price * product.stock), 0);

    const stats: StatItem[] = [
        { label: "Ukupan Prihod", value: `${totalRevenue.toLocaleString()} €`, description: "+20% od prošlog meseca", icon: DollarSign, color: "text-emerald-500" },
        { label: "Klijenti", value: customersCount.toLocaleString(), description: `+${newCustomersToday} novih danas`, icon: Users, color: "text-sky-500" },
        { label: "Proizvodi", value: productsCount.toLocaleString(), description: `${lowStockCount.toLocaleString()} na kritičnom stanju`, icon: Package, color: "text-orange-500" },
        { label: "Ukupna Vrednost", value: `${totalValue.toLocaleString()} €`, description: "Ukupna vrednost robe u magacinu", icon: Boxes, color: "text-blue-500" },
    ];

    // Za grafikone
    const sales = await db.sale.findMany({
        where: {
            createdAt: {
                gte: new Date(new Date().getFullYear(), 0, 1),
            }
        }
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Avg", "Sep", "Okt", "Nov", "Dec"];

    const graphData = monthNames.map(name => ({ name, total: 0 }));

    sales.forEach(sale => {
        const month = sale.createdAt.getMonth();
        graphData[month].total += sale.amount;
    });

    // Za listu poslednjih prodaja
    const recentSales = await db.sale.findMany({
        take: 5,
        orderBy: {
            createdAt: "desc",
        },
        include: {
            customer: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
    });

    // Za tabelu poslednjih 7 transakcija
    const detailedSales: DetailedSaleItem[] = await db.sale.findMany({
        take: 7,
        orderBy: { createdAt: "desc" },
        include: {
            customer: {
                select: {
                    name: true,
                    email: true,
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
                            <CardTitle>Poslednje prodaje</CardTitle>
                        </CardHeader>

                        <CardContent>
                            <RecentSales sales={recentSales} />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid gap-4 grid-cols-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Pregled transakcija</CardTitle>
                        <p className="text-sm text-muted-foreground italic">Prikaz poslednjih 7 prodaja sa statusom.</p>
                    </CardHeader>

                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Klijent</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="text-right">Iznos</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right">Datum</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {detailedSales.map(sale => (
                                    <TableRow>
                                        <TableCell>{sale.customer.name}</TableCell>
                                        <TableCell>{sale.customer.email}</TableCell>
                                        <TableCell>{sale.amount}</TableCell>
                                        <TableCell>{sale.status}</TableCell>
                                        <TableCell>{sale.createdAt.toString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

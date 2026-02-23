import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { DollarSign, Users, Package, Boxes, CreditCard, Banknote, Wallet } from "lucide-react";
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
    payMethod: string;
    createdAt: Date;
    customer: {
        name: string;
        email: string;
    };
};

export default async function Home () {
    // Prva kartica
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const salesAggregation = await db.sale.aggregate({
        _sum: { amount: true }
    });

    const totalRevenue = salesAggregation._sum.amount || 0;

    const thisMonthRevenue = await db.sale.aggregate({
        _sum: { amount: true },
        where: {
            createdAt: { gte: startOfThisMonth }
        }
    });

    const lastMonthRevenue = await db.sale.aggregate({
        _sum: { amount: true },
        where: {
            createdAt: {
                gte: startOfLastMonth,
                lt: startOfThisMonth,
            }
        }
    });
    
    const current = thisMonthRevenue._sum.amount || 0;
    const previous = lastMonthRevenue._sum.amount || 0;
    
    let percentageChange = 0;
    if (previous > 0)
        percentageChange = ((current - previous) / previous) * 100;
    else if (current > 0 && previous === 0)
        percentageChange = 100;

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
        { label: "Ukupan Prihod", value: `${totalRevenue.toLocaleString()} €`, description: `${percentageChange >= 0 ? "+" : ""}${percentageChange.toFixed(1)}% od prošlog meseca`, icon: DollarSign, color: "text-emerald-500" },
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
                    id: true,
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
                                    <TableHead className="w-50 text-center">ID Klijenta</TableHead>
                                    <TableHead className="w-60 text-center">Klijent</TableHead>
                                    <TableHead className="text-center">Email</TableHead>
                                    <TableHead className="w-45 text-center">Iznos</TableHead>
                                    <TableHead className="w-40 text-center">Status</TableHead>
                                    <TableHead className="w-50 text-center">Metoda plaćanja</TableHead>
                                    <TableHead className="w-50 text-center">Datum</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {detailedSales.map(sale => (
                                    <TableRow key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                                        <TableCell className="text-center">#{sale.id.slice(-6).toUpperCase()}</TableCell>
                                        <TableCell className="font-bold text-center">{sale.customer.name}</TableCell>
                                        <TableCell className="text-muted-foreground text-center">{sale.customer.email}</TableCell>
                                        <TableCell className="font-semibold text-center">{sale.amount.toLocaleString()} €</TableCell>
                                        <TableCell className="text-center">
                                            { sale.status == "PLACENO" && (
                                                <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-xs font-semibold">✅ Plaćeno</span>
                                            )}
                                            {sale.status == "CEKA" && (
                                                <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded text-xs font-semibold">⏳ Čeka</span>
                                            )}
                                            {sale.status == "OTKAZANO" && (
                                                <span className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs font-semibold">❌ Otkazano</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            { sale.payMethod == "KARTICA" && (
                                                <div className="flex justify-center items-center gap-1.5 text-slate-700 px-2 py-1 rounded font-medium">
                                                    <CreditCard className="h-3 w-3" />
                                                    Kartica
                                                </div>
                                            )}
                                            { sale.payMethod == "KEŠ" && (
                                                <div className="flex justify-center items-center gap-1.5 text-slate-700 px-2 py-1 rounded font-medium">
                                                    <Banknote className="h-3 w-3" />
                                                    Keš
                                                </div>
                                            )}
                                            { sale.payMethod == "PAYPAL" && (
                                                <div className="flex justify-center items-center gap-1.5 text-slate-700 px-2 py-1 rounded font-medium">
                                                    <Wallet className="h-3 w-3" />
                                                    PayPal
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-center">
                                            { sale.createdAt.toLocaleDateString("sr-RS", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </TableCell>
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

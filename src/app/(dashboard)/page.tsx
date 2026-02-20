import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Package, Boxes } from "lucide-react";
import { LucideIcon } from 'lucide-react';
import { db } from '@/lib/db';
import { Product } from "@prisma/client"; // Definisemo tip producta iz client fajla

interface StatItem {
    label: string;
    value: string;
    description: string;
    icon: LucideIcon;
    color: string;
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

    return (
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
    );
}

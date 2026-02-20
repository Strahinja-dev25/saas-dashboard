import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Package } from "lucide-react";
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
    const productsCount = await db.product.count();
    const products = await db.product.findMany();
    const totalValue = products.reduce((acc: number, product: Product) => acc + (product.price * product.stock), 0);

    const stats: StatItem[] = [
        { label: "Ukupan Prihod", value: `${totalValue.toLocaleString()} €`, description: "+20% od prošlog meseca", icon: DollarSign, color: "text-emerald-500" },
        { label: "Klijenti", value: totalValue.toLocaleString(), description: "+12 novih danas", icon: Users, color: "text-sky-500" },
        { label: "Proizvodi", value: productsCount.toLocaleString(), description: "5 na kritičnom stanju", icon: Package, color: "text-orange-500" },
    ];
    
    return (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">

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

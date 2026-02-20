import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function ProductsPage() {
    const products = await db.product.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Proizvodi</h2>
                    <p className="text-muted-foreground">Upravljajte svojim inventarom ovde.</p>
                </div>
                <Button asChild>
                    <Link href="/products/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Dodaj proizvod
                    </Link>
                </Button>
            </div>
            
            <hr />

            {/* Ovde ćemo u sledećem koraku staviti Shadcn tabelu */}
            <div className="bg-white rounded-md border p-4">
               Trenutno imate {products.length} proizvoda u bazi.
            </div>
        </div>
    );
}

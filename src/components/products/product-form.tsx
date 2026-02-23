"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/lib/actions";
import { Product } from "@prisma/client";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(3, "Naziv mora imati bar 3 karaktera"),
  price: z.coerce.number().min(0.01, "Cena mora biti veća od 0"),
  stock: z.coerce.number().int().min(0, "Stanje ne može biti negativno"),
  category: z.string().min(1, "Izaberite kategoriju"),
});

interface ProductFormProps {
    initialData?: Product;
};

export function ProductForm ({ initialData }: ProductFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        price: initialData?.price || "",
        stock: initialData?.stock || "",
        category: initialData?.category || "",
    });

    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);

    async function handleSubmit (e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setIsPending(true);
        
        const result = productSchema.safeParse(formData);

        if(!result.success)
        {
            const errorMessage = result.error.issues[0].message;
            setError(errorMessage);
            setIsPending(false);

            setTimeout(() => setError(null), 3000);
            return;
        }

        try {
            if(initialData)
                await updateProduct(initialData.id, result.data);
            else
                await createProduct(result.data);
        } catch(err) {
            setError("Doslo je do greske pri cuvanju.");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="mb-4"
            >
                ← Nazad
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>
                        {initialData ? `Izmena proizvoda: ${formData.name}` : "Dodaj novi proizvod"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative animate-in fade-in duration-300">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="name">Naziv proizvoda</Label>
                            <Input 
                                id="name"
                                placeholder="npr. iPhone 15 Pro..." 
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                disabled={isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price">Cena (€)</Label>
                            <Input 
                                id="price"
                                type="number" 
                                placeholder="0.00"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                disabled={isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="stock">Kolicina</Label>
                            <Input 
                                id="stock"
                                type="number"
                                placeholder="0"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                disabled={isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Kategorija</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                                disabled={isPending}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Izaberi kategoriju" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Telefoni">Telefoni</SelectItem>
                                    <SelectItem value="Laptopovi">Laptopovi</SelectItem>
                                    <SelectItem value="Oprema">Oprema</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Čuvanje...
                                </>
                            ) : (
                                initialData ? "Sačuvaj izmene" : "Sačuvaj proizvod"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

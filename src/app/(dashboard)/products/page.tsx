import { Button } from "@/components/ui/button";
import { Plus, Trash2, Pencil } from "lucide-react";
import { db } from "@/lib/db";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteProduct } from "@/lib/actions";

export default async function ProductsPage() {
    const products = await db.product.findMany({
        orderBy: { createdAt: 'desc' }
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
            
            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Naziv</TableHead>
                            <TableHead>Kategorija</TableHead>
                            <TableHead className="text-right">Cena</TableHead>
                            <TableHead className="text-right">Stanje</TableHead>
                            <TableHead className="text-right">Datum</TableHead>
                            <TableHead className="text-center w-25">Akcije</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {products.map((product) => (
                        <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell className="text-right">{product.price.toLocaleString()} €</TableCell>
                            <TableCell className="text-right">
                                <span className={product.stock < 5 ? "text-red-600 font-bold" : ""}>
                                    {product.stock}
                                </span>
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                                {new Date(product.createdAt).toLocaleDateString()}
                            </TableCell>

                            <TableCell className="text-right w-25">
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link href={`/products/${product.id}`}>
                                            <Pencil className="w-4 h-4" />
                                        </Link>
                                    </Button>

                                    <form action={deleteProduct.bind(null, product.id)}>
                                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-100">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </div>
                            </TableCell>
                        </TableRow>
                        ))}

                        {products.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    Nema pronađenih proizvoda.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

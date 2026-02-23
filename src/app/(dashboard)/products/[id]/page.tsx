import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/products/product-form";

interface EditProductsPageProps {
    params: Promise<{ id:string }>;
};

export default async function EditProductsPage ({ params }: EditProductsPageProps) {
    const { id } = await params;

    const product = await db.product.findUnique({
        where: {
            id: id,
        },
    });

    if(!product)
        notFound();

    return (
        <ProductForm initialData={product} />
    );
}
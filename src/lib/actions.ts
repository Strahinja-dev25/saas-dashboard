"use server"; // Ovo garantuje da se kod izvršava isključivo na serveru

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(3),
  price: z.coerce.number().min(0.01),
  stock: z.coerce.number().int().min(0),
  category: z.string().min(1),
});

export async function createProduct (rawData: any) {
    const validatedData = productSchema.parse(rawData);

    await db.product.create({
        data: validatedData,
    });

    revalidatePath("/products");
    revalidatePath("/");

    redirect("/products");
}

export async function deleteProduct (id: string) {
    await db.product.delete({
        where: {
            id: id,
        },
    });

    revalidatePath("/products");
    revalidatePath("/");
}

export async function updateProduct (id:string, rawData: any) {
    const validatedData = productSchema.parse(rawData);

    await db.product.update({
        where: { id: id },
        data: validatedData,
    });

    revalidatePath("/products");
    revalidatePath("/");

    redirect("/products");
}

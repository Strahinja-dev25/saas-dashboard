"use server"; // Ovo garantuje da se kod izvršava isključivo na serveru

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const truckSchema = z.object({
  unitNumber: z.string().min(2),
  driverName: z.string().min(2),
  status: z.string(),
  location: z.string().min(2),
  destination: z.string().optional().nullable(),
  equipmentType: z.string(),
  hosRemaining: z.string(),
});

export async function createTruck (rawData: any) {
    const validatedData = truckSchema.parse(rawData);

    await db.truck.create({
        data: validatedData,
    });

    revalidatePath("/fleet");
    revalidatePath("/");

    redirect("/fleet");
}

export async function deleteTruck (id: string) {
    await db.truck.delete({
        where: {
            id: id,
        },
    });

    revalidatePath("/fleet");
    revalidatePath("/");
}

export async function updateTruck (id:string, rawData: any) {
    const validatedData = truckSchema.parse(rawData);

    await db.truck.update({
        where: { id: id },
        data: validatedData,
    });

    revalidatePath("/fleet");
    revalidatePath("/");

    redirect("/fleet");
}

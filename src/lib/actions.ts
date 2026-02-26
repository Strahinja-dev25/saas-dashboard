"use server"; // Ovo garantuje da se kod izvršava isključivo na serveru

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// Truck services
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

// Load services
const loadSchema = z.object({
    amount: z.coerce.number().min(1, "Amount must be at least $1"),
    miles: z.coerce.number().int().min(1, "Miles must be at least 1"),
    truckId: z.string().min(1, "Please select a truck"),
});

export async function createLoad (rawData: any) {
    const validatedData = loadSchema.parse(rawData);

    await db.load.create({
        data: validatedData,
    });

    revalidatePath("/loads");
    revalidatePath("/");

    redirect("/loads");
}

export async function deleteLoad (id: string) {
    await db.load.delete({
        where: {
            id: id,
        },
    });

    revalidatePath("/loads");
    revalidatePath("/");
}

export async function updateLoad (id: string, rawData: any) {
    const validatedData = loadSchema.parse(rawData);

    await db.load.update({
        where: {
            id: id,
        },
        data: validatedData,
    });

    revalidatePath("/loads");
    revalidatePath("/");

    redirect("/loads");
}

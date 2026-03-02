"use server"; // Ovo garantuje da se kod izvršava isključivo na serveru

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { TruckStatus, LoadStatus } from "@prisma/client";

// PRIVREMENO: Ovde staviti pravi ID firme iz baze
const HARDCODED_COMPANY_ID = "cm7onawte2"; 

// Truck services
const truckSchema = z.object({
    unitNumber: z.string().min(1, "Unit # is required"),
    driverId: z.string().optional().or(z.literal("")), 
    status: z.nativeEnum(TruckStatus),
    location: z.string().min(2),
    destination: z.string().optional().nullable(),
    equipmentType: z.string(),
    hosRemaining: z.string(),
});

export async function createTruck (rawData: any) {
    const validatedData = truckSchema.parse(rawData);

    await db.truck.create({
        data: {
            ...validatedData,
            companyId: HARDCODED_COMPANY_ID,
            driverId: validatedData.driverId || null, 
        }
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
        data: {
            ...validatedData,
        }
    });

    revalidatePath("/fleet");
    revalidatePath("/");

    redirect("/fleet");
}

// Load services
const loadSchema = z.object({
    amount: z.coerce.number().min(1),
    miles: z.coerce.number().int().min(1),
    status: z.nativeEnum(LoadStatus),
    truckId: z.string().optional().or(z.literal("unassigned")), 
});

export async function createLoad (rawData: any) {
    const validatedData = loadSchema.parse(rawData);

    await db.load.create({
        data: {
            ...validatedData,
            companyId: HARDCODED_COMPANY_ID,
            truckId: validatedData.truckId === "unassigned" ? null : validatedData.truckId,
        }
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

// Driver services
const driverSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    eldStatus: z.string(),
});

export async function createDriver (rawData: any) {
    const validatedData = driverSchema.parse(rawData);

    await db.driver.create({
        data: {
            ...validatedData,
            companyId: HARDCODED_COMPANY_ID,
        }
    });

    revalidatePath("/drivers");

    redirect("/drivers");
}

export async function deleteDriver (id: string) {
    await db.driver.delete({ where: { id } });

    revalidatePath("/drivers");
}

export async function updateDriver (id: string, rawData: any) {
    const validatedData = driverSchema.parse(rawData);

    await db.driver.update({
        where: {
            id: id,
        },
        data: validatedData,
    });

    revalidatePath("/drivers");

    redirect("/drivers");
}

"use server"; // Ovo garantuje da se kod izvršava isključivo na serveru

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { truckSchema, driverSchema, loadSchema, expenseSchema } from '@/lib/schemas/index';
import { TruckService } from "@/services/fleet/truck-service";
import { DriverService } from "@/services/drivers/driver-service";
import { LoadService } from "@/services/loads/load-service";
import { LoadStatus } from "@prisma/client";
import { ExpenseService } from "@/services/expenses/expense-service";

// PRIVREMENO: Ovde staviti pravi ID firme iz baze
const HARDCODED_COMPANY_ID = "firma-1"; 

// Truck services
export async function createTruck (rawData: any) {
    const validatedData = truckSchema.parse(rawData);

    await TruckService.createTruck(validatedData);

    revalidatePath("/fleet");
    revalidatePath("/dashboard");

    redirect("/fleet");
}

export async function updateTruck (id:string, rawData: any) {
    const validatedData = truckSchema.parse(rawData);

    await TruckService.updateTruck(id, validatedData);

    revalidatePath("/fleet");
    revalidatePath("/dashboard");

    redirect("/fleet");
}

export async function assignDriverToTruck (truckId: string, driverId: string | undefined) {
    
    try {
        await TruckService.assignDriver(truckId, driverId);

        revalidatePath("/fleet");
        revalidatePath("/dashboard");
    }
    catch (error: any) {
        throw new Error(error?.message || "Failed to assign driver.");
    }
}

export async function deleteTruck (id: string) {
    await TruckService.deleteTruck(id);

    revalidatePath("/fleet");
    revalidatePath("/dashboard");
}

// Driver services
export async function createDriver (rawData: any) {
    const validatedData = driverSchema.parse(rawData);

    await DriverService.createDriver(validatedData);

    revalidatePath("/drivers");
    redirect("/drivers");
}

export async function updateDriver (id: string, rawData: any) {
    const validatedData = driverSchema.parse(rawData);

    await DriverService.updateDriver(id, validatedData);

    revalidatePath("/drivers");
    redirect("/drivers");
}

export async function deleteDriver (id: string) {
    try {
        await DriverService.deleteDriver(id);
        revalidatePath("/drivers");
    }
    catch (error: any) {
        console.error(error.message);
        throw new Error(error.message);
    }
}

// Load services
export async function createLoad (rawData: any) {
    const validatedData = loadSchema.parse(rawData);

    const initialStatus = validatedData.truckId === "unassigned" ? LoadStatus.PENDING : LoadStatus.ASSIGNED;

    await LoadService.createLoad({...validatedData, status: initialStatus});

    revalidatePath("/loads");
    revalidatePath("/dashboard");

    redirect("/loads");
}

export async function updateLoadData (id: string, rawData: any) {
    const validatedData = loadSchema.parse(rawData);
    await LoadService.updateLoadData(id, validatedData);

    revalidatePath("/loads");
    revalidatePath("/dashboard");

    redirect("/loads");
}

export async function updateLoadStatus (id: string, status: LoadStatus) {
    await LoadService.updateLoadStatus(id, status);

    revalidatePath("/loads");
    revalidatePath("/fleet");
    revalidatePath("/dashboard");
}

export async function deleteLoad (id: string) {
    await LoadService.deleteLoad(id);

    revalidatePath("/loads");
    revalidatePath("/dashboard");
}

// Expense services
export async function createExpense(rawData: any) {
    const validatedData = expenseSchema.parse(rawData);

    await ExpenseService.createExpense(validatedData);

    revalidatePath("/expenses");
}

export async function deleteExpense(id: string) {
    await ExpenseService.deleteExpense(id);

    revalidatePath("/expenses");
}

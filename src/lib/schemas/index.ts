import { z } from "zod";

// TRUCK SCHEMA
export const truckSchema = z.object({
    unitNumber: z.string().min(2, "Unit number must be at least 2 characters"),
    status: z.enum(["AVAILABLE", "IN_TRANSIT", "MAINTENANCE", "OUT_OF_SERVICE"], { message: "Invalid status" }),
    location: z.string().min(2, "Location is required"),
    destination: z.string().optional().nullable(),
    equipmentType: z.string().min(1, "Equipment type is required"),
    driverId: z.string().optional().or(z.literal("")),
});

// LOAD SCHEMA
export const loadSchema = z.object({
    origin: z.string().min(2, "Origin is required (e.g. Chicago, IL)"),
    destination: z.string().min(2, "Destination is required (e.g. Dallas, TX)"),
    amount: z.coerce.number().min(1, "Amount must be at least $1"),
    miles: z.coerce.number().int().min(1, "Miles must be at least 1"),
    truckId: z.string().optional().or(z.literal("unassigned")),
    estimatedHours: z.coerce.number().min(0.1, "Required"),
});

// DRIVER SCHEMA
export const driverSchema = z.object({
    name: z.string().min(2, "Name is required (min 2 chars)"),
    email: z.email("Invalid email address"),
    eldStatus: z.string().min(1, "Status is required"),
});

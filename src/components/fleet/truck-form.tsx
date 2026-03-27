"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useRouter } from "next/navigation";
import { Truck, TruckStatus } from "@prisma/client";
import { createTruck, updateTruck } from "@/lib/actions";
import { truckSchema } from "@/lib/schemas/index";

interface TruckFormProps {
    initialData?: Truck | null;
}

export function TruckForm({ initialData }: TruckFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        unitNumber: initialData?.unitNumber || "",
        status: initialData?.status || "AVAILABLE",
        location: initialData?.location || "",
        equipmentType: initialData?.equipmentType || "Dry Van",
    });

    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setIsPending(true);
        
        const result = truckSchema.safeParse(formData);

        if (!result.success) {
            setError(result.error.issues[0].message);
            setIsPending(false);

            setTimeout(() => setError(null), 3000);
            return;
        }

        try {
            if (initialData)
                await updateTruck(initialData.id, result.data);
            else
                await createTruck(result.data);
        } catch (err) {
            setError("Something went wrong while saving.");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                ← Back
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>
                        {initialData ? `Edit Unit: ${formData.unitNumber}` : "Register New Unit"}
                    </CardTitle>
                </CardHeader>
                
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative animate-in fade-in duration-300">
                                {error}
                            </div>
                        )}

                        { /* 1. Unit Number & Status */ }
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="unitNumber">Unit #</Label>
                                <Input 
                                    id="unitNumber" placeholder="e.g. TRK-101" 
                                    value={formData.unitNumber}
                                    onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                                    disabled={isPending}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val as TruckStatus })} disabled={isPending}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AVAILABLE">Available</SelectItem>
                                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                                        <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        
                        { /* 2. Location & Equipment */ }
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="location">Current Location</Label>
                                <Input 
                                    id="location" placeholder="e.g. Chicago, IL" 
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    disabled={isPending}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Equipment Type</Label>
                                <Select value={formData.equipmentType} onValueChange={(val) => setFormData({ ...formData, equipmentType: val })} disabled={isPending}>
                                    <SelectTrigger><SelectValue placeholder="Select equipment" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Dry Van">Dry Van</SelectItem>
                                        <SelectItem value="Reefer">Reefer</SelectItem>
                                        <SelectItem value="Flatbed">Flatbed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button type="submit" className="w-full mt-6 bg-sky-600 hover:bg-sky-700" disabled={isPending}>
                            {isPending ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                            ) : (
                                initialData ? "Save Changes" : "Register Unit"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

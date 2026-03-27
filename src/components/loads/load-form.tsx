"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

import { useRouter } from "next/navigation";
import { createLoad, updateLoadData } from "@/lib/actions";
import { Load, LoadStatus } from "@prisma/client";
import { loadSchema } from "@/lib/schemas/index";

interface LoadFormProps {
    trucks: {
        id: string;
        unitNumber: string;
        driver?: { name: string } | null;
    }[];
    initialData?: Load | null;
}

export function LoadForm({ trucks, initialData }: LoadFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        origin: initialData?.origin || "",
        destination: initialData?.destination || "",
        amount: initialData?.amount.toString() || "",
        miles: initialData?.miles.toString() || "",
        truckId: initialData?.truckId || "unassigned",
        status: initialData?.status || LoadStatus.PENDING,
        estimatedHours: initialData?.estimatedHours?.toString() || "",
    });

    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isLockedForTruckChange = initialData?.status === "IN_TRANSIT" || initialData?.status === "DELIVERED";

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsPending(true);
        setError(null);

        const result = loadSchema.safeParse(formData);

        if (!result.success) {
            setError(result.error.issues[0].message);
            setIsPending(false);

            setTimeout(() => setError(null), 3000);
            return;
        }

        try {
            if(initialData)
                await updateLoadData(initialData.id, result.data);
            else
                await createLoad(result.data);
        } catch (err) {
            setError("Failed to save load. Please check your input.");
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
                    {initialData ? `Edit Load: #${initialData.id.slice(-6).toUpperCase()}` : "Create New Load"}
                </CardTitle>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    { /* 1. Ruta */ }
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="origin">Origin (Pick-up)</Label>
                            <Input
                                id="origin" type="text" placeholder="e.g. Chicago, IL"
                                value={formData.origin}
                                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                                disabled={isPending}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="destination">Destination (Drop-off)</Label>
                            <Input
                                id="destination" type="text" placeholder="e.g. Dallas, TX"
                                value={formData.destination}
                                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                disabled={isPending}
                            />
                        </div>
                    </div>

                    {/* 2. Revenue and Total Miles */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Gross Revenue ($)</Label>
                            <Input
                                id="amount" type="number" placeholder="0.00"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                disabled={isPending}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="miles">Total Miles</Label>
                            <Input
                                id="miles" type="number" placeholder="0"
                                value={formData.miles}
                                onChange={(e) => setFormData({ ...formData, miles: e.target.value })}
                                disabled={isPending}
                            />
                        </div>
                    </div>

                    {/* 3. Estimated Hours */}
                    <div className="space-y-2">
                        <Label htmlFor="estimatedHours">Est. Duration (Hours)</Label>
                        <Input
                            id="estimatedHours" type="number" step="0.5" placeholder="e.g. 4.5"
                            value={formData.estimatedHours}
                            onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                        />
                    </div>

                    {/* 4. Assign Truck */}
                    <div className="grid grid-cols-2 gap-4 border-t pt-4">
                        <div className="space-y-2">
                            <Label>Assigned Truck</Label>
                            <Select 
                                value={formData.truckId}
                                onValueChange={(val) => setFormData({ ...formData, truckId: val })}
                                disabled={isPending || isLockedForTruckChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a unit" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="unassigned" className="text-amber-600 font-medium">
                                        - Unassigned (Pending Load) -
                                    </SelectItem>
                                    
                                    {trucks.map((truck) => (
                                    <SelectItem key={truck.id} value={truck.id}>
                                        {truck.unitNumber} - {truck.driver?.name || "No Driver"}
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700" disabled={isPending}>
                        {isPending ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                        ) : (
                            initialData ? "Save Changes" : "Create Load"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}

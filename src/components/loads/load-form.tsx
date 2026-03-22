"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { createLoad, updateLoad } from "@/lib/actions";
import { Load } from "@prisma/client";
import { loadSchema } from "@/lib/schemas/index";

interface LoadFormProps {
    trucks: {
        id: string;
        unitNumber: string;
        driverName: string;
    }[];
    initialData?: Load | null;
}

export function LoadForm({ trucks, initialData }: LoadFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        amount: initialData?.amount.toString() || "",
        miles: initialData?.miles.toString() || "",
        truckId: initialData?.truckId || "",
    });

    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                await updateLoad(initialData.id, result.data);
            else
                await createLoad(result.data);
        } catch (err) {
            setError("Failed to save load.");
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
                    {initialData ? `Edit Load: ${initialData.id.slice(-6).toUpperCase()}` : "Dispatch New Load"}
                </CardTitle>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    { /* 1. Select Truck */ }
                    <div className="space-y-2">
                        <Label>Select Assigned Truck</Label>
                        <Select 
                            defaultValue={initialData?.truckId || undefined}
                            onValueChange={(val) => setFormData({ ...formData, truckId: val })}
                            disabled={isPending}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a unit from fleet" />
                            </SelectTrigger>

                            <SelectContent>
                                {trucks.map((truck) => (
                                <SelectItem key={truck.id} value={truck.id}>
                                    {truck.unitNumber} - {truck.driverName}
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        { /* 2. Revenue */ }
                        <div className="space-y-2">
                            <Label htmlFor="amount">Gross Revenue ($)</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                disabled={isPending}
                            />
                        </div>

                        { /* 3. Total miles */ }
                        <div className="space-y-2">
                            <Label htmlFor="miles">Total Miles</Label>
                            <Input
                                id="miles"
                                type="number"
                                placeholder="0"
                                value={formData.miles}
                                onChange={(e) => setFormData({ ...formData, miles: e.target.value })}
                                disabled={isPending}
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700" disabled={isPending}>
                        {isPending ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                        ) : (
                            initialData ? "Save Changes" : "Dispatch Load"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}

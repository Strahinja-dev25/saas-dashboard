"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, User, Mail, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Driver } from "@prisma/client";
import { createDriver, updateDriver } from "@/lib/actions";
import { driverSchema } from "@/lib/schemas/index";

interface DriverFormProps {
    initialData?: Driver | null;
}

export function DriverForm ({ initialData }: DriverFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        email: initialData?.email || "",
        eldStatus: initialData?.eldStatus || "CONNECTED",
    });

    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setIsPending(true);
        
        const result = driverSchema.safeParse(formData);

        if (!result.success) {
            setError(result.error.issues[0].message);
            setIsPending(false);

            setTimeout(() => setError(null), 3000);
            return;
        }

        try {
            if (initialData)
                await updateDriver(initialData.id, result.data);
            else
                await createDriver(result.data);
        } catch (err) {
            setError("Something went wrong while saving the driver.");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                ← Back to Drivers
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>
                        {initialData ? `Edit Driver: ${formData.name}` : "Add New Driver"}
                    </CardTitle>
                </CardHeader>
                
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative animate-in fade-in duration-300">
                                {error}
                            </div>
                        )}

                        {/* 1. Ime i email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="flex items-center gap-2">
                                    <User className="h-3 w-3 text-muted-foreground" /> Full Name
                                </Label>
                                <Input 
                                    id="name" 
                                    placeholder="e.g. Michael Knight" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    disabled={isPending}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center gap-2">
                                    <Mail className="h-3 w-3 text-muted-foreground" /> Email Address
                                </Label>
                                <Input 
                                    id="email" 
                                    placeholder="e.g. michael@trucking.com" 
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    disabled={isPending}
                                />
                            </div>
                        </div>
                        
                        {/* 2. ELD status */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Activity className="h-3 w-3 text-muted-foreground" /> ELD Compliance Status
                            </Label>

                            <Select 
                                value={formData.eldStatus} 
                                onValueChange={(val) => setFormData({ ...formData, eldStatus: val })} 
                                disabled={isPending}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="CONNECTED">
                                        <span className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                            Connected (Compliant)
                                        </span>
                                    </SelectItem>

                                    <SelectItem value="DISCONNECTED">
                                        <span className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-red-500" />
                                            Disconnected (Warning)
                                        </span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="submit" className="w-full mt-6 bg-sky-600 hover:bg-sky-700" disabled={isPending}>
                            {isPending ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                            ) : (
                                initialData ? "Save Changes" : "Create Driver Profile"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

"use client";

import { useTransition } from "react";
import { updateCompanySettings } from "@/lib/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building2, ShieldCheck, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { SuspendModal } from "@/components/settings/suspend-modal";
import { Company } from "@prisma/client";

export function SettingsForm({ company }: { company: Company }) {
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        startTransition(async () => {
            try {
                await updateCompanySettings(data);
                toast.success("Podaci kompanije su uspešno sačuvani!");
            } catch (error: any) {
                toast.error(error.message || "Došlo je do greške prilikom čuvanja.");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-6">
            {/* 1. Osnovni poslovni podaci */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-sky-600" />
                        Business Information
                    </CardTitle>
                    <CardDescription>Legal name and government registration numbers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Company Legal Name</Label>
                            <Input name="name" defaultValue={company.name} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Tax ID (EIN)</Label>
                            <Input name="taxId" defaultValue={company.taxId || ""} type="password" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-emerald-600" /> 
                                US DOT Number
                            </Label>
                            <Input name="dotNumber" defaultValue={company.dotNumber || ""} />
                        </div>
                        <div className="space-y-2">
                            <Label>MC Number (Motor Carrier)</Label>
                            <Input name="mcNumber" defaultValue={company.mcNumber || ""} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 2. Kontakt podaci HQ */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-sky-600" />
                        Headquarters & Contact
                    </CardTitle>
                    <CardDescription>Main terminal address and emergency dispatch contacts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Main Terminal Address</Label>
                        <Input name="address" defaultValue={company.address || ""} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>City & State</Label>
                            <Input name="cityState" defaultValue={company.cityState || ""} />
                        </div>
                        <div className="space-y-2">
                            <Label>ZIP Code</Label>
                            <Input name="zipCode" defaultValue={company.zipCode || ""} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-slate-400" />
                                24/7 Dispatch Phone
                            </Label>
                            <Input name="phone" defaultValue={company.phone || ""} />
                        </div>
                        <div className="space-y-2">
                            <Label>Billing Email</Label>
                            <Input name="email" defaultValue={company.email || ""} type="email" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 3. Danger Zone button (PANIC button) */}
            <div className="mt-8 border-2 border-red-100 bg-red-50/30 rounded-xl overflow-hidden">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-red-600 mb-2 flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5" />
                        Danger Zone
                    </h3>
                    <p className="text-sm text-slate-600 mb-6 max-w-2xl">
                        Freezing the system prevents dispatchers from assigning new loads or modifying the fleet. This action is used during DOT audits, severe security breaches, or major operational shifts.
                    </p>
                    
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-100 shadow-sm">
                        <div>
                            <h4 className="font-semibold text-slate-900">Suspend Account Operations</h4>
                            <p className="text-sm text-muted-foreground">Temporarily lock the workspace for all dispatchers.</p>
                        </div>
                        
                        { /* Suspend modal koji otvara danger zone komponentu */ }
                        <SuspendModal companyName={company.name} />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline">Cancel</Button>
                <Button type="submit" disabled={isPending} className="bg-sky-600 hover:bg-sky-700">
                    {isPending ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </form>
    );
}

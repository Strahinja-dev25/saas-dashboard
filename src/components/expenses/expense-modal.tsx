"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Receipt } from "lucide-react";

import { createExpense } from "@/lib/actions";
import { ExpenseType } from "@prisma/client";

interface ExpenseModalProps {
    trucks: { id: string; unitNumber: string }[];
    loads: { id: string; truckId: string | null }[];
}

export function ExpenseModal({ trucks, loads }: ExpenseModalProps) {
    const [open, setOpen] = useState(false);
    const[formData, setFormData] = useState({
        amount: "",
        type: ExpenseType.FUEL as ExpenseType,
        vendor: "",
        date: new Date().toISOString().split('T')[0],
        truckId: "",
        loadId: "none",
    });

    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pokazuje samo ture koje vozi kamion koji je gore izabran
    const availableLoads = loads.filter(l => l.truckId === formData.truckId);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        
        if (!formData.truckId)
        {
            setError("You must select a truck for this expense.");
            return;
        }

        setIsPending(true);
        try {
            await createExpense(formData);
            setOpen(false);
            setFormData(prev => ({ ...prev, amount: "", vendor: "", truckId: "", loadId: "none" }));
        } catch (err: any) {
            setError(err.message || "Failed to record expense.");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="font-semibold cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" /> Add Manual Expense
                </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-112.5">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-sky-600" /> 
                        Record Operating Expense
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    {error && <div className="text-red-600 bg-red-50 p-2 rounded text-sm">{error}</div>}

                    {/* RED 1: Type i Datum */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val as ExpenseType })} disabled={isPending}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ExpenseType.FUEL}>Fuel</SelectItem>
                                    <SelectItem value={ExpenseType.TOLL}>Tolls</SelectItem>
                                    <SelectItem value={ExpenseType.MAINTENANCE}>Maintenance</SelectItem>
                                    <SelectItem value={ExpenseType.OTHER}>Other / Shop</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} disabled={isPending} required />
                        </div>
                    </div>

                    {/* RED 2: Iznos i Prodavac */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Amount ($)</Label>
                            <Input type="number" step="0.01" min="0.01" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} disabled={isPending} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Vendor / Location</Label>
                            <Input type="text" placeholder="e.g. Pilot Flying J" value={formData.vendor} onChange={(e) => setFormData({ ...formData, vendor: e.target.value })} disabled={isPending} />
                        </div>
                    </div>

                    {/* RED 3: Kamion i Tura */}
                    <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <Label>Assigned To</Label>
                        
                        <Select value={formData.truckId} onValueChange={(val) => setFormData({ ...formData, truckId: val, loadId: "none" })} disabled={isPending}>
                            <SelectTrigger className="mb-2 bg-white"><SelectValue placeholder="Select Unit #" /></SelectTrigger>
                            <SelectContent>
                                {trucks.map(t => <SelectItem key={t.id} value={t.id}>{t.unitNumber}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={formData.loadId} onValueChange={(val) => setFormData({ ...formData, loadId: val })} disabled={isPending || !formData.truckId || availableLoads.length === 0}>
                            <SelectTrigger className="bg-white"><SelectValue placeholder={availableLoads.length === 0 ? "No active loads for this truck" : "Attach to Load (Optional)"} /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">- General Truck Expense -</SelectItem>
                                {availableLoads.map(l => <SelectItem key={l.id} value={l.id}>Load #{l.id.slice(-6).toUpperCase()}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button type="submit" disabled={isPending} className="w-full bg-sky-600 hover:bg-sky-700 mt-2">
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Expense Record"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

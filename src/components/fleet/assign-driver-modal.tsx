"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, UserCog, Loader2, Clock } from "lucide-react";
import { assignDriverToTruck } from "@/lib/actions";
import { toast } from "sonner";

interface AssignDriverModalProps {
    truckId: string;
    currentDriverId?: string | null;
    drivers: { id: string; name: string; eldStatus?: string; trucks: { id: string }[] }[];
    disabled?: boolean;
}

export function AssignDriverModal({ truckId, currentDriverId, drivers, disabled }: AssignDriverModalProps) {
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    
    const [driverId, setDriverId] = useState(currentDriverId || "");

    // Filter za vozace koje treba prikazati u dropdownu: Svi vozaci + vozaci koji su trenutno dodeljeni kamionu (ako ih ima)
    const availableDrivers = drivers.filter(driver => 
        driver.trucks.length === 0 || driver.id === currentDriverId
    );

    async function handleSave() {
        setIsPending(true);

        try {
            await assignDriverToTruck(truckId, driverId);
            setOpen(false);

            toast.success("Driver assigned successfully.");
        } catch (error: any) {
            toast.error(error.message || "Failed to update assignment (assign driver).");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {currentDriverId ? (
                    // Ako kamion već ima vozača: Prikazujemo njegovo ime i ikonu za promenu
                    <Button 
                        disabled={disabled}
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-500 ml-2"
                    >
                        <UserCog className="h-3.5 w-3.5" />
                    </Button>
                ) : (
                    // Ako kamion nema vozača: Prikazujemo dugme za dodeljivanje
                    <Button 
                        disabled={disabled}
                        variant="outline" 
                        size="sm" 
                        className="h-8 border-dashed border-sky-300 text-sky-700 bg-sky-50 hover:bg-sky-100"
                    >
                        <UserPlus className="h-3.5 w-3.5 mr-2" />
                        Assign Driver
                    </Button>
                )}
            </DialogTrigger>
        
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle>Operational Dispatch</DialogTitle>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                    {/* 1. Biranje vozaca */}
                    <div className="space-y-2">
                        <Label>Select Driver</Label>
                        <Select 
                            value={driverId} 
                            onValueChange={setDriverId}
                            disabled={isPending}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a driver..." />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="unassigned" className="text-red-600 font-medium">
                                    - Remove Driver (Unassign) -
                                </SelectItem>

                                {availableDrivers.map((driver) => (
                                    <SelectItem key={driver.id} value={driver.id} disabled={driver.eldStatus === "DISCONNECTED"} >
                                        {driver.name}
                                        {driver.eldStatus === "DISCONNECTED" && (
                                            <span className="text-[10px] text-red-600 font-bold bg-red-50 px-1 py-0.5 rounded uppercase">
                                                Disconnected
                                            </span>
                                        )}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <Button onClick={handleSave} disabled={isPending} className="bg-sky-600 hover:bg-sky-700 w-full mt-2">
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm Assignment
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

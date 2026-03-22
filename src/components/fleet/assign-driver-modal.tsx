"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, UserCog, Loader2, Clock } from "lucide-react";
import { assignDriverToTruck } from "@/lib/actions";

interface AssignDriverModalProps {
  truckId: string;
  currentDriverId?: string | null;
  currentHos?: string | null;
  drivers: { id: string; name: string, trucks: { id: string }[] }[];
  disabled?: boolean;
}

export function AssignDriverModal({ truckId, currentDriverId, currentHos, drivers, disabled }: AssignDriverModalProps) {
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    
    const [driverId, setDriverId] = useState(currentDriverId || "");
    const [hos, setHos] = useState(currentHos || "");

    // Filter za vozace koje treba prikazati u dropdownu: Svi vozaci + vozaci koji su trenutno dodeljeni kamionu (ako ih ima)
    const availableDrivers = drivers.filter(driver => 
        driver.trucks.length === 0 || driver.id === currentDriverId
    );

    async function handleSave() {
        setIsPending(true);

        try {
            await assignDriverToTruck(truckId, driverId, hos);
            setOpen(false);
        } catch (error) {
            alert(error instanceof Error ? error.message : "Error assigning driver.");
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
                                <SelectItem value="unassigned" className="text-red-500 font-medium">
                                    - Remove Driver (Unassign) -
                                </SelectItem>
                                {availableDrivers.map((driver) => (
                                    <SelectItem key={driver.id} value={driver.id}>
                                        {driver.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 2. Unos hos-a */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Clock className="h-3 w-3" /> Hours of Service (HOS)
                        </Label>
                        <Input 
                            placeholder="e.g. 10h 30m remaining"
                            value={hos}
                            onChange={(e) => setHos(e.target.value)}
                            disabled={isPending || driverId === "unassigned"}
                        />
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

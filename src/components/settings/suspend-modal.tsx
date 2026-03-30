"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertOctagon, Loader2 } from "lucide-react";

import { toast } from "sonner"; // Za obavestenja (poruka koja iskace)

interface SuspendModalProps {
    companyName: string;
}

export function SuspendModal({ companyName }: SuspendModalProps) {
    const [open, setOpen] = useState(false);
    const [confirmationText, setConfirmationText] = useState("");
    const [isPending, setIsPending] = useState(false);
    
    // Hardkodovana sifra za Admina, trenutno
    const [authCode, setAuthCode] = useState("");

    const isConfirmValid = confirmationText === companyName && authCode === "ADMIN123";

    async function handleSuspend() {
        setIsPending(true);

        try {
            // Ovde bi u realnom svetu išao poziv bazi:
            // await SettingsService.suspendCompany(COMPANY_ID)
            
            // Simulacija mrežnog poziva (čekanje 1.5s)
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            toast.error("SYSTEM SUSPENDED: All dispatch operations are frozen. Contact Support to unlock.", {
                duration: 10000,
            });
            setOpen(false);
            setConfirmationText("");
            setAuthCode("");
        } catch (error) {
            toast.error("Failed to suspend system.");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) { setConfirmationText(""); setAuthCode(""); }
        }}>
            <DialogTrigger asChild>
                <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                    <AlertOctagon className="h-4 w-4 mr-2" />
                    Suspend Operations
                </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-125 border-red-200">
                <DialogHeader>
                    <DialogTitle className="text-red-600 flex items-center gap-2 text-xl">
                        <AlertOctagon className="h-6 w-6" />
                        Extreme Caution Area
                    </DialogTitle>
                    <DialogDescription className="text-slate-600 pt-2 font-medium">
                        Suspending operations will <strong className="text-slate-900">freeze all dispatching and load assignments</strong>. Drivers in transit will not be affected, but no new loads can be started.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-red-50 p-4 rounded-md border border-red-100 my-2">
                    <p className="text-sm text-red-800">
                        To verify this critical action, please type <strong>{companyName}</strong> below:
                    </p>
                    <Input 
                        className="mt-2 border-red-300 focus-visible:ring-red-500"
                        value={confirmationText}
                        onChange={(e) => setConfirmationText(e.target.value)}
                        placeholder={companyName}
                    />
                </div>

                <div className="space-y-2 mb-4">
                    <Label className="text-slate-700">Super Admin Authorization Code</Label>
                    <Input 
                        type="password"
                        placeholder="Enter 8-digit code..."
                        value={authCode}
                        onChange={(e) => setAuthCode(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground italic">Mockup tip: Use "ADMIN123"</p>
                </div>
                
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button 
                        variant="destructive" 
                        onClick={handleSuspend} 
                        disabled={!isConfirmValid || isPending}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Confirm Suspension
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

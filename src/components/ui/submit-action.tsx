"use client";

import { useTransition } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { toast } from "sonner";

interface SubmitActionProps extends ButtonProps {
    action: () => Promise<void>;
    successMessage: string;
}

export function SubmitAction({ action, successMessage, children, ...props }: SubmitActionProps) {
    const [isPending, startTransition] = useTransition();

    return (
        <Button 
            type="button"
            disabled={isPending}
            onClick={(e) => {
                e.preventDefault();
                startTransition(async () => {
                    try {
                        await action();
                        toast.success(successMessage);
                    } catch (error: any) {
                        toast.error(error.message || "Greška prilikom izvršavanja akcije.");
                    }
                });
            }}
            {...props}
        >
            {children}
        </Button>
    );
}

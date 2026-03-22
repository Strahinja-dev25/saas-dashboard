import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Truck } from 'lucide-react';
import { ActiveLoadDashboardItem } from "@/types/index";

interface ActiveLoadsProps {
  loads: ActiveLoadDashboardItem[];
}

export function ActiveLoads ({ loads }: ActiveLoadsProps) {
    return (
        <div className="space-y-8">
            {loads.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">No recent loads.</p>
            )}
            
            {loads.map((load) => (
                <div key={load.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-sky-100 text-sky-600">
                            {load.truck?.driver?.name ? load.truck.driver.name.charAt(0) : <Truck className="h-4 w-4"/>}
                        </AvatarFallback>
                    </Avatar>

                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {load.truck?.driver?.name || "Pending Assignment"}
                        </p>

                        <p className="text-sm text-muted-foreground">
                            {load.truck?.unitNumber || "No Unit"}
                        </p>
                    </div>

                    <div className="ml-auto font-medium">
                        +${load.amount.toLocaleString()}
                    </div>
                </div>
            ))}
        </div>
    );
}

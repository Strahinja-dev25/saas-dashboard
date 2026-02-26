import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Truck } from 'lucide-react';

interface Load {
  id: string;
  amount: number;
  createdAt: Date;
  truck: {
    unitNumber: string;
    driverName: string;
  } | null; // null ako tura nema kamion
}

interface RecentLoadsProps {
  loads: Load[];
}

export function RecentLoads ({ loads }: RecentLoadsProps) {
    return (
        <div className="space-y-8">
            {loads.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">No recent loads.</p>
            )}
            
            {loads.map((load) => (
                <div key={load.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-sky-100 text-sky-600">
                            {load.truck ? load.truck.driverName.charAt(0) : <Truck className="h-4 w-4"/>}
                        </AvatarFallback> 
                    </Avatar>

                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {load.truck ? load.truck.driverName : "Pending Assignment"}
                        </p>

                        <p className="text-sm text-muted-foreground">
                            {load.truck ? load.truck.unitNumber : "No Unit"}
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

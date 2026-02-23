import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Sale {
  id: string;
  amount: number;
  createdAt: Date;
  customer: {
    name: string;
    email: string;
  };
}

interface RecentSalesProps {
  sales: Sale[];
}

export function RecentSales({ sales }: RecentSalesProps) {
    return (
        <div className="space-y-8">
            {sales.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">Nema novih prodaja.</p>
            )}
            
            {sales.map((sale) => (
                <div key={sale.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback>K</AvatarFallback> 
                    </Avatar>

                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {sale.customer.name}
                        </p>

                        <p className="text-sm text-muted-foreground">
                            {sale.customer.email}
                        </p>
                        
                        <p className="text-sm text-muted-foreground">
                            {new Date(sale.createdAt).toLocaleDateString()}
                        </p>
                    </div>

                    <div className="ml-auto font-medium">
                        +{sale.amount.toLocaleString()} €
                    </div>
                </div>
            ))}
        </div>
    );
}

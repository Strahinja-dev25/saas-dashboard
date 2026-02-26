import { db } from "@/lib/db";
import { LoadForm } from "@/components/loads/load-form";

export default async function NewLoadPage () {
    const trucks = await db.truck.findMany({
        orderBy: { unitNumber: 'asc' },
        select: {
            id: true,
            unitNumber: true,
            driverName: true
        }
    });

    return (
        <div className="max-w-2xl mx-auto p-4">
            <LoadForm trucks={trucks} />
        </div>
    );
}

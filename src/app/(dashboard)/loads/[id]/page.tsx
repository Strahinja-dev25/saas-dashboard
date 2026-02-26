import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { LoadForm } from "@/components/loads/load-form";

interface EditLoadPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditLoadPage({ params }: EditLoadPageProps) {
    const { id } = await params;

    const load = await db.load.findUnique({
        where: { id },
    });

    if (!load)
        notFound();

    const trucks = await db.truck.findMany({
        orderBy: { unitNumber: 'asc' },
        select: { id: true, unitNumber: true, driverName: true }
    });

    return (
        <div className="p-4">
            <LoadForm trucks={trucks} initialData={load} />
        </div>
    );
}

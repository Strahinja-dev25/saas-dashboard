import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { TruckForm } from "@/components/fleet/truck-form";

interface EditTrucksPageProps {
    params: Promise<{ id:string }>;
};

export default async function EditTrucksPage ({ params }: EditTrucksPageProps) {
    const { id } = await params;

    const truck = await db.truck.findUnique({
        where: {
            id: id,
        },
    });

    if(!truck)
        notFound();

    return (
        <TruckForm initialData={truck} />
    );
}

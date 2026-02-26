import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { DriverForm } from "@/components/drivers/driver-form";

interface EditDriversPageProps {
    params: Promise<{ id:string }>;
};

export default async function EditTrucksPage ({ params }: EditDriversPageProps) {
    const { id } = await params;

    const driver = await db.driver.findUnique({
        where: {
            id: id,
        },
    });

    if(!driver)
        notFound();

    return (
        <DriverForm initialData={driver} />
    );
}

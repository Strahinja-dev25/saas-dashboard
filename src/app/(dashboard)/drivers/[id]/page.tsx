import { notFound } from "next/navigation";
import { DriverForm } from "@/components/drivers/driver-form";
import { DriverService } from "@/services/drivers/driver-service";

interface EditDriversPageProps {
    params: Promise<{ id:string }>;
};

export default async function EditDriversPage ({ params }: EditDriversPageProps) {
    const { id } = await params;
    const driver = await DriverService.getDriverById(id);

    if(!driver)
        notFound();

    return (
        <DriverForm initialData={driver} />
    );
}

import { notFound } from "next/navigation";
import { LoadForm } from "@/components/loads/load-form";
import { LoadService } from "@/services/loads/load-service";
import { TruckService } from "@/services/fleet/truck-service";

interface EditLoadPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditLoadPage({ params }: EditLoadPageProps) {
    const { id } = await params;

    const load = await LoadService.getLoadById(id);

    if (!load)
        notFound();

    const trucks = await TruckService.getTrucksForDropdown(load?.truckId);

    return (
        <div className="p-4">
            <LoadForm trucks={trucks} initialData={load} />
        </div>
    );
}

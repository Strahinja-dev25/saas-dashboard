import { LoadForm } from "@/components/loads/load-form";
import { TruckService } from "@/services/fleet/truck-service";

export default async function NewLoadPage () {
    const trucks = await TruckService.getTrucksForDropdown();

    return (
        <div className="max-w-2xl mx-auto p-4">
            <LoadForm trucks={trucks} />
        </div>
    );
}

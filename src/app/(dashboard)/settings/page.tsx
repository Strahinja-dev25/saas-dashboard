import { CompanyService } from "@/services/company-service";
import { SettingsForm } from "@/components/settings/settings-form";
import { getAuthContext } from "@/lib/auth-service";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
    const auth = await getAuthContext();
    if (auth?.role !== "ADMIN") {
        redirect("/dashboard");
    }

    const company = await CompanyService.getCompanyProfile();

    if (!company) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Company Profile</h2>
                    <p className="text-muted-foreground">Manage your organizational details and operational preferences.</p>
                </div>
                <div className="text-center p-12 bg-white rounded-xl border text-muted-foreground">
                    Kompanija nije pronađena. Molimo vas da se ponovo prijavite.
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Company Profile</h2>
                <p className="text-muted-foreground">Manage your organizational details and operational preferences.</p>
            </div>
            
            <SettingsForm company={company} />
        </div>
    );
}

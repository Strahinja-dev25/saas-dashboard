import { db } from "@/lib/db";
import { getCompanyId } from "@/lib/auth-service";

export const CompanyService = {
    async getCompanyProfile() {
        const COMPANY_ID = await getCompanyId();
        if (!COMPANY_ID) throw new Error("Unauthorized: No company found.");

        return db.company.findUnique({
            where: { id: COMPANY_ID }
        });
    },

    async updateCompanyProfile(data: {
        name: string;
        taxId?: string | null;
        dotNumber?: string | null;
        mcNumber?: string | null;
        address?: string | null;
        cityState?: string | null;
        zipCode?: string | null;
        phone?: string | null;
        email?: string | null;
    }) {
        const COMPANY_ID = await getCompanyId();
        if (!COMPANY_ID) throw new Error("Unauthorized: No company found.");

        return db.company.update({
            where: { id: COMPANY_ID },
            data
        });
    }
};

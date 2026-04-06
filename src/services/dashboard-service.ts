import { db } from "@/lib/db";
import { LoadStatus } from "@prisma/client";
import { getCompanyId } from "@/lib/auth-service";

export const DashboardService = {
    // Podaci za statistiku (4 kartice)
    async getStats() {
        const COMPANY_ID = await getCompanyId();

        if (!COMPANY_ID)
            throw new Error("Unauthorized: No company found for this user.");

        const [revenueAgg, activeTrucks, totalTrucks, pendingLoads] = await Promise.all([
            // Zbir svih završenih tura (Prihod i Milje za RPM)
            db.load.aggregate({
                _sum: { amount: true, miles: true },
                where: { companyId: COMPANY_ID, status: LoadStatus.DELIVERED },
            }),
            db.truck.count({ where: { companyId: COMPANY_ID, status: "IN_TRANSIT" } }),
            db.truck.count({ where: { companyId: COMPANY_ID } }),
            db.load.count({ where: { companyId: COMPANY_ID, status: LoadStatus.PENDING } })
        ]);

        const totalRevenue = revenueAgg._sum.amount || 0;
        const totalMiles = revenueAgg._sum.miles || 0;
        const rpm = totalMiles > 0 ? totalRevenue / totalMiles : 0;

        return {
            totalRevenue,
            activeTrucks,
            totalTrucks,
            pendingLoads,
            rpm
        };
    },

    // Podaci za grafikon (Samo delivered ture iz ove godine)
    async getChartData() {
        const COMPANY_ID = await getCompanyId();

        if (!COMPANY_ID)
            throw new Error("Unauthorized: No company found for this user.");

        const currentYear = new Date().getFullYear();
        
        const loads = await db.load.findMany({
            where: {
                companyId: COMPANY_ID,
                status: LoadStatus.DELIVERED,
                createdAt: { gte: new Date(currentYear, 0, 1) }
            },
            select: { amount: true, createdAt: true }
        });

        const monthNames =["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Avg", "Sep", "Okt", "Nov", "Dec"];
        const graphData = monthNames.map(name => ({ name, total: 0 }));

        loads.forEach(load => {
            const month = load.createdAt.getMonth();
            graphData[month].total += load.amount;
        });

        return graphData;
    },

    // Aktivne ture (Za mali deo od 5 tura na sredini ekrana)
    async getActiveLoadsList(limit: number = 5) {
        const COMPANY_ID = await getCompanyId();

        if (!COMPANY_ID)
            throw new Error("Unauthorized: No company found for this user.");

        return db.load.findMany({
            where: {
                companyId: COMPANY_ID,
                status: { in:[LoadStatus.PENDING, LoadStatus.ASSIGNED, LoadStatus.IN_TRANSIT] }
            },
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                truck: {
                    select: { unitNumber: true, driver: { select: { name: true } } }
                }
            }
        });
    },

    // Nedavne transakcije (Za veliku tabelu od 7 redova na dnu)
    async getRecentTransactions(limit: number = 7) {
        const COMPANY_ID = await getCompanyId();

        if (!COMPANY_ID)
            throw new Error("Unauthorized: No company found for this user.");

        return db.load.findMany({
            where: { companyId: COMPANY_ID },
            take: limit,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                amount: true,
                miles: true,
                status: true,
                createdAt: true,
                truck: {
                    select: {
                        unitNumber: true,
                        driver: { select: { name: true } }
                    }
                }
            }
        });
    }
};

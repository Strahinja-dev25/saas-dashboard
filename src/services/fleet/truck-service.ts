import { db } from "@/lib/db";

// PRIVREMENO: Ovde staviti pravi ID firme iz baze
const COMPANY_ID = "firma-1";

export const TruckService = {
    // Nalazenje cele liste kamiona. Postoji i search i paginacija
    async getFleet(query: string = "", page: number = 1, limit: number = 20) {
        const offset = (page - 1) * limit;

        const whereClause = {
            companyId: COMPANY_ID,
            ...(query ? {
                OR:[
                    { unitNumber: { contains: query, mode: 'insensitive' as const } },
                    { driver: { name: { contains: query, mode: 'insensitive' as const } } },
                    { location: { contains: query, mode: 'insensitive' as const } },
                ]
            } : {})
        };

        const [totalCount, trucks] = await Promise.all([
            db.truck.count({ where: whereClause }),
            db.truck.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
                include: {
                    driver: { select: { name: true } },
                },
            })
        ]);

        return {
            trucks,
            totalPages: Math.ceil(totalCount / limit) || 1,
            totalCount
        };
    },

    // Nalazenje liste za dropdown meni. Manja lista koja vraca samo id kamiona, oznaku kamiona i ime vozaca (Modal)
    async getTrucksForDropdown() {
        return db.truck.findMany({
            where: { companyId: COMPANY_ID },
            orderBy: { unitNumber: 'asc' },
            select: {
                id: true,
                unitNumber: true,
                driver: {
                    select: { name: true }
                }
            }
        });
    },

    // Nalazenje jednog kamiona. Edit stranica
    async getTruckById(id: string) {
        return db.truck.findUnique({
            where: { id, companyId: COMPANY_ID }
        });
    },

    // Kreiranje novog kamiona. New stranica
    async createTruck(data: any) {
        return db.truck.create({
            data: {
                ...data,
                companyId: COMPANY_ID,
                driverId: data.driverId || null,
                hosRemaining: "N/A",
            }
        });
    },

    // Menjanje kamiona. Edit stranica
    async updateTruck(id: string, data: any) {
        let { driverId, hosRemaining } = data;

        if (data.status === "MAINTENANCE" || data.status === "OUT_OF_SERVICE")
        {
            driverId = null;
            hosRemaining = "N/A";
        }

        return db.truck.update({
            where: { id },
            data: {
                ...data,
                driverId: driverId || null,
                hosRemaining
            }
        });
    },

    // Brisanje kamiona
    async deleteTruck(id: string) {
        return db.truck.delete({ where: { id } });
    },

    // Menjanje u modalu
    async assignDriver(truckId: string, driverId: string | undefined, hos: string) {
        const isRemoving = !driverId || driverId === "unassigned";

        if (!isRemoving)
        {
            const truck = await db.truck.findUnique({ where: { id: truckId } });

            if (truck?.status === "MAINTENANCE" || truck?.status === "OUT_OF_SERVICE")
                throw new Error("Unit is not currently available and cannot be assigned a driver.");
        }

        return db.truck.update({
            where: { id: truckId },
            data: {
                driverId: isRemoving ? null : driverId,
                hosRemaining: isRemoving ? "N/A" : hos,
                status: isRemoving ? "AVAILABLE" : "IN_TRANSIT"
            }
        });
    }
};

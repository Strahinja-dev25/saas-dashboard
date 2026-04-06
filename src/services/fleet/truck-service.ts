import { db } from "@/lib/db";
import { getCompanyId } from "@/lib/auth-service";

export const TruckService = {
    // Nalazenje cele liste kamiona. Postoji i search i paginacija
    async getFleet(query: string = "", page: number = 1, limit: number = 20, sortBy: string = "createdAt", sortOrder: "asc" | "desc" = "desc") {
        const COMPANY_ID = await getCompanyId();

        if (!COMPANY_ID)
            throw new Error("Unauthorized: No company found for this user.");

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
                orderBy: { [sortBy]: sortOrder },
                take: limit,
                skip: offset,
                include: {
                    driver: { select: { name: true, eldStatus: true } },
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
    async getTrucksForDropdown(includeCurrentTruckId?: string | null) {
        const COMPANY_ID = await getCompanyId();

        if (!COMPANY_ID)
            throw new Error("Unauthorized: No company found for this user.");

        return db.truck.findMany({
            where: {
                companyId: COMPANY_ID,
                OR:[
                    {
                        status: "AVAILABLE",
                        loads: {
                            none: {
                                status: { in: ["ASSIGNED", "IN_TRANSIT"] }
                            }
                        }
                    },
                    includeCurrentTruckId ? { id: includeCurrentTruckId } : { id: "never_match" }
                ]
            },
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
        const COMPANY_ID = await getCompanyId();

        if (!COMPANY_ID)
            throw new Error("Unauthorized: No company found for this user.");

        return db.truck.findUnique({
            where: { id, companyId: COMPANY_ID }
        });
    },

    // Kreiranje novog kamiona. New stranica
    async createTruck(data: any) {
        const COMPANY_ID = await getCompanyId();

        if (!COMPANY_ID)
            throw new Error("Unauthorized: No company found for this user.");

        return db.truck.create({
            data: {
                ...data,
                companyId: COMPANY_ID,
                driverId: data.driverId || null,
            }
        });
    },

    // Menjanje kamiona. Edit stranica
    async updateTruck(id: string, data: any) {
        let { driverId } = data;

        if (data.status === "MAINTENANCE" || data.status === "OUT_OF_SERVICE")
        {
            driverId = null;
        }

        return db.truck.update({
            where: { id },
            data: {
                ...data,
                driverId: driverId || null,
            }
        });
    },

    // Brisanje kamiona
    async deleteTruck(id: string) {
        return db.truck.delete({ where: { id } });
    },

    // Menjanje u modalu
    async assignDriver(truckId: string, driverId: string | undefined) {
        const isRemoving = !driverId || driverId === "unassigned";

        if (!isRemoving && driverId)
        {
            const driver = await db.driver.findUnique({ where: { id: driverId } });

            if(driver?.eldStatus === "DISCONNECTED")
                throw new Error("ELD Violation: Driver is DISCONNECTED. Cannot assign to truck.");

            const truck = await db.truck.findUnique({ where: { id: truckId } });
            
            if (truck?.status === "MAINTENANCE" || truck?.status === "OUT_OF_SERVICE")
                throw new Error("Unit is not currently available and cannot be assigned a driver.");
        }

        return db.truck.update({
            where: { id: truckId },
            data: {
                driverId: isRemoving ? null : driverId,
                status: "AVAILABLE"
            }
        });
    }
};

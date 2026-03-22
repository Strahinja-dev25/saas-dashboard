import { db } from "@/lib/db";

// PRIVREMENO: Ovde staviti pravi ID firme iz baze
const COMPANY_ID = "firma-1";

export const DriverService = {
    // Nalazenje cele liste vozaca. Postoji i search i paginacija
    async getDrivers(query: string = "", page: number = 1, limit: number = 20) {
        const offset = (page - 1) * limit;

        const whereClause = {
            companyId: COMPANY_ID,
            ...(query ? {
                OR: [
                    { name: { contains: query, mode: 'insensitive' as const } },
                    { email: { contains: query, mode: 'insensitive' as const } },
                ]
            } : {})
        };

        const [totalCount, drivers] = await Promise.all([
            db.driver.count({ where: whereClause }),
            db.driver.findMany({
                where: whereClause,
                orderBy: { name: 'asc' },
                take: limit,
                skip: offset
            })
        ]);

        return {
            drivers,
            totalPages: Math.ceil(totalCount / limit) || 1,
            totalCount
        };
    },

    // Nalazenje liste svih vozaca. Ime i id vozaca
    async getAllDriversList() {
        return db.driver.findMany({
            where: { companyId: COMPANY_ID },
            orderBy: { name: 'asc' },
            select: { id: true, name: true }
        });
    },

    // Nalazenje liste vozaca koji imaju kamion dodeljen
    async getDriversForAssignment() {
        return db.driver.findMany({
            where: { companyId: COMPANY_ID },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                trucks: {
                    select: { id: true }
                }
            }
        });
    },

    // Nalazenje jednog vozaca. Edit stranica
    async getDriverById(id: string) {
        return db.driver.findUnique({
            where: { id, companyId: COMPANY_ID }
        });
    },

    // Kreiranje novog vozaca. New stranica
    async createDriver(data: any) {
        return db.driver.create({
            data: {
                ...data,
                companyId: COMPANY_ID
            }
        });
    },

    // Menjanje vozaca. Edit stranica
    async updateDriver(id: string, data: any) {
        return db.driver.update({
            where: { id },
            data
        });
    },

    // Brisanje vozaca
    async deleteDriver(id: string) {
        // PROVERA (Edge Case): Proveri da li ovaj vozač vozi neki kamion
        const truckCount = await db.truck.count({ where: { driverId: id } });
        
        if (truckCount > 0) {
            throw new Error("Cannot delete driver while they are assigned to a truck.");
        }

        return db.driver.delete({ where: { id } });
    }
};

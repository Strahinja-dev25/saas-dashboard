import { db } from "@/lib/db";
import { LoadStatus, TruckStatus } from "@prisma/client";

// PRIVREMENO: Ovde staviti pravi ID firme iz baze
const COMPANY_ID = "firma-1";

export const LoadService = {
    // Nalazenje cele liste aktivnih (trenutnih) tura. Postoji i search i paginacija (Active loads tabela)
    async getActiveLoads(query: string = "", page: number = 1, limit: number = 20) {
        const offset = (page - 1) * limit;
        const activeStatuses = [LoadStatus.PENDING, LoadStatus.ASSIGNED, LoadStatus.IN_TRANSIT];

        const [totalCount, loads] = await Promise.all([
            db.load.count({ where: { companyId: COMPANY_ID, status: { in: activeStatuses } } }),
            db.load.findMany({
                where: { companyId: COMPANY_ID, status: { in: activeStatuses } },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
                include: {
                    truck: {
                        select: { unitNumber: true, driver: { select: { name: true } } }
                    }
                }
            })
        ]);

        return { loads, totalPages: Math.ceil(totalCount / limit) || 1 };
    },

    // Kreiranje nove ture. New stranica
    async createLoad(data: any) {
        return db.load.create({
            data: {
                ...data,
                amount: data.amount,
                miles: data.miles,
                status: LoadStatus.PENDING,
                companyId: COMPANY_ID,
                truckId: data.truckId === "unassigned" ? null : data.truckId,
            }
        });
    },

    // Menjanje ture i promena statusa
    async updateLoadStatus(loadId: string, newStatus: LoadStatus) {
        // Trenutno stanje ture
        const load = await db.load.findUnique({ 
            where: { id: loadId },
            select: { truckId: true }
        });

        if (!load) throw new Error("Load not found");

        return await db.$transaction(async (tx) => {
            // Prvo azurira status ture
            const updatedLoad = await tx.load.update({
                where: { id: loadId },
                data: { status: newStatus }
            });

            // Onda ako tura ima kamion, menja i kamion na osnovu statusa ture
            if (load?.truckId) {
                if (newStatus === LoadStatus.DELIVERED || newStatus == LoadStatus.CANCELLED) {
                    await tx.truck.update({
                        where: { id: load.truckId },
                        data: { 
                            status: TruckStatus.AVAILABLE,
                            destination: null
                        }
                    });
                }
                else if (newStatus === LoadStatus.IN_TRANSIT) {
                    await tx.truck.update({
                        where: { id: load.truckId },
                        data: { status: TruckStatus.IN_TRANSIT }
                    });
                }
            }

            return updatedLoad;
        });
    },

    async updateLoadData(id: string, rawData: any) {
        return db.load.update({
            where: { id },
            data: {
                amount: rawData.amount,
                miles: rawData.miles,
                truckId: rawData.truckId === "unassigned" ? null : rawData.truckId,
            }
        });
    },

    // Brisanje ture
    async deleteLoad(id: string) {
        const load = await db.load.findUnique({ where: { id } });
        
        if (load?.truckId && load.status === LoadStatus.IN_TRANSIT) {
            await db.truck.update({
                where: { id: load.truckId },
                data: { status: TruckStatus.AVAILABLE, destination: null }
            });
        }

        return db.load.delete({ where: { id } });
    }
};

import { db } from "@/lib/db";
import { LoadStatus, TruckStatus } from "@prisma/client";
import { getCompanyId } from "@/lib/auth-service";

export const LoadService = {
    // Nalazenje cele liste aktivnih (trenutnih) tura. Postoji i search i paginacija (Active loads tabela)
    async getActiveLoads(query: string = "", page: number = 1, limit: number = 20, sortBy: string = "createdAt", sortOrder: "asc" | "desc" = "asc") {
        const COMPANY_ID = await getCompanyId();

        if (!COMPANY_ID)
            throw new Error("Unauthorized: No company found for this user.");
        
        const offset = (page - 1) * limit;
        const activeStatuses = [LoadStatus.PENDING, LoadStatus.ASSIGNED, LoadStatus.IN_TRANSIT];

        const whereClause = {
            companyId: COMPANY_ID,
            status: { in: activeStatuses },
            ...(query ? {
                OR: [
                    { id: { contains: query, mode: 'insensitive' as const } },
                    { truck: { unitNumber: { contains: query, mode: 'insensitive' as const } } },
                    { truck: { driver: { name: { contains: query, mode: 'insensitive' as const } } } },
                ]
            } : {})
        };

        const [totalCount, loads] = await Promise.all([
            db.load.count({ where: { companyId: COMPANY_ID, status: { in: activeStatuses } } }),
            db.load.findMany({
                where: whereClause,
                orderBy: { [sortBy]: sortOrder },
                take: limit,
                skip: offset,
                include: {
                    truck: {
                        select: {
                            unitNumber: true,
                            driver: {
                                select: { name: true, eldStatus: true, hosAvailable: true, isDriving: true }
                            }
                        }
                    }
                }
            })
        ]);

        return { loads, totalPages: Math.ceil(totalCount / limit) || 1 };
    },

    async getLoadById(id: string) {
        const COMPANY_ID = await getCompanyId();

        if (!COMPANY_ID)
            throw new Error("Unauthorized: No company found for this user.");

        return db.load.findUnique({
            where: { id, companyId: COMPANY_ID }
        });
    },

    // Kreiranje nove ture. New stranica
    async createLoad(data: any) {
        const COMPANY_ID = await getCompanyId();

        if (!COMPANY_ID)
            throw new Error("Unauthorized: No company found for this user.");

        const assignedTruckId = data.truckId === "unassigned" ? null : data.truckId;
        const initialStatus = assignedTruckId ? LoadStatus.ASSIGNED : LoadStatus.PENDING;

        return db.load.create({
            data: {
                ...data,
                origin: data.origin,
                destination: data.destination,
                amount: data.amount,
                miles: data.miles,
                status: initialStatus,
                companyId: COMPANY_ID,
                truckId: data.truckId === "unassigned" ? null : data.truckId,
            }
        });
    },

    // Menjanje ture i promena statusa
    async updateLoadStatus(loadId: string, newStatus: LoadStatus) {
        // 1. Trenutno stanje ture
        const load = await db.load.findUnique({ 
            where: { id: loadId },
            include: { truck: { include: { driver: true } } }
        });

        if (!load)
            throw new Error("Load not found");

        const truckId = load.truckId;
        const driverId = load.truck?.driverId;

        // 2. Bezbednosne provere (kada se aktivira start trip)
        if(newStatus === LoadStatus.IN_TRANSIT)
        {
            const driverHos = load.truck?.driver?.hosAvailable || 0;
            const loadRequiredHours = load.estimatedHours || 0;

            if (driverHos < loadRequiredHours)
                throw new Error(`HOS Risk: Driver only has ${driverHos.toFixed(1)}h left, but this load requires ~${loadRequiredHours}h. Dangerous risk!`);

            if (!truckId || !driverId)
                throw new Error("Cannot start trip: Truck or Driver is missing!");
            
            if (load.truck?.driver?.eldStatus === "DISCONNECTED")
                throw new Error("ELD Violation: Driver is DISCONNECTED. Cannot start trip.");

            if (load.truck?.driver?.hosAvailable !== undefined && load.truck.driver.hosAvailable <= 0)
                throw new Error("HOS Violation: Driver has 0 hours left. Mandatory rest required.");
        }

        // Glavni mozak za start, cancel i deliver load
        return await db.$transaction(async (tx) => {
            const now = new Date();
            let loadUpdateData: any = { status: newStatus };

            // Scenario A: Dispečer je kliknuo "START TRIP"
            if (newStatus === LoadStatus.IN_TRANSIT && load.status !== LoadStatus.IN_TRANSIT) {
                loadUpdateData.startedAt = now;
                
                if (truckId)
                    await tx.truck.update({ where: { id: truckId }, data: { status: "IN_TRANSIT" } });
                if (driverId)
                    await tx.driver.update({ where: { id: driverId }, data: { isDriving: true } });
            }

            // Scenario B: Dispečer je kliknuo "DELIVERED"
            if (newStatus === LoadStatus.DELIVERED && load.status === LoadStatus.IN_TRANSIT) {
                loadUpdateData.deliveredAt = now;
                
                if (truckId)
                    await tx.truck.update({ where: { id: truckId }, data: { status: "AVAILABLE", destination: null } });
                
                // HOS racun
                if (driverId && load.startedAt)
                {
                    const diffMs = now.getTime() - load.startedAt.getTime();
                    const diffHours = diffMs / (1000 * 60 * 60);    // milisekunde pretvorene u sate
                    
                    const currentHos = load.truck?.driver?.hosAvailable || 11.0;
                    const newHos = Math.max(0, currentHos - diffHours); // ne sme da ode u minus

                    await tx.driver.update({ 
                        where: { id: driverId }, 
                        data: { isDriving: false, hosAvailable: newHos } 
                    });
                }
            }

            // Scenario C: Dispecer je kliknuo "CANCEL"
            if (newStatus === LoadStatus.CANCELLED)
            {
                // Iako je otkazano USRED PUTA, vozaču se svejedno oduzima vreme koje je vozio
                if (load.status === LoadStatus.IN_TRANSIT && driverId && load.startedAt)
                {
                    const diffMs = now.getTime() - load.startedAt.getTime();
                    const diffHours = diffMs / (1000 * 60 * 60);
                    
                    const currentHos = load.truck?.driver?.hosAvailable || 11.0;
                    const newHos = Math.max(0, currentHos - diffHours);
                    
                    await tx.driver.update({ 
                        where: { id: driverId }, 
                        data: { isDriving: false, hosAvailable: newHos } 
                    });
                }
                else if (driverId)
                    await tx.driver.update({ where: { id: driverId }, data: { isDriving: false } });

                // Oslobađanje kamiona
                if (truckId)
                    await tx.truck.update({ where: { id: truckId }, data: { status: "AVAILABLE", destination: null } });
            }

            // 4. Izvršavanje update na turi
            const updatedLoad = await tx.load.update({
                where: { id: loadId },
                data: loadUpdateData
            });

            return updatedLoad;
        });
    },

    async updateLoadData(id: string, rawData: any) {
        const load = await db.load.findUnique({ where: { id } });
        
        if (!load)
            throw new Error("Load not found");

        const assignedTruckId = rawData.truckId === "unassigned" ? null : rawData.truckId;
        
        if((load.status === LoadStatus.IN_TRANSIT || load.status === LoadStatus.DELIVERED) && load.truckId !== assignedTruckId)
            throw new Error("Action denied: Cannot change truck while load is actively in transit or delivered.");

        let newStatus = load.status;
        if (load.status === LoadStatus.PENDING || load.status === LoadStatus.ASSIGNED)
            newStatus = assignedTruckId ? LoadStatus.ASSIGNED : LoadStatus.PENDING;

        return db.load.update({
            where: { id },
            data: {
                origin: rawData.origin,
                destination: rawData.destination,
                amount: rawData.amount,
                miles: rawData.miles,
                status: newStatus,
                truckId: assignedTruckId,
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
    },

    // Nalazenje tura koje su DELIVERED i CANCELLED
    async getLoadHistory(query: string = "", page: number = 1, limit: number = 20) {
        const COMPANY_ID = await getCompanyId();

        if (!COMPANY_ID)
            throw new Error("Unauthorized: No company found for this user.");

        const offset = (page - 1) * limit;
        const historyStatuses = [LoadStatus.DELIVERED, LoadStatus.CANCELLED];

        const searchFilter = query ? {
            OR: [
                { id: { contains: query, mode: 'insensitive' as const } },
                { truck: { unitNumber: { contains: query, mode: 'insensitive' as const } } },
            ]
        } : {};

        const [totalCount, loads] = await Promise.all([
            db.load.count({ where: { companyId: COMPANY_ID, status: { in: historyStatuses }, ...searchFilter } }),
            db.load.findMany({
                where: { companyId: COMPANY_ID, status: { in: historyStatuses }, ...searchFilter },
                orderBy: { updatedAt: 'desc' }, // U arhivi sortiramo po vremenu zavrsetka
                take: limit,
                skip: offset,
                include: {
                    truck: { select: { unitNumber: true, driver: { select: { name: true } } } }
                }
            })
        ]);

        return { loads, totalPages: Math.ceil(totalCount / limit) || 1 };
    },
};

import { db } from "./db";

export async function getDashboardStats () {
    // Total Revenue (DELIVERED Loads)
    const totalRevenueAgg = await db.load.aggregate({
        _sum: { amount: true },
        where: { status: "DELIVERED" },
    });
    const totalRevenue = totalRevenueAgg._sum.amount || 0;

    // Trucks that are IN_TRANSIT (ACTIVE)
    const activeTrucks = await db.truck.count({
        where: { status: "IN_TRANSIT" },
    });

    // Total Trucks
    const totalTrucks = await db.truck.count();

    // PENDING Loads
    const pendingLoads = await db.load.count({
        where: { status: "PENDING" },
    });

    // Average RPM
    const deliveredLoads = await db.load.findMany({
        where: { status: "DELIVERED" },
        select: { amount: true, miles: true },
    });

    let totalMiles = 0;
    deliveredLoads.forEach(load => {
        totalMiles += load.miles;
    });

    const rpm = totalMiles > 0 ? totalRevenue / totalMiles : 0;

    return {
        totalRevenue,
        activeTrucks,
        totalTrucks,
        pendingLoads,
        rpm
    };
}

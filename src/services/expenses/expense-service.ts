import { db } from "@/lib/db";
import { getCompanyId } from "@/lib/auth-service";

export const ExpenseService = {
    // 1. Nalazenje svih troskova (Za veliku tabelu sa pretragom i paginacijom)
    async getExpenses(query: string = "", page: number = 1, limit: number = 20, sortBy: string = "date", sortOrder: "asc" | "desc" = "desc") {
        const COMPANY_ID = await getCompanyId();

        if (!COMPANY_ID)
            throw new Error("Unauthorized: No company found for this user.");
        
        const offset = (page - 1) * limit;

        const whereClause = {
            companyId: COMPANY_ID,
            ...(query ? {
                OR:[
                    { vendor: { contains: query, mode: 'insensitive' as const } },
                    { truck: { unitNumber: { contains: query, mode: 'insensitive' as const } } },
                ]
            } : {})
        };

        const [totalCount, expenses] = await Promise.all([
            db.expense.count({ where: whereClause }),
            db.expense.findMany({
                where: whereClause,
                orderBy: {[sortBy]: sortOrder },
                take: limit,
                skip: offset,
                include: {
                    truck: { select: { unitNumber: true } }, // Treba nam broj kamiona
                }
            })
        ]);

        return { expenses, totalPages: Math.ceil(totalCount / limit) || 1 };
    },

    // 2. Kartice na vrhu stranice (Mesecni presek)
    async getExpenseStats() {
        const COMPANY_ID = await getCompanyId();

        if (!COMPANY_ID)
            throw new Error("Unauthorized: No company found for this user.");
        
        const now = new Date();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Specijalna Prisma funkcija "groupBy" koja sabira troškove i odvaja ih po 'Type' (Gorivo, Putarina...)
        const thisMonthExpenses = await db.expense.groupBy({
            by: ['type'],
            where: {
                companyId: COMPANY_ID,
                date: { gte: startOfThisMonth } // Samo ovaj mesec!
            },
            _sum: { amount: true }
        });

        let fuelCosts = 0;
        let maintAndTolls = 0;
        let total = 0;

        // Rastavljamo šta je šta iz grupisanih rezultata baze
        thisMonthExpenses.forEach(exp => {
            const amount = exp._sum.amount || 0;
            total += amount;
            
            if (exp.type === "FUEL") fuelCosts += amount;
            if (exp.type === "MAINTENANCE" || exp.type === "TOLL") maintAndTolls += amount;
        });

        return { total, fuelCosts, maintAndTolls };
    },

    // 3. Kreiranje expense
    async createExpense(data: any) {
        const COMPANY_ID = await getCompanyId();

        if (!COMPANY_ID)
            throw new Error("Unauthorized: No company found for this user.");

        return db.expense.create({
            data: {
                amount: data.amount,
                type: data.type,
                vendor: data.vendor || null,
                date: data.date,
                companyId: COMPANY_ID,
                truckId: data.truckId,
                // Logika "none" -> null
                loadId: data.loadId === "none" ? null : data.loadId,
            }
        });
    },

    // 4. Brisanje expense
    async deleteExpense(id: string) {
        return db.expense.delete({ where: { id } });
    }
};

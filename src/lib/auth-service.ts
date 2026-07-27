import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// Ova funkcija vraća ID firme trenutno ulogovanog korisnika
export async function getCompanyId() {
    const user = await currentUser();
    
    if (!user)
        return null; 

    const clerkId = user.id;

    const dbUser = await db.user.findUnique({
        where: { id: clerkId },
        select: { companyId: true }
    });

    return dbUser?.companyId || null;
}

// Ova funkcija vraća sve podatke o ulogovanom korisniku iz baze (CompanyId, Role, ID)
export async function getAuthContext() {
    const user = await currentUser();
    
    if (!user) return null;

    const dbUser = await db.user.findUnique({
        where: { id: user.id },
        select: { id: true, companyId: true, role: true }
    });

    return dbUser;
}

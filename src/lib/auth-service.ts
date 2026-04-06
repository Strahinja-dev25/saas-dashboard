import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// Ova funkcija vraća ID firme trenutno ulogovanog korisnika
export async function getCompanyId() {
    const user = await currentUser();
    
    if (!user)
        return null; 

    const email = user.emailAddresses[0].emailAddress;

    const dbUser = await db.user.findUnique({
        where: { email },
        select: { companyId: true }
    });

    return dbUser?.companyId || null;
}

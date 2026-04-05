import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server';

// 1. Definišemo JAVNE rute (Ono što svako na svetu sme da vidi, na primer login ekran)
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, request) => {
  // 1. Provera da li je korisnik ulogovan
  const { userId } = await auth();

  // 2. Ako je na sign-in/up a ULOGOVAN JE -> baci ga na Home (Fix za beli ekran)
  if (userId && isPublicRoute(request))
    return NextResponse.redirect(new URL('/', request.url));

  // 3. Ako NIJE ulogovan i NIJE javna ruta -> baci ga na Sign In
  if (!userId && !isPublicRoute(request))
    return (await auth()).redirectToSignIn();
});

// 3. Konfiguracija koja govori Next.js-u na kojim fajlovima da pali ovo proveravanje
// (Preskače slike, ikonice i interne css/js fajlove da bi sajt bio brz)
export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server';

const isSignInRoute = createRouteMatcher(['/sign-in(.*)']);
const isLandingRoute = createRouteMatcher(['/']);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();

  // Ulogovan korisnik ide na dashboard
  if (userId && (isSignInRoute(request) || isLandingRoute(request)))
    return NextResponse.redirect(new URL('/dashboard', request.url));

  // Neulogovan sme samo landing (/) i sign-in; sve ostalo zahteva login
  if (!userId && !isSignInRoute(request) && !isLandingRoute(request))
    return (await auth()).redirectToSignIn();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};

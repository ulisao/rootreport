import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Definimos la ruta pública
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)' // Asegurate que esto coincida con tu URL
]);

export default clerkMiddleware(async (auth, req) => {
  // DEBUG: Vamos a ver qué URL está llegando
  console.log("🔒 Middleware revisando URL:", req.nextUrl.pathname);

  if (isPublicRoute(req)) {
    console.log("✅ Ruta detectada como PÚBLICA. Dejando pasar...");
    return; // No hacemos nada, dejamos pasar
  }

  console.log("🛑 Ruta PROTEGIDA. Ejecutando auth.protect()...");
  await auth.protect();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
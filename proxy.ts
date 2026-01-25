import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 1. Rutas PÚBLICAS (Login, Registro, Webhooks)
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)'
]);

// 2. Rutas PROTEGIDAS (Aquí incluimos el fix del (.*) que te pasé)
// Esto asegura que Next.js entienda que /dashboard/team/cualquier-cosa es parte del grupo protegido
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)', 
]);

export default clerkMiddleware(async (auth, req) => {
  // DEBUG: Para ver qué pasa en consola
  console.log("🔒 Middleware revisando URL:", req.nextUrl.pathname);

  // A. Si es pública, pase usted
  if (isPublicRoute(req)) {
    console.log("✅ Ruta detectada como PÚBLICA. Dejando pasar...");
    return; 
  }

  // B. Si coincide explícitamente con Dashboard (incluyendo sub-rutas gracias al .*)
  if (isProtectedRoute(req)) {
    console.log("🛑 Ruta DASHBOARD detectada. Ejecutando auth.protect()...");
    await auth.protect();
    return;
  }

  // C. Fallback de seguridad: Si no es pública y no matcheó dashboard, protegemos igual
  console.log("🛡️ Ruta desconocida (no pública). Protegiendo por defecto...");
  await auth.protect();
});

export const config = {
  matcher: [
    // El matcher robusto que ya tenías está perfecto, lo dejamos igual
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
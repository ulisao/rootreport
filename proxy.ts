import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 1. Definimos rutas que NO requieren autenticación
const isPublicRoute = createRouteMatcher([
  '/',                  // Landing page
  '/sign-in(.*)',       // Login
  '/sign-up(.*)',       // Registro
  '/api/webhooks(.*)',  // Webhooks de MP o Clerk
  '/pricing',           // Precios
]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Ignorar archivos estáticos y de sistema para no ensuciar logs ni romper auth
  if (
    pathname.startsWith('/_next') || 
    pathname.includes('/api/auth') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.svg')
  ) {
    return;
  }

  // Si la ruta no es pública, protegerla
  if (!isPublicRoute(req)) {
    console.log("🛑 Protegiendo ruta:", pathname);
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Este matcher es la recomendación oficial de Clerk para Next.js
    // Protege todo excepto archivos estáticos con extensiones conocidas
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
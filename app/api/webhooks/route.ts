import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { ConvexHttpClient } from "convex/browser"; // Cliente HTTP para el backend
import { api } from "@/convex/_generated/api";

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!); // Conexión a Convex

export async function POST(req: Request) {
  const url = new URL(req.url);
  const topic = url.searchParams.get("topic") || url.searchParams.get("type");
  const id = url.searchParams.get("id") || url.searchParams.get("data.id");

  try {
    if (topic === "payment" && id) {
      const payment = new Payment(client);
      const paymentData = await payment.get({ id: id });

      if (paymentData.status === "approved") {
        // 1. Recuperamos el orgId que guardamos en el checkout
        const orgId = paymentData.external_reference; 

        if (orgId) {
          // 2. LLAMAMOS A CONVEX PARA ACTIVAR EL PLAN
          await convex.mutation(api.subscriptions.upgradeToPro, {
            orgId: orgId,
            mercadoPagoId: id,
            plan: "pro", // O "enterprise" según corresponda
          });
          
          console.log(`✅ Organización ${orgId} actualizada a PRO vía Mercado Pago`);
        }
      }
    }
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse(null, { status: 200 });
  }
}
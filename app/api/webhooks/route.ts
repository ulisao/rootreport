import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment, PreApproval } from "mercadopago"; // <--- Agregamos PreApproval
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const url = new URL(req.url);
  
  // Mercado Pago a veces manda los datos por Query Params (IPN) o Body (Webhook).
  // Intentamos leer params primero, que es lo común en notificaciones simples.
  const topic = url.searchParams.get("topic") || url.searchParams.get("type");
  const id = url.searchParams.get("id") || url.searchParams.get("data.id");

  try {
    // CASO 1: PAGOS ÚNICOS (Legacy o Fallback)
    if (topic === "payment" && id) {
      const payment = new Payment(client);
      const paymentData = await payment.get({ id: id });

      if (paymentData.status === "approved") {
        const orgId = paymentData.external_reference;
        if (orgId) {
          await convex.mutation(api.subscriptions.upgradeToPro, {
            orgId: orgId,
            mercadoPagoId: id.toString(),
            plan: "pro",
          });
          console.log(`✅ Pago único aprobado para Org: ${orgId}`);
        }
      }
    }

    // CASO 2: SUSCRIPCIONES (Lo nuevo)
    // El topic es 'subscription_preapproval'
    if (topic === "subscription_preapproval" && id) {
        const preapproval = new PreApproval(client);
        const subData = await preapproval.get({ id: id });

        // 'authorized' significa que la suscripción se creó y el pago pasó
        if (subData.status === "authorized") {
            const orgId = subData.external_reference;
            
            if (orgId) {
                await convex.mutation(api.subscriptions.upgradeToPro, {
                    orgId: orgId,
                    mercadoPagoId: id.toString(),
                    plan: "pro",
                });
                console.log(`✅ Suscripción iniciada para Org: ${orgId}`);
            }
        }
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Error en Webhook MP:", error);
    // Siempre responder 200 a MP para que no reintente infinitamente
    return new NextResponse(null, { status: 200 });
  }
}
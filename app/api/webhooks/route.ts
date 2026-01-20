import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { clerkClient } from "@clerk/nextjs/server";

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function POST(req: Request) {
  // Mercado Pago a veces manda los datos en el query string o en el body
  const url = new URL(req.url);
  const topic = url.searchParams.get("topic") || url.searchParams.get("type");
  const id = url.searchParams.get("id") || url.searchParams.get("data.id");

  try {
    if (topic === "payment" && id) {
      const payment = new Payment(client);
      const paymentData = await payment.get({ id: id });

      // Verificamos que esté aprobado
      if (paymentData.status === "approved") {
        const userId = paymentData.external_reference;

        if (userId) {
          const clerk = await clerkClient();
          
          // ACTUALIZAMOS AL USUARIO A PRO
          await clerk.users.updateUserMetadata(userId, {
            publicMetadata: {
              plan: "enterprise"
            }
          });
          
          console.log(`✅ Usuario ${userId} actualizado a Enterprise vía Mercado Pago`);
        }
      }
    }
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error(error);
    // Siempre devolver 200 a MP para que no reintente infinitamente
    return new NextResponse(null, { status: 200 });
  }
}
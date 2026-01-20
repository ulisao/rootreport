import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { currentUser } from "@clerk/nextjs/server";

// Configura tu Access Token (lo conseguimos en el paso 4)
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function POST() {
  const user = await currentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: "agency-pro",
            title: "RootReport Agency Pro",
            quantity: 1,
            unit_price: 49000, // $49.000 ARS (o lo que quieras cobrar)
            currency_id: "ARS",
          },
        ],
        // AQUÍ ESTÁ LA MAGIA: Guardamos el ID de Clerk para saber quién pagó
        external_reference: user.id, 
        
        // A dónde vuelve el usuario después de pagar
        back_urls: {
          success: "https://rootreport.vercel.app/dashboard",
          failure: "https://rootreport.vercel.app/dashboard",
          pending: "https://rootreport.vercel.app/dashboard",
        },
        auto_return: "approved",
      },
    });

    return NextResponse.json({ url: result.init_point });
  } catch (error) {
    console.error(error);
    return new NextResponse("Error creating preference", { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { currentUser } from "@clerk/nextjs/server";

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const { orgId } = body;

    if (!orgId) {
        return new NextResponse("OrgId is required", { status: 400 });
    }

    // --- CORRECCIÓN ---
    // 1. Debug: Mirá esto en tu terminal cuando le des click
    console.log("🔍 URL detectada:", process.env.NEXT_PUBLIC_APP_URL);

    // 2. Fallback: Si la env es undefined, usa localhost a la fuerza
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: "agency-pro",
            title: "RootReport Agency Pro",
            quantity: 1,
            unit_price: 49000,
            currency_id: "ARS",
          },
        ],
        external_reference: orgId, 
        
        // 3. Usamos la variable segura 'baseUrl'
        back_urls: {
          success: `${baseUrl}/dashboard`, 
          failure: `${baseUrl}/dashboard`,
          pending: `${baseUrl}/dashboard`,
        },
        auto_return: "approved",
      },
    });

    return NextResponse.json({ url: result.init_point });
  } catch (error) {
    console.error("❌ Error MP:", error); 
    return new NextResponse("Error creating preference", { status: 500 });
  }
}
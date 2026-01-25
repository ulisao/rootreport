// app/api/checkout/route.ts
import { MercadoPagoConfig, PreApproval } from 'mercadopago'; // <--- CAMBIO IMPORTANTE
import { NextResponse } from 'next/server';

const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN! 
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { orgId } = body;
        if (!orgId) return NextResponse.json({ error: "OrgId required" }, { status: 400 });

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
        if (!baseUrl) return NextResponse.json({ error: "Base URL required" }, { status: 500 });
        
        // CAMBIO: Usamos PreApproval para suscripciones
        const preapproval = new PreApproval(client);

        const result = await preapproval.create({
          body: {
            reason: "Suscripción RootReport Agency Pro (Mensual)",
            external_reference: orgId,
            payer_email: "test@test.com", // Idealmente, el email del usuario de Clerk
            auto_recurring: {
              frequency: 1,
              frequency_type: "months",
              transaction_amount: 29, // Precio en ARS
              currency_id: "ARS"
            },
            back_url: `${baseUrl}/dashboard/settings?payment=success`,
            status: "pending",
          },
        });

        // La URL para redirigir es diferente en suscripciones
        return NextResponse.json({ url: result.init_point });

    } catch (error) {
        console.error("Error creando suscripción:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
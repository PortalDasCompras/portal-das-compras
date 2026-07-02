import { ENV } from "./_core/env";

interface MercadoPagoPreferenceItem {
  title: string;
  quantity: number;
  unit_price: number;
}

interface CreatePreferenceParams {
  orderId: number;
  customerName: string;
  customerEmail: string;
  items: MercadoPagoPreferenceItem[];
  total: number;
}

export async function createMercadoPagoPreference(params: CreatePreferenceParams) {
  const accessToken = ENV.mercadopagoAccessToken;

  if (!accessToken) {
    throw new Error("Mercado Pago Access Token não configurado");
  }

  const baseUrl = process.env.NODE_ENV === "production" 
    ? "https://comprasportal-mrzgqbgx.manus.space"
    : "http://localhost:3000";

  const preferenceData = {
    items: params.items.map(item => ({
      title: item.title,
      quantity: item.quantity,
      unit_price: item.unit_price,
      currency_id: "BRL",
    })),
    payer: {
      name: params.customerName,
      email: params.customerEmail,
    },
    back_urls: {
      success: `${baseUrl}/pedido-confirmado?order=${params.orderId}`,
      failure: `${baseUrl}/checkout?error=payment_failed`,
      pending: `${baseUrl}/checkout?status=pending`,
    },
    external_reference: `order_${params.orderId}`,
    auto_return: "approved",
  };

  try {
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preferenceData),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Mercado Pago API error:", error);
      throw new Error(`Erro ao criar preferência: ${error.message || "Erro desconhecido"}`);
    }

    const preference = await response.json();
    return {
      id: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
    };
  } catch (error) {
    console.error("Erro criando preferência Mercado Pago:", error);
    throw error;
  }
}

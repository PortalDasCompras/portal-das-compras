import Stripe from "stripe";
import { ENV } from "./_core/env";

const stripe = new Stripe(ENV.stripeSecretKey || "", {
  apiVersion: "2023-10-16",
});

interface CreatePaymentIntentData {
  orderId: number;
  amount: number;
  customerName: string;
  customerEmail: string;
  description: string;
}

interface PaymentIntentResponse {
  success: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  error?: string;
}

/**
 * Cria um Payment Intent no Stripe
 */
export async function createPaymentIntent(
  data: CreatePaymentIntentData
): Promise<PaymentIntentResponse> {
  if (!ENV.stripeSecretKey) {
    return {
      success: false,
      error: "Stripe Secret Key não configurada",
    };
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(data.amount * 100), // Converter para centavos
      currency: "brl",
      payment_method_types: ["card", "boleto", "pix"],
      description: data.description,
      metadata: {
        orderId: data.orderId.toString(),
        customerName: data.customerName,
      },
      receipt_email: data.customerEmail,
      statement_descriptor: "PORTAL COMPRAS",
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret || "",
      paymentIntentId: paymentIntent.id,
    };
  } catch (error: any) {
    console.error("Erro ao criar Payment Intent:", error);
    return {
      success: false,
      error: error.message || "Erro ao criar pagamento",
    };
  }
}

/**
 * Obtém status de um Payment Intent
 */
export async function getPaymentIntentStatus(paymentIntentId: string): Promise<{
  status: string;
  amount: number;
  currency: string;
  error?: string;
}> {
  if (!ENV.stripeSecretKey) {
    return {
      status: "error",
      amount: 0,
      currency: "brl",
      error: "Stripe Secret Key não configurada",
    };
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100, // Converter de centavos
      currency: paymentIntent.currency,
    };
  } catch (error: any) {
    console.error("Erro ao obter status do Payment Intent:", error);
    return {
      status: "error",
      amount: 0,
      currency: "brl",
      error: error.message || "Erro ao obter status",
    };
  }
}

/**
 * Confirma um Payment Intent
 */
export async function confirmPaymentIntent(
  paymentIntentId: string,
  paymentMethodId: string
): Promise<{
  success: boolean;
  status?: string;
  error?: string;
}> {
  if (!ENV.stripeSecretKey) {
    return {
      success: false,
      error: "Stripe Secret Key não configurada",
    };
  }

  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
      return_url: `${ENV.appUrl}/pagamento-confirmado`,
    });

    return {
      success: paymentIntent.status === "succeeded" || paymentIntent.status === "processing",
      status: paymentIntent.status,
    };
  } catch (error: any) {
    console.error("Erro ao confirmar Payment Intent:", error);
    return {
      success: false,
      error: error.message || "Erro ao confirmar pagamento",
    };
  }
}

/**
 * Cria um cliente no Stripe
 */
export async function createStripeCustomer(data: {
  email: string;
  name: string;
  phone?: string;
}): Promise<string> {
  if (!ENV.stripeSecretKey) {
    throw new Error("Stripe Secret Key não configurada");
  }

  try {
    const customer = await stripe.customers.create({
      email: data.email,
      name: data.name,
      phone: data.phone,
    });

    return customer.id;
  } catch (error: any) {
    console.error("Erro ao criar cliente Stripe:", error);
    throw error;
  }
}

/**
 * Obtém lista de métodos de pagamento disponíveis
 */
export function getAvailablePaymentMethods(): string[] {
  return ["card", "boleto", "pix"];
}

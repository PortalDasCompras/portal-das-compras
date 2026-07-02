import crypto from "crypto";
import { ENV } from "./_core/env";
import { updateOrderStatus } from "./db";

interface WebhookEvent {
  id: string;
  type: string;
  data: {
    id: string;
  };
  live_mode: boolean;
}

interface PaymentData {
  id: number;
  status: string;
  status_detail: string;
  external_reference: string;
  transaction_amount: number;
  payment_method_id: string;
  point_of_interaction?: {
    qr_code?: {
      image: string;
      in_store_order_id: string;
    };
  };
  transaction_details?: {
    acquirer_reference: string;
    external_resource_url: string;
  };
}

/**
 * Valida a assinatura do webhook do Mercado Pago
 * Referência: https://developer.mercadopago.com/pt-BR/docs/webhooks/validate-webhook
 */
export function validateWebhookSignature(
  body: string,
  xSignature: string,
  xRequestId: string
): boolean {
  if (!ENV.mercadopagoWebhookSecret) {
    console.warn("Webhook secret not configured");
    return false;
  }

  // Formato: ts=timestamp,v1=signature
  const parts = xSignature.split(",");
  const timestamp = parts[0]?.split("=")[1];
  const signature = parts[1]?.split("=")[1];

  if (!timestamp || !signature) {
    console.error("Invalid signature format");
    return false;
  }

  // Criar string para assinar: timestamp.body
  const dataToSign = `${timestamp}.${body}`;

  // Gerar HMAC SHA256
  const hmac = crypto
    .createHmac("sha256", ENV.mercadopagoWebhookSecret)
    .update(dataToSign)
    .digest("hex");

  // Comparar assinaturas
  const isValid = hmac === signature;

  if (!isValid) {
    console.error("Webhook signature validation failed");
  }

  return isValid;
}

/**
 * Processa evento de webhook do Mercado Pago
 */
export async function processWebhookEvent(event: WebhookEvent): Promise<void> {
  console.log(`Processing webhook event: ${event.type} (${event.id})`);

  // Apenas processar eventos de pagamento
  if (event.type !== "payment") {
    console.log(`Ignoring event type: ${event.type}`);
    return;
  }

  try {
    // Buscar dados do pagamento na API do Mercado Pago
    const paymentData = await fetchPaymentData(event.data.id);

    if (!paymentData) {
      console.error(`Payment not found: ${event.data.id}`);
      return;
    }

    // Extrair ID do pedido da referência externa
    const orderIdMatch = paymentData.external_reference?.match(/order_(\d+)/);
    if (!orderIdMatch) {
      console.error(`Invalid external reference: ${paymentData.external_reference}`);
      return;
    }

    const orderId = parseInt(orderIdMatch[1]);

    // Mapear status do Mercado Pago para status do pedido
    const orderStatus = mapPaymentStatusToOrderStatus(paymentData.status);

    if (!orderStatus) {
      console.log(`Skipping order update for payment status: ${paymentData.status}`);
      return;
    }

    // Atualizar status do pedido
    await updateOrderStatus(orderId, orderStatus);

    console.log(`Order ${orderId} updated to status: ${orderStatus}`);
  } catch (error) {
    console.error("Error processing webhook event:", error);
    throw error;
  }
}

/**
 * Busca dados do pagamento na API do Mercado Pago
 */
async function fetchPaymentData(paymentId: string): Promise<PaymentData | null> {
  const accessToken = ENV.mercadopagoAccessToken;

  if (!accessToken) {
    throw new Error("Mercado Pago Access Token not configured");
  }

  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch payment: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching payment data:", error);
    throw error;
  }
}

/**
 * Mapeia status do Mercado Pago para status do pedido
 */
function mapPaymentStatusToOrderStatus(
  paymentStatus: string
): "pendente" | "processando" | "enviado" | "entregue" | "cancelado" | null {
  const statusMap: Record<string, "pendente" | "processando" | "enviado" | "entregue" | "cancelado"> = {
    "pending": "pendente",
    "approved": "processando",
    "authorized": "processando",
    "in_process": "pendente",
    "in_mediation": "pendente",
    "rejected": "cancelado",
    "cancelled": "cancelado",
    "refunded": "cancelado",
    "charged_back": "cancelado",
  };

  return statusMap[paymentStatus] || null;
}

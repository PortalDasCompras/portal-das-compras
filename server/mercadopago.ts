import { ENV } from "./_core/env";

interface PaymentData {
  orderId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCpf: string;
  amount: number;
  description: string;
  paymentMethod: "pix" | "boleto" | "credit_card";
  cardData?: {
    cardNumber: string;
    cardholderName: string;
    expirationMonth: number;
    expirationYear: number;
    securityCode: string;
  };
}

interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  status?: string;
  pixQrCode?: string;
  pixCopyPaste?: string;
  barcodeNumber?: string;
  barcodePicture?: string;
  error?: string;
}

/**
 * Tokeniza dados do cartão usando a API de tokenização do Mercado Pago
 */
export async function tokenizeCard(cardData: {
  cardNumber: string;
  cardholderName: string;
  expirationMonth: number;
  expirationYear: number;
  securityCode: string;
}): Promise<string> {
  const publicKey = ENV.mercadopagoPublicKey;
  if (!publicKey) {
    throw new Error("Mercado Pago Public Key não configurada");
  }

  try {
    const response = await fetch("https://api.mercadopago.com/v1/card_tokens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${publicKey}`,
      },
      body: JSON.stringify({
        card_number: cardData.cardNumber.replace(/\s/g, ""),
        cardholder: {
          name: cardData.cardholderName,
        },
        expiration_month: cardData.expirationMonth,
        expiration_year: cardData.expirationYear,
        security_code: cardData.securityCode,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erro ao tokenizar cartão");
    }

    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error("Erro ao tokenizar cartão:", error);
    throw error;
  }
}

/**
 * Processa pagamento usando checkout transparente do Mercado Pago
 */
export async function processPayment(data: PaymentData): Promise<PaymentResponse> {
  const accessToken = ENV.mercadopagoAccessToken;

  if (!accessToken) {
    return {
      success: false,
      error: "Mercado Pago Access Token não configurado",
    };
  }

  // Validar dados obrigatórios
  if (!data.customerEmail || !data.customerName || !data.customerPhone || !data.customerCpf) {
    return {
      success: false,
      error: "Dados do comprador incompletos. Verifique nome, e-mail, telefone e CPF.",
    };
  }

  // Validar formato de CPF (11 dígitos)
  if (data.customerCpf.replace(/\D/g, "").length !== 11) {
    return {
      success: false,
      error: "CPF inválido. Deve conter 11 dígitos.",
    };
  }

  // Validar formato de telefone (10-11 dígitos)
  const phoneDigits = data.customerPhone.replace(/\D/g, "");
  if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    return {
      success: false,
      error: "Telefone inválido. Deve conter entre 10 e 11 dígitos.",
    };
  }

  try {
    const paymentPayload: any = {
      transaction_amount: data.amount,
      description: data.description,
      external_reference: `order_${data.orderId}`,
      payer: {
        email: data.customerEmail,
        first_name: data.customerName.split(" ")[0],
        last_name: data.customerName.split(" ").slice(1).join(" ") || ".",
        phone: {
          area_code: data.customerPhone.slice(0, 2),
          number: data.customerPhone.slice(2),
        },
        identification: {
          type: "CPF",
          number: data.customerCpf,
        },
      },
      payment_method_id: data.paymentMethod === "credit_card" ? "card" : data.paymentMethod,
    };

    // Adicionar dados específicos por método de pagamento
    if (data.paymentMethod === "credit_card" && data.cardData) {
      try {
        // Tokenizar cartão de forma segura
        const cardToken = await tokenizeCard(data.cardData);
        paymentPayload.token = cardToken;
        paymentPayload.installments = 1;
        paymentPayload.statement_descriptor = "PORTAL COMPRAS";
        paymentPayload.issuer_id = -1;
      } catch (tokenError) {
        console.error("Erro ao tokenizar cartão:", tokenError);
        return {
          success: false,
          error: "Erro ao processar dados do cartão. Verifique os dados e tente novamente.",
        };
      }
    } else if (data.paymentMethod === "pix") {
      // PIX requer que o pagamento seja criado e o QR code retornado
    } else if (data.paymentMethod === "boleto") {
      // Boleto requer que o pagamento seja criado e o código de barras retornado
    }

    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(paymentPayload),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Mercado Pago API error:", error);
      return {
        success: false,
        error: error.message || "Erro ao processar pagamento",
      };
    }

    const payment = await response.json();

    // Formatar resposta baseado no método de pagamento
    const result: PaymentResponse = {
      success: payment.status === "approved" || payment.status === "pending",
      paymentId: payment.id.toString(),
      status: payment.status,
    };

    if (data.paymentMethod === "pix" && payment.point_of_interaction?.qr_code) {
      result.pixQrCode = payment.point_of_interaction.qr_code.image;
      result.pixCopyPaste = payment.point_of_interaction.qr_code.in_store_order_id;
    } else if (data.paymentMethod === "boleto" && payment.transaction_details) {
      result.barcodeNumber = payment.transaction_details.acquirer_reference;
      result.barcodePicture = payment.transaction_details.external_resource_url;
    }

    return result;
  } catch (error) {
    console.error("Erro processando pagamento Mercado Pago:", error);
    return {
      success: false,
      error: "Erro ao processar pagamento",
    };
  }
}

/**
 * Obtém status de um pagamento
 */
export async function getPaymentStatus(paymentId: string): Promise<{
  status: string;
  statusDetail: string;
}> {
  const accessToken = ENV.mercadopagoAccessToken;

  if (!accessToken) {
    throw new Error("Mercado Pago Access Token não configurado");
  }

  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar status do pagamento");
    }

    const payment = await response.json();
    return {
      status: payment.status,
      statusDetail: payment.status_detail,
    };
  } catch (error) {
    console.error("Erro buscando status do pagamento:", error);
    throw error;
  }
}

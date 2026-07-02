import { Express, Request, Response } from "express";
import { validateWebhookSignature, processWebhookEvent } from "../webhook";

interface WebhookEvent {
  id: string;
  type: string;
  data: {
    id: string;
  };
  live_mode: boolean;
}

/**
 * Registra rotas de webhook do Mercado Pago
 */
export function registerWebhookRoutes(app: Express) {
  /**
   * Webhook do Mercado Pago para notificações de pagamento
   * POST /api/webhooks/mercadopago
   */
  app.post("/api/webhooks/mercadopago", async (req: Request, res: Response) => {
    try {
      // Obter headers de validação
      const xSignature = req.headers["x-signature"] as string;
      const xRequestId = req.headers["x-request-id"] as string;

      // Obter body como string para validação de assinatura
      const rawBody = JSON.stringify(req.body);

      // Validar assinatura do webhook
      if (!validateWebhookSignature(rawBody, xSignature, xRequestId)) {
        console.warn("Webhook signature validation failed");
        return res.status(401).json({ error: "Invalid signature" });
      }

      // Processar evento
      const event: WebhookEvent = req.body;
      await processWebhookEvent(event);

      // Retornar sucesso
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  /**
   * Health check para webhook (GET)
   */
  app.get("/api/webhooks/mercadopago", (req: Request, res: Response) => {
    res.status(200).json({ status: "ok", message: "Mercado Pago webhook endpoint is running" });
  });

  console.log("Webhook routes registered");
}

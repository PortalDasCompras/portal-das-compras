import { describe, it, expect, vi } from "vitest";
import { processPayment, tokenizeCard } from "./mercadopago";

// Mock do fetch global
global.fetch = vi.fn();

describe("Mercado Pago - Integração", () => {
  describe("Validação de Dados do Cliente", () => {
    it("deve rejeitar CPF com menos de 11 dígitos", async () => {
      const result = await processPayment({
        orderId: 1,
        customerName: "João Silva",
        customerEmail: "joao@test.com",
        customerPhone: "11999999999",
        customerCpf: "1234567890", // 10 dígitos - inválido
        amount: 100,
        description: "Pedido #1",
        paymentMethod: "pix",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("CPF inválido");
    });

    it("deve rejeitar telefone com menos de 10 dígitos", async () => {
      const result = await processPayment({
        orderId: 1,
        customerName: "João Silva",
        customerEmail: "joao@test.com",
        customerPhone: "119999999", // 9 dígitos - inválido
        customerCpf: "12345678901",
        amount: 100,
        description: "Pedido #1",
        paymentMethod: "pix",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Telefone inválido");
    });

    it("deve rejeitar telefone com mais de 11 dígitos", async () => {
      const result = await processPayment({
        orderId: 1,
        customerName: "João Silva",
        customerEmail: "joao@test.com",
        customerPhone: "119999999999", // 12 dígitos - inválido
        customerCpf: "12345678901",
        amount: 100,
        description: "Pedido #1",
        paymentMethod: "pix",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Telefone inválido");
    });

    it("deve aceitar telefone com 10 dígitos", async () => {
      // Mock da resposta do Mercado Pago
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 123456,
          status: "pending",
          point_of_interaction: {
            qr_code: {
              image: "data:image/png;base64,iVBORw0KGgo=",
              in_store_order_id: "00020126360014br.gov.bcb.pix0136xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx520400005303986540510.005802BR5913Fulano de Tal6009SAO PAULO62410503***63041D3D",
            },
          },
        }),
      });

      const result = await processPayment({
        orderId: 1,
        customerName: "João Silva",
        customerEmail: "joao@test.com",
        customerPhone: "1199999999", // 10 dígitos - válido
        customerCpf: "12345678901",
        amount: 100,
        description: "Pedido #1",
        paymentMethod: "pix",
      });

      expect(result.success).toBe(true);
    });

    it("deve aceitar telefone com 11 dígitos", async () => {
      // Mock da resposta do Mercado Pago
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 123456,
          status: "pending",
          point_of_interaction: {
            qr_code: {
              image: "data:image/png;base64,iVBORw0KGgo=",
              in_store_order_id: "00020126360014br.gov.bcb.pix0136xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx520400005303986540510.005802BR5913Fulano de Tal6009SAO PAULO62410503***63041D3D",
            },
          },
        }),
      });

      const result = await processPayment({
        orderId: 1,
        customerName: "João Silva",
        customerEmail: "joao@test.com",
        customerPhone: "11999999999", // 11 dígitos - válido
        customerCpf: "12345678901",
        amount: 100,
        description: "Pedido #1",
        paymentMethod: "pix",
      });

      expect(result.success).toBe(true);
    });

    it("deve rejeitar dados incompletos do cliente", async () => {
      const result = await processPayment({
        orderId: 1,
        customerName: "", // vazio
        customerEmail: "joao@test.com",
        customerPhone: "11999999999",
        customerCpf: "12345678901",
        amount: 100,
        description: "Pedido #1",
        paymentMethod: "pix",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("incompletos");
    });
  });

  describe("Métodos de Pagamento", () => {
    it("deve processar pagamento PIX com sucesso", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 123456,
          status: "pending",
          point_of_interaction: {
            qr_code: {
              image: "data:image/png;base64,iVBORw0KGgo=",
              in_store_order_id: "00020126360014br.gov.bcb.pix0136xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx520400005303986540510.005802BR5913Fulano de Tal6009SAO PAULO62410503***63041D3D",
            },
          },
        }),
      });

      const result = await processPayment({
        orderId: 1,
        customerName: "João Silva",
        customerEmail: "joao@test.com",
        customerPhone: "11999999999",
        customerCpf: "12345678901",
        amount: 100,
        description: "Pedido #1",
        paymentMethod: "pix",
      });

      expect(result.success).toBe(true);
      expect(result.paymentId).toBeDefined();
      expect(result.status).toBe("pending");
      expect(result.pixQrCode).toBeDefined();
      expect(result.pixCopyPaste).toBeDefined();
    });

    it("deve processar pagamento Boleto com sucesso", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 123456,
          status: "pending",
          transaction_details: {
            acquirer_reference: "12345.67890 12345.678901 12345.678901 1 12345678901234",
            external_resource_url: "https://www.mercadopago.com/boleto/123456",
          },
        }),
      });

      const result = await processPayment({
        orderId: 1,
        customerName: "João Silva",
        customerEmail: "joao@test.com",
        customerPhone: "11999999999",
        customerCpf: "12345678901",
        amount: 100,
        description: "Pedido #1",
        paymentMethod: "boleto",
      });

      expect(result.success).toBe(true);
      expect(result.barcodeNumber).toBeDefined();
      expect(result.barcodePicture).toBeDefined();
    });

    it("deve processar pagamento com Cartão de Crédito", async () => {
      // Mock da tokenização
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "token_123456",
        }),
      });

      // Mock do pagamento
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 123456,
          status: "approved",
        }),
      });

      const result = await processPayment({
        orderId: 1,
        customerName: "João Silva",
        customerEmail: "joao@test.com",
        customerPhone: "11999999999",
        customerCpf: "12345678901",
        amount: 100,
        description: "Pedido #1",
        paymentMethod: "credit_card",
        cardData: {
          cardNumber: "4111111111111111",
          cardholderName: "JOAO SILVA",
          expirationMonth: 12,
          expirationYear: 25,
          securityCode: "123",
        },
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe("approved");
    });
  });

  describe("Tratamento de Erros", () => {
    it("deve retornar erro quando Access Token não está configurado", async () => {
      // Simular que o token não está configurado
      const result = await processPayment({
        orderId: 1,
        customerName: "João Silva",
        customerEmail: "joao@test.com",
        customerPhone: "11999999999",
        customerCpf: "12345678901",
        amount: 100,
        description: "Pedido #1",
        paymentMethod: "pix",
      });

      // Se o token não estiver configurado, deve retornar erro
      if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
        expect(result.success).toBe(false);
        expect(result.error).toContain("Access Token");
      }
    });

    it("deve retornar erro quando API retorna erro", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          message: "Invalid payment method",
        }),
      });

      const result = await processPayment({
        orderId: 1,
        customerName: "João Silva",
        customerEmail: "joao@test.com",
        customerPhone: "11999999999",
        customerCpf: "12345678901",
        amount: 100,
        description: "Pedido #1",
        paymentMethod: "pix",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("Formatação de Dados", () => {
    it("deve formatar corretamente o nome do cliente", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 123456,
          status: "pending",
          point_of_interaction: {
            qr_code: {
              image: "data:image/png;base64,iVBORw0KGgo=",
              in_store_order_id: "00020126360014br.gov.bcb.pix0136xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx520400005303986540510.005802BR5913Fulano de Tal6009SAO PAULO62410503***63041D3D",
            },
          },
        }),
      });

      await processPayment({
        orderId: 1,
        customerName: "João Silva Santos",
        customerEmail: "joao@test.com",
        customerPhone: "11999999999",
        customerCpf: "12345678901",
        amount: 100,
        description: "Pedido #1",
        paymentMethod: "pix",
      });

      // Verificar que o fetch foi chamado com os dados corretos
      expect(global.fetch).toHaveBeenCalled();
      const callArgs = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      expect(body.payer.first_name).toBe("João");
      expect(body.payer.last_name).toBe("Silva");
    });

    it("deve formatar corretamente o telefone", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 123456,
          status: "pending",
          point_of_interaction: {
            qr_code: {
              image: "data:image/png;base64,iVBORw0KGgo=",
              in_store_order_id: "00020126360014br.gov.bcb.pix0136xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx520400005303986540510.005802BR5913Fulano de Tal6009SAO PAULO62410503***63041D3D",
            },
          },
        }),
      });

      await processPayment({
        orderId: 1,
        customerName: "João Silva",
        customerEmail: "joao@test.com",
        customerPhone: "11999999999",
        customerCpf: "12345678901",
        amount: 100,
        description: "Pedido #1",
        paymentMethod: "pix",
      });

      const callArgs = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      expect(body.payer.phone.area_code).toBe("11");
      expect(body.payer.phone.number).toBe("99999999"); // slice(2) de "11999999999" = "99999999"
    });
  });
});

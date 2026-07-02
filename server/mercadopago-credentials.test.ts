import { describe, it, expect } from "vitest";

describe("Mercado Pago Credentials Validation", () => {
  it("should validate Mercado Pago Access Token", async () => {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    
    expect(accessToken).toBeDefined();
    expect(accessToken?.length).toBeGreaterThan(50);
    console.log("✅ Access Token válido!");
  });

  it("should validate Mercado Pago Public Key", async () => {
    const publicKey = process.env.VITE_MERCADOPAGO_PUBLIC_KEY;
    
    expect(publicKey).toBeDefined();
    expect(publicKey?.length).toBeGreaterThan(20);
    
    console.log("✅ Public Key válida!");
  });
});

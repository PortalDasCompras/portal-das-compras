import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock db module to avoid real DB connections in tests
vi.mock("./db", () => ({
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  getAllProducts: vi.fn().mockResolvedValue([
    { id: 1, name: "Produto Teste", price: "49.90", originalPrice: "87.30", category: "eletronicos", image: "https://example.com/img.jpg", stock: 10, active: true, description: "Desc", createdAt: new Date(), updatedAt: new Date() }
  ]),
  getProductsByCategory: vi.fn().mockResolvedValue([]),
  getProductById: vi.fn().mockResolvedValue({
    id: 1, name: "Produto Teste", price: "49.90", originalPrice: "87.30", category: "eletronicos",
    image: "https://example.com/img.jpg", stock: 10, active: true, description: "Desc",
    createdAt: new Date(), updatedAt: new Date()
  }),
  createProduct: vi.fn().mockResolvedValue({ insertId: 99 }),
  updateProduct: vi.fn().mockResolvedValue(undefined),
  deleteProduct: vi.fn().mockResolvedValue(undefined),
  getAllProductsAdmin: vi.fn().mockResolvedValue([]),
  createOrder: vi.fn().mockResolvedValue({ insertId: 1 }),
  getAllOrders: vi.fn().mockResolvedValue([]),
  getOrderById: vi.fn().mockResolvedValue(undefined),
  updateOrderStatus: vi.fn().mockResolvedValue(undefined),
  createAdminSession: vi.fn().mockResolvedValue(undefined),
  getAdminSession: vi.fn().mockResolvedValue({ token: "valid-token", expiresAt: new Date(Date.now() + 86400000), createdAt: new Date(), id: 1 }),
  deleteAdminSession: vi.fn().mockResolvedValue(undefined),
}));

function createCtx(cookies: Record<string, string> = {}): TrpcContext {
  const setCookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];
  const clearedCookies: Array<{ name: string; options: Record<string, unknown> }> = [];
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
      cookies,
    } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        setCookies.push({ name, value, options });
      },
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };
}

describe("adminAuth", () => {
  it("rejects invalid credentials", async () => {
    const ctx = createCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.adminAuth.login({ username: "wrong", password: "wrong" })).rejects.toThrow();
  });

  it("accepts correct credentials (claysson/1508)", async () => {
    const ctx = createCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.adminAuth.login({ username: "claysson", password: "1508" });
    expect(result.success).toBe(true);
  });

  it("returns authenticated=true when valid session token is present", async () => {
    const ctx = createCtx({ admin_token: "valid-token" });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.adminAuth.check();
    expect(result.authenticated).toBe(true);
  });

  it("returns authenticated=false when no token", async () => {
    const ctx = createCtx({});
    const caller = appRouter.createCaller(ctx);
    const result = await caller.adminAuth.check();
    expect(result.authenticated).toBe(false);
  });
});

describe("products", () => {
  it("lists all products", async () => {
    const ctx = createCtx();
    const caller = appRouter.createCaller(ctx);
    const products = await caller.products.list({});
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
  });

  it("gets product by id", async () => {
    const ctx = createCtx();
    const caller = appRouter.createCaller(ctx);
    const product = await caller.products.getById({ id: 1 });
    expect(product.id).toBe(1);
    expect(product.name).toBe("Produto Teste");
  });

  it("requires admin session to list admin products", async () => {
    const ctx = createCtx({});
    const caller = appRouter.createCaller(ctx);
    await expect(caller.products.listAdmin()).rejects.toThrow();
  });

  it("allows admin to list products with valid session", async () => {
    const ctx = createCtx({ admin_token: "valid-token" });
    const caller = appRouter.createCaller(ctx);
    const products = await caller.products.listAdmin();
    expect(Array.isArray(products)).toBe(true);
  });
});

describe("orders", () => {
  it("creates an order successfully", async () => {
    const ctx = createCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.orders.create({
      customerName: "João Silva",
      customerEmail: "joao@example.com",
      customerPhone: "11999999999",
      customerCpf: "12345678901",
      addressCep: "01310100",
      addressStreet: "Av. Paulista",
      addressNumber: "1000",
      addressNeighborhood: "Bela Vista",
      addressCity: "São Paulo",
      addressState: "SP",
      items: [{ productId: 1, name: "Produto Teste", price: 49.90, quantity: 1, image: "https://example.com/img.jpg" }],
      total: 49.90,
      paymentMethod: "pix",
    });
    expect(result.success).toBe(true);
  });

  it("requires admin session to list orders", async () => {
    const ctx = createCtx({});
    const caller = appRouter.createCaller(ctx);
    await expect(caller.orders.list()).rejects.toThrow();
  });
});

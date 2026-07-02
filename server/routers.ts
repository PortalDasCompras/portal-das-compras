import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { COOKIE_NAME } from "@shared/const";
import { processPayment } from "./mercadopago";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getAllProducts, getProductsByCategory, getProductById,
  createProduct, updateProduct, deleteProduct, getAllProductsAdmin,
  createOrder, getAllOrders, getOrderById, updateOrderStatus, updateOrderPayment,
  createAdminSession, getAdminSession, deleteAdminSession,
  upsertUser, getUserByOpenId,
} from "./db";

const ADMIN_USERNAME = "claysson";
const ADMIN_PASSWORD = "1508";

// Admin middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Admin Auth ────────────────────────────────────────────────────────────
  adminAuth: router({
    login: publicProcedure
      .input(z.object({ username: z.string(), password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (input.username !== ADMIN_USERNAME || input.password !== ADMIN_PASSWORD) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Credenciais inválidas" });
        }
        const token = nanoid(64);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
        await createAdminSession(token, expiresAt);
        ctx.res.cookie("admin_token", token, {
          httpOnly: true,
          secure: ctx.req.protocol === "https",
          sameSite: "none",
          maxAge: 24 * 60 * 60 * 1000,
          path: "/",
        });
        return { success: true, token };
      }),

    logout: publicProcedure.mutation(async ({ ctx }) => {
      const token = ctx.req.cookies?.admin_token;
      if (token) {
        await deleteAdminSession(token);
        ctx.res.clearCookie("admin_token", { path: "/" });
      }
      return { success: true };
    }),

    check: publicProcedure.query(async ({ ctx }) => {
      const token = ctx.req.cookies?.admin_token;
      if (!token) return { authenticated: false };
      const session = await getAdminSession(token);
      if (!session) return { authenticated: false };
      if (new Date() > session.expiresAt) {
        await deleteAdminSession(token);
        return { authenticated: false };
      }
      return { authenticated: true };
    }),
  }),

  // ─── Products ──────────────────────────────────────────────────────────────
  products: router({
    list: publicProcedure
      .input(z.object({ search: z.string().optional(), category: z.string().optional() }).optional())
      .query(async ({ input }) => {
        if (input?.category && input.category !== "todos") {
          return getProductsByCategory(input.category);
        }
        return getAllProducts(input?.search);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const product = await getProductById(input.id);
        if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Produto não encontrado" });
        return product;
      }),

    // Admin procedures
    listAdmin: publicProcedure.query(async ({ ctx }) => {
      const token = ctx.req.cookies?.admin_token;
      if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });
      const session = await getAdminSession(token);
      if (!session || new Date() > session.expiresAt) throw new TRPCError({ code: "UNAUTHORIZED" });
      return getAllProductsAdmin();
    }),

    create: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        price: z.string(),
        originalPrice: z.string(),
        category: z.enum(["beleza", "casa", "eletronicos", "esportes", "moda", "outros"]),
        image: z.string().url(),
        stock: z.number().int().min(0),
      }))
      .mutation(async ({ input, ctx }) => {
        const token = ctx.req.cookies?.admin_token;
        if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });
        const session = await getAdminSession(token);
        if (!session || new Date() > session.expiresAt) throw new TRPCError({ code: "UNAUTHORIZED" });
        await createProduct({
          name: input.name,
          description: input.description,
          price: input.price as any,
          originalPrice: input.originalPrice as any,
          category: input.category,
          image: input.image,
          stock: input.stock,
          active: true,
        });
        return { success: true };
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        originalPrice: z.string().optional(),
        category: z.enum(["beleza", "casa", "eletronicos", "esportes", "moda", "outros"]).optional(),
        image: z.string().optional(),
        stock: z.number().int().min(0).optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const token = ctx.req.cookies?.admin_token;
        if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });
        const session = await getAdminSession(token);
        if (!session || new Date() > session.expiresAt) throw new TRPCError({ code: "UNAUTHORIZED" });
        const { id, ...data } = input;
        await updateProduct(id, data as any);
        return { success: true };
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const token = ctx.req.cookies?.admin_token;
        if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });
        const session = await getAdminSession(token);
        if (!session || new Date() > session.expiresAt) throw new TRPCError({ code: "UNAUTHORIZED" });
        await deleteProduct(input.id);
        return { success: true };
      }),
  }),

  // ─── Orders ────────────────────────────────────────────────────────────────
  orders: router({
    create: publicProcedure
      .input(z.object({
        customerName: z.string().min(1),
        customerEmail: z.string().email(),
        customerPhone: z.string().min(10),
        customerCpf: z.string().min(11),
        addressCep: z.string().min(8),
        addressStreet: z.string().min(1),
        addressNumber: z.string().min(1),
        addressComplement: z.string().optional(),
        addressNeighborhood: z.string().min(1),
        addressCity: z.string().min(1),
        addressState: z.string().length(2),
        items: z.array(z.object({
          productId: z.number(),
          name: z.string(),
          price: z.number(),
          quantity: z.number(),
          image: z.string(),
        })),
        total: z.number(),
        paymentMethod: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const order = await createOrder({
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          customerCpf: input.customerCpf,
          addressCep: input.addressCep,
          addressStreet: input.addressStreet,
          addressNumber: input.addressNumber,
          addressComplement: input.addressComplement,
          addressNeighborhood: input.addressNeighborhood,
          addressCity: input.addressCity,
          addressState: input.addressState,
          items: input.items as any,
          total: input.total.toString() as any,
          paymentMethod: input.paymentMethod ?? "pix",
        });
        
        return {
          success: true,
          orderId: order.id,
          total: input.total,
          paymentMethod: input.paymentMethod ?? "pix",
        }
      }),

    list: publicProcedure.query(async ({ ctx }) => {
      const token = ctx.req.cookies?.admin_token;
      if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });
      const session = await getAdminSession(token);
      if (!session || new Date() > session.expiresAt) throw new TRPCError({ code: "UNAUTHORIZED" });
      return getAllOrders();
    }),

    updateStatus: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pendente", "processando", "enviado", "entregue", "cancelado"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const token = ctx.req.cookies?.admin_token;
        if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });
        const session = await getAdminSession(token);
        if (!session || new Date() > session.expiresAt) throw new TRPCError({ code: "UNAUTHORIZED" });
        await updateOrderStatus(input.id, input.status);
        return { success: true };
      }),

    processPayment: publicProcedure
      .input(z.object({
        orderId: z.number(),
        customerName: z.string(),
        customerEmail: z.string().email(),
        customerPhone: z.string(),
        customerCpf: z.string(),
        amount: z.number(),
        paymentMethod: z.enum(["pix", "boleto", "credit_card"]),
        cardData: z.object({
          cardNumber: z.string(),
          cardholderName: z.string(),
          expirationMonth: z.number(),
          expirationYear: z.number(),
          securityCode: z.string(),
        }).optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const result = await processPayment({
            orderId: input.orderId,
            customerName: input.customerName,
            customerEmail: input.customerEmail,
            customerPhone: input.customerPhone,
            customerCpf: input.customerCpf,
            amount: input.amount,
            description: `Pedido #${input.orderId}`,
            paymentMethod: input.paymentMethod,
            cardData: input.cardData,
          });

          if (result.success) {
            await updateOrderPayment(input.orderId, {
              paymentId: result.paymentId,
              paymentStatus: result.status,
              pixQrCode: result.pixQrCode,
              pixCopyPaste: result.pixCopyPaste,
              barcodeNumber: result.barcodeNumber,
              barcodePicture: result.barcodePicture,
            });
          }

          return result;
        } catch (error) {
          console.error("Erro ao processar pagamento:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao processar pagamento",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;

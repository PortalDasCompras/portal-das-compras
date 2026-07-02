import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../drizzle/schema";
import { eq, like, ilike } from "drizzle-orm";

// Criar conexão com o banco de dados
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const client = postgres(connectionString);
export const db = drizzle(client, { schema });

// ─── Products ──────────────────────────────────────────────────────────────

export async function getAllProducts(search?: string) {
  try {
    if (search) {
      return await db
        .select()
        .from(schema.products)
        .where(ilike(schema.products.name, `%${search}%`))
        .limit(100);
    }
    return await db.select().from(schema.products).limit(100);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return [];
  }
}

export async function getProductsByCategory(category: string) {
  try {
    return await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.category, category as any))
      .limit(100);
  } catch (error) {
    console.error("Erro ao buscar produtos por categoria:", error);
    return [];
  }
}

export async function getProductById(id: number) {
  try {
    const result = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.id, id))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return null;
  }
}

export async function createProduct(data: any) {
  try {
    const result = await db
      .insert(schema.products)
      .values({
        name: data.name,
        description: data.description || "",
        price: (parseFloat(data.price) || 0).toString(),
        originalPrice: (parseFloat(data.originalPrice) || 0).toString(),
        category: data.category,
        image: data.image,
        stock: data.stock || 10,
        active: data.active !== false,
      })
      .returning();
    return result[0] || null;
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    throw error;
  }
}

export async function updateProduct(id: number, data: any) {
  try {
    const result = await db
      .update(schema.products)
      .set({
        name: data.name,
        description: data.description,
        price: data.price ? parseFloat(data.price).toString() : undefined,
        originalPrice: data.originalPrice ? parseFloat(data.originalPrice).toString() : undefined,
        category: data.category,
        image: data.image,
        stock: data.stock,
        active: data.active,
        updatedAt: new Date(),
      })
      .where(eq(schema.products.id, id))
      .returning();
    return result[0] || null;
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    throw error;
  }
}

export async function deleteProduct(id: number) {
  try {
    await db.delete(schema.products).where(eq(schema.products.id, id));
    return true;
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    throw error;
  }
}

// ─── Orders ────────────────────────────────────────────────────────────────

export async function createOrder(data: any) {
  try {
    const result = await db
      .insert(schema.orders)
      .values({
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        customerCpf: data.customerCpf,
        addressCep: data.addressCep,
        addressStreet: data.addressStreet,
        addressNumber: data.addressNumber,
        addressComplement: data.addressComplement,
        addressNeighborhood: data.addressNeighborhood,
        addressCity: data.addressCity,
        addressState: data.addressState,
        items: data.items,
        total: parseFloat(data.total),
        status: data.status || "pendente",
        paymentMethod: data.paymentMethod || "pix",
      })
      .returning();
    return result[0] || null;
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    throw error;
  }
}

export async function getOrderById(id: number) {
  try {
    const result = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, id))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Erro ao buscar pedido:", error);
    return null;
  }
}

export async function getAllOrders() {
  try {
    return await db.select().from(schema.orders).limit(1000);
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    return [];
  }
}

export async function updateOrderStatus(id: number, status: string) {
  try {
    const result = await db
      .update(schema.orders)
      .set({
        status: status as any,
        updatedAt: new Date(),
      })
      .where(eq(schema.orders.id, id))
      .returning();
    return result[0] || null;
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error);
    throw error;
  }
}

export async function updateOrderPayment(
  id: number,
  paymentData: {
    paymentId?: string;
    paymentStatus?: string;
    pixQrCode?: string;
    pixCopyPaste?: string;
    barcodeNumber?: string;
    barcodePicture?: string;
  }
) {
  try {
    const result = await db
      .update(schema.orders)
      .set({
        paymentId: paymentData.paymentId,
        paymentStatus: paymentData.paymentStatus,
        pixQrCode: paymentData.pixQrCode,
        pixCopyPaste: paymentData.pixCopyPaste,
        barcodeNumber: paymentData.barcodeNumber,
        barcodePicture: paymentData.barcodePicture,
        updatedAt: new Date(),
      })
      .where(eq(schema.orders.id, id))
      .returning();
    return result[0] || null;
  } catch (error) {
    console.error("Erro ao atualizar pagamento do pedido:", error);
    throw error;
  }
}

// ─── Users ─────────────────────────────────────────────────────────────────

export async function getUserByOpenId(openId: string) {
  try {
    const result = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.openId, openId))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return null;
  }
}

export async function createUser(data: any) {
  try {
    const result = await db
      .insert(schema.users)
      .values({
        openId: data.openId,
        name: data.name,
        email: data.email,
        loginMethod: data.loginMethod,
        role: data.role || "user",
      })
      .returning();
    return result[0] || null;
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    throw error;
  }
}

export async function updateUser(id: number, data: any) {
  try {
    const result = await db
      .update(schema.users)
      .set({
        name: data.name,
        email: data.email,
        loginMethod: data.loginMethod,
        role: data.role,
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      })
      .where(eq(schema.users.id, id))
      .returning();
    return result[0] || null;
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    throw error;
  }
}

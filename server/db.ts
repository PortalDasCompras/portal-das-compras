import { InsertUser, InsertProduct, InsertOrder } from "../drizzle/schema";
import { productDb, orderDb, userDb } from "./local-db";

// ─── Products ──────────────────────────────────────────────────────────────

export async function getAllProducts(search?: string) {
  try {
    if (search) {
      return productDb.search(search);
    }
    return productDb.getAll();
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return [];
  }
}

export async function getProductsByCategory(category: string) {
  try {
    return productDb.getByCategory(category);
  } catch (error) {
    console.error("Erro ao buscar produtos por categoria:", error);
    return [];
  }
}

export async function getProductById(id: number) {
  try {
    return productDb.getById(id);
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return null;
  }
}

export async function getAllProductsAdmin() {
  try {
    return productDb.getAll();
  } catch (error) {
    console.error("Erro ao buscar produtos admin:", error);
    return [];
  }
}

export async function createProduct(data: any) {
  try {
    return productDb.create({
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      originalPrice: parseFloat(data.originalPrice),
      category: data.category,
      image: data.image,
      stock: data.stock || 10,
      active: true,
    });
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    throw error;
  }
}

export async function updateProduct(id: number, data: any) {
  try {
    return productDb.update(id, {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      originalPrice: parseFloat(data.originalPrice),
      category: data.category,
      image: data.image,
      stock: data.stock,
      active: data.active,
    });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    throw error;
  }
}

export async function deleteProduct(id: number) {
  try {
    return productDb.delete(id);
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    throw error;
  }
}

// ─── Orders ────────────────────────────────────────────────────────────────

export async function createOrder(data: any) {
  try {
    return orderDb.create({
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
    });
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    throw error;
  }
}

export async function getAllOrders() {
  try {
    return orderDb.getAll();
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    return [];
  }
}

export async function getOrderById(id: number) {
  try {
    return orderDb.getById(id);
  } catch (error) {
    console.error("Erro ao buscar pedido:", error);
    return null;
  }
}

export async function updateOrderStatus(id: number, status: string) {
  try {
    return orderDb.update(id, { status });
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error);
    throw error;
  }
}

export async function updateOrderPayment(id: number, data: any) {
  try {
    return orderDb.update(id, {
      paymentId: data.paymentId,
      paymentStatus: data.paymentStatus,
      pixQrCode: data.pixQrCode,
      pixCopyPaste: data.pixCopyPaste,
      barcodeNumber: data.barcodeNumber,
      barcodePicture: data.barcodePicture,
    });
  } catch (error) {
    console.error("Erro ao atualizar pagamento:", error);
    throw error;
  }
}

// ─── Users ────────────────────────────────────────────────────────────────

export async function getUserByOpenId(openId: string) {
  try {
    return userDb.getByOpenId(openId);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return null;
  }
}

export async function upsertUser(data: any) {
  try {
    const user = userDb.upsertByOpenId(data.openId, {
      name: data.name || undefined,
      email: data.email || undefined,
      loginMethod: data.loginMethod || undefined,
      role: data.role || "user",
    });
    return user;
  } catch (error) {
    console.error("Erro ao fazer upsert de usuário:", error);
    throw error;
  }
}

// ─── Admin Sessions ────────────────────────────────────────────────────────

let adminSessions: Map<string, { expiresAt: Date }> = new Map();

export async function createAdminSession(token: string, expiresAt: Date) {
  adminSessions.set(token, { expiresAt });
}

export async function getAdminSession(token: string) {
  return adminSessions.get(token) || null;
}

export async function deleteAdminSession(token: string) {
  adminSessions.delete(token);
}

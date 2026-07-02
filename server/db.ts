import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { InsertUser, InsertProduct, InsertOrder } from "../drizzle/schema";

let _supabase: SupabaseClient | null = null;

export async function getDb() {
  if (!_supabase) {
    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (!supabaseUrl || !serviceRoleKey) {
        console.warn('[Database] Supabase credentials not configured');
        return null;
      }
      
      _supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false }
      });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _supabase = null;
    }
  }
  return _supabase;
}

export async function createOrder(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const orderData = {
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      customer_phone: data.customerPhone,
      customer_cpf: data.customerCpf,
      address_cep: data.addressCep,
      address_street: data.addressStreet,
      address_number: data.addressNumber,
      address_complement: data.addressComplement || null,
      address_neighborhood: data.addressNeighborhood,
      address_city: data.addressCity,
      address_state: data.addressState,
      items: JSON.stringify(data.items),
      total: parseFloat(data.total),
      payment_method: data.paymentMethod || null,
      status: 'pending'
    };

    const { data: order, error } = await db
      .from('orders')
      .insert([orderData])
      .select()
      .single();
    
    if (error) {
      console.error('DB Error:', error);
      throw error;
    }
    return order || { id: 0 };
  } catch (error: any) {
    console.error('Erro ao inserir pedido:', error.message);
    throw error;
  }
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  try {
    const { data, error } = await db
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    return undefined;
  }
}

export async function updateOrderPayment(orderId: number, paymentData: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    if (paymentData.paymentId) updateData.payment_id = paymentData.paymentId;
    if (paymentData.paymentStatus) updateData.payment_status = paymentData.paymentStatus;
    if (paymentData.pixQrCode) updateData.pix_qr_code = paymentData.pixQrCode;
    if (paymentData.pixCopyPaste) updateData.pix_copy_paste = paymentData.pixCopyPaste;
    if (paymentData.barcodeNumber) updateData.barcode_number = paymentData.barcodeNumber;
    if (paymentData.barcodePicture) updateData.barcode_picture = paymentData.barcodePicture;

    const { data, error } = await db
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Erro ao atualizar pagamento:', error.message);
    throw error;
  }
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const { data, error } = await db
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    return [];
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  try {
    const { data, error } = await db
      .from('users')
      .select('*')
      .eq('openId', openId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    return undefined;
  }
}

export async function getAdminSession(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  try {
    const { data, error } = await db
      .from('adminSessions')
      .select('*')
      .eq('token', token)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    return undefined;
  }
}

export async function deleteAdminSession(token: string) {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db
      .from('adminSessions')
      .delete()
      .eq('token', token);
  } catch (error) {
    console.error('Erro ao deletar sessão:', error);
  }
}

export async function updateOrderStatus(orderId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const { data, error } = await db
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Erro ao atualizar status:', error.message);
    throw error;
  }
}

export async function getAllProductsAdmin() {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const { data, error } = await db
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    return [];
  }
}

export async function updateProduct(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const { data: product, error } = await db
      .from('products')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return product;
  } catch (error: any) {
    console.error('Erro ao atualizar produto:', error.message);
    throw error;
  }
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const { error } = await db
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error: any) {
    console.error('Erro ao deletar produto:', error.message);
    throw error;
  }
}

export async function createAdminSession(token: string, expiresAt: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const { data, error } = await db
      .from('adminSessions')
      .insert([{ token, expiresAt }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Erro ao criar sessão:', error.message);
    throw error;
  }
}

export async function getAllProducts(search?: string) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    let query = db
      .from('products')
      .select('*');
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    return [];
  }
}

export async function getProductsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const { data, error } = await db
      .from('products')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    return [];
  }
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  try {
    const { data, error } = await db
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    return undefined;
  }
}

export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const { data: product, error } = await db
      .from('products')
      .insert([data])
      .select()
      .single();
    
    if (error) throw error;
    return product;
  } catch (error: any) {
    console.error('Erro ao criar produto:', error.message);
    throw error;
  }
}

export async function upsertUser(user: InsertUser): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  try {
    const { error } = await db
      .from('users')
      .upsert([user], { onConflict: 'openId' });
    
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao fazer upsert de usuário:', error);
  }
}

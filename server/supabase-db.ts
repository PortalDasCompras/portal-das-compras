import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

export async function getSupabaseClient() {
  if (!_supabase) {
    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('[Database] Supabase credentials not configured');
        return null;
      }
      
      _supabase = createClient(supabaseUrl, supabaseAnonKey);
      console.log('[Database] Connected to Supabase');
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _supabase = null;
    }
  }
  return _supabase;
}

export async function createOrder(data: any) {
  const supabase = await getSupabaseClient();
  if (!supabase) throw new Error("Supabase not available");
  
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .insert([data])
      .select()
      .single();
    
    if (error) throw error;
    return order;
  } catch (error: any) {
    console.error('Erro ao inserir pedido:', error.message);
    throw error;
  }
}

export async function getOrderById(id: number) {
  const supabase = await getSupabaseClient();
  if (!supabase) return undefined;
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    return undefined;
  }
}

export async function updateOrderPayment(orderId: number, paymentData: any) {
  const supabase = await getSupabaseClient();
  if (!supabase) throw new Error("Supabase not available");
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .update(paymentData)
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
  const supabase = await getSupabaseClient();
  if (!supabase) return [];
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return [];
  }
}

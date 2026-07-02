import axios from 'axios';

const MP_API_URL = 'https://api.mercadopago.com/v1';
const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

interface Transaction {
  id: string;
  date_created: string;
  money_release_date: string;
  money_release_status: string;
  status: string;
  status_detail: string;
  external_reference: string;
  transaction_amount: number;
  net_amount: number;
  fee_amount: number;
  payer_email: string;
  payment_method: {
    type: string;
    id: string;
  };
}

interface PaymentData {
  id: number;
  status: string;
  status_detail: string;
  transaction_amount: number;
  net_received_amount: number;
  fee_amount: number;
  date_created: string;
  date_approved: string;
  date_last_updated: string;
  payer: {
    email: string;
    first_name: string;
    last_name: string;
  };
  payment_method_id: string;
  payment_type_id: string;
  external_reference: string;
}

export async function getPaymentById(paymentId: string): Promise<PaymentData | null> {
  try {
    const response = await axios.get(
      `${MP_API_URL}/payments/${paymentId}`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar pagamento:', error.response?.data || error.message);
    return null;
  }
}

export async function listPayments(filters?: {
  begin_date?: string;
  end_date?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<PaymentData[]> {
  try {
    const params = new URLSearchParams();
    
    if (filters?.begin_date) params.append('begin_date', filters.begin_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.status) params.append('status', filters.status);
    params.append('limit', String(filters?.limit || 100));
    params.append('offset', String(filters?.offset || 0));

    const response = await axios.get(
      `${MP_API_URL}/payments/search?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.results || [];
  } catch (error: any) {
    console.error('Erro ao listar pagamentos:', error.response?.data || error.message);
    return [];
  }
}

export async function getPaymentsByDateRange(startDate: Date, endDate: Date) {
  try {
    const begin_date = startDate.toISOString();
    const end_date = endDate.toISOString();

    const payments = await listPayments({
      begin_date,
      end_date,
      limit: 1000
    });

    return payments;
  } catch (error) {
    console.error('Erro ao buscar pagamentos por período:', error);
    return [];
  }
}

export async function getSalesReport(startDate: Date, endDate: Date) {
  try {
    const payments = await getPaymentsByDateRange(startDate, endDate);

    const report = {
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      total_payments: payments.length,
      total_amount: 0,
      total_net: 0,
      total_fees: 0,
      by_status: {} as Record<string, number>,
      by_payment_method: {} as Record<string, { count: number; amount: number }>,
      payments: payments.map(p => ({
        id: p.id,
        date: p.date_created,
        status: p.status,
        amount: p.transaction_amount,
        net: p.net_received_amount,
        fee: p.fee_amount,
        method: p.payment_method_id,
        payer: p.payer?.email,
        external_ref: p.external_reference
      }))
    };

    // Calcular totais
    payments.forEach(payment => {
      report.total_amount += payment.transaction_amount;
      report.total_net += payment.net_received_amount;
      report.total_fees += payment.fee_amount;

      // Por status
      report.by_status[payment.status] = (report.by_status[payment.status] || 0) + 1;

      // Por método de pagamento
      const method = payment.payment_method_id || 'unknown';
      if (!report.by_payment_method[method]) {
        report.by_payment_method[method] = { count: 0, amount: 0 };
      }
      report.by_payment_method[method].count += 1;
      report.by_payment_method[method].amount += payment.transaction_amount;
    });

    return report;
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return null;
  }
}

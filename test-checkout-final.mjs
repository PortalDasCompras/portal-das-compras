const API_URL = 'http://localhost:3000/api/trpc';

console.log('🧪 Testando Checkout Completo com Supabase\n');

const testData = {
  customerName: 'João Silva Teste',
  customerEmail: 'joao.teste@example.com',
  customerPhone: '11987654321',
  customerCpf: '12345678901',
  addressCep: '01310100',
  addressStreet: 'Avenida Paulista',
  addressNumber: '1000',
  addressComplement: 'Apto 101',
  addressNeighborhood: 'Bela Vista',
  addressCity: 'São Paulo',
  addressState: 'SP',
  items: [
    {
      productId: 1,
      name: 'Mochila Impermeável',
      price: 89.90,
      quantity: 1,
      image: 'https://example.com/mochila.jpg'
    }
  ],
  total: 109.80,
  paymentMethod: 'pix'
};

try {
  console.log('📝 Etapa 1: Criando pedido...');
  
  const createOrderRes = await fetch(`${API_URL}/orders.create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ json: testData })
  });

  const createOrderData = await createOrderRes.json();
  
  if (createOrderData.error) {
    console.error('❌ Erro ao criar pedido:', createOrderData.error.json.message);
    process.exit(1);
  }

  const orderId = createOrderData.result.data?.id;
  console.log('✅ Pedido criado com ID:', orderId);

  console.log('\n📝 Etapa 2: Processando pagamento...');
  
  const processPaymentRes = await fetch(`${API_URL}/orders.processPayment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      json: {
        orderId,
        paymentMethod: 'pix',
        cardData: null
      }
    })
  });

  const processPaymentData = await processPaymentRes.json();
  
  if (processPaymentData.error) {
    console.error('❌ Erro ao processar pagamento:', processPaymentData.error.json.message);
    process.exit(1);
  }

  console.log('✅ Pagamento processado!');
  const payment = processPaymentData.result.data;
  console.log('\n📊 Detalhes do Pagamento:');
  console.log('- Status:', payment.paymentStatus);
  console.log('- Método:', payment.paymentMethod);
  if (payment.pixQrCode) console.log('- QR Code PIX:', payment.pixQrCode.substring(0, 50) + '...');
  if (payment.pixCopyPaste) console.log('- Copy & Paste:', payment.pixCopyPaste);
  if (payment.barcodeNumber) console.log('- Boleto:', payment.barcodeNumber);

  console.log('\n✅ Teste concluído com sucesso!');

} catch (error) {
  console.error('❌ Erro:', error.message);
  process.exit(1);
}

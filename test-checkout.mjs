// Dados de teste
const testData = {
  customerName: "João Silva Teste",
  customerEmail: "joao.teste@example.com",
  customerPhone: "11987654321",
  customerCpf: "12345678901",
  addressCep: "01310100",
  addressStreet: "Avenida Paulista",
  addressNumber: "1000",
  addressComplement: "Apto 101",
  addressNeighborhood: "Bela Vista",
  addressCity: "São Paulo",
  addressState: "SP",
  items: [
    {
      productId: 1,
      name: "Mochila Impermeável",
      price: 89.90,
      quantity: 1,
      image: "https://example.com/mochila.jpg"
    }
  ],
  total: 109.80,
};

async function testCheckout() {
  console.log('🧪 Iniciando teste de checkout...\n');

  try {
    // 1. Criar pedido
    console.log('📦 Etapa 1: Criando pedido...');
    const orderResponse = await fetch('http://localhost:3000/api/trpc/orders.create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: testData,
      }),
    });

    if (!orderResponse.ok) {
      console.error('❌ Erro ao criar pedido:', orderResponse.status);
      console.error(await orderResponse.text());
      return;
    }

    const orderResult = await orderResponse.json();
    console.log('✅ Pedido criado com sucesso!');
    console.log('Order ID:', orderResult.result?.data?.orderId);
    console.log('Total:', orderResult.result?.data?.total);

    const orderId = orderResult.result?.data?.orderId;
    if (!orderId) {
      console.error('❌ Erro: Order ID não retornado');
      return;
    }

    // 2. Testar PIX
    console.log('\n💳 Etapa 2: Testando pagamento com PIX...');
    const pixResponse = await fetch('http://localhost:3000/api/trpc/orders.processPayment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: {
          orderId,
          customerName: testData.customerName,
          customerEmail: testData.customerEmail,
          customerPhone: testData.customerPhone,
          customerCpf: testData.customerCpf,
          amount: testData.total,
          paymentMethod: 'pix',
        },
      }),
    });

    if (!pixResponse.ok) {
      console.error('❌ Erro ao processar PIX:', pixResponse.status);
      console.error(await pixResponse.text());
    } else {
      const pixResult = await pixResponse.json();
      if (pixResult.result?.data?.success) {
        console.log('✅ PIX processado com sucesso!');
        console.log('Payment ID:', pixResult.result?.data?.paymentId);
        console.log('Status:', pixResult.result?.data?.status);
      } else {
        console.error('❌ Erro no PIX:', pixResult.result?.data?.error);
      }
    }

    // 3. Testar Boleto
    console.log('\n💳 Etapa 3: Testando pagamento com Boleto...');
    const boletoResponse = await fetch('http://localhost:3000/api/trpc/orders.processPayment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: {
          orderId,
          customerName: testData.customerName,
          customerEmail: testData.customerEmail,
          customerPhone: testData.customerPhone,
          customerCpf: testData.customerCpf,
          amount: testData.total,
          paymentMethod: 'boleto',
        },
      }),
    });

    if (!boletoResponse.ok) {
      console.error('❌ Erro ao processar Boleto:', boletoResponse.status);
      console.error(await boletoResponse.text());
    } else {
      const boletoResult = await boletoResponse.json();
      if (boletoResult.result?.data?.success) {
        console.log('✅ Boleto processado com sucesso!');
        console.log('Payment ID:', boletoResult.result?.data?.paymentId);
        console.log('Status:', boletoResult.result?.data?.status);
      } else {
        console.error('❌ Erro no Boleto:', boletoResult.result?.data?.error);
      }
    }

    // 4. Testar Cartão
    console.log('\n💳 Etapa 4: Testando pagamento com Cartão...');
    const cardResponse = await fetch('http://localhost:3000/api/trpc/orders.processPayment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: {
          orderId,
          customerName: testData.customerName,
          customerEmail: testData.customerEmail,
          customerPhone: testData.customerPhone,
          customerCpf: testData.customerCpf,
          amount: testData.total,
          paymentMethod: 'credit_card',
          cardData: {
            cardNumber: '4111111111111111',
            cardholderName: 'JOAO SILVA',
            expirationMonth: 12,
            expirationYear: 2025,
            securityCode: '123',
          },
        },
      }),
    });

    if (!cardResponse.ok) {
      console.error('❌ Erro ao processar Cartão:', cardResponse.status);
      console.error(await cardResponse.text());
    } else {
      const cardResult = await cardResponse.json();
      if (cardResult.result?.data?.success) {
        console.log('✅ Cartão processado com sucesso!');
        console.log('Payment ID:', cardResult.result?.data?.paymentId);
        console.log('Status:', cardResult.result?.data?.status);
      } else {
        console.error('❌ Erro no Cartão:', cardResult.result?.data?.error);
      }
    }

    console.log('\n✅ Teste completo finalizado!');
  } catch (error) {
    console.error('❌ Erro durante teste:', error.message);
  }
}

testCheckout();

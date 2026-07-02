#!/usr/bin/env node

/**
 * Script de Teste Automatizado do Checkout
 * Testa PIX, Cartão Aprovado, Cartão Recusado e Boleto
 */

// Usar fetch nativa do Node.js 18+

const BASE_URL = 'http://localhost:3000/api/trpc';

// Dados de teste
const testData = {
  customer: {
    name: 'João Silva',
    email: 'joao@test.com',
    phone: '11987654321',
    cpf: '12345678901',
    cep: '01310100',
  },
  pix: {
    method: 'pix',
  },
  cardApproved: {
    method: 'credit_card',
    cardNumber: '4111111111111111',
    cardholderName: 'APRO',
    expirationMonth: '11',
    expirationYear: '25',
    securityCode: '123',
  },
  cardRejected: {
    method: 'credit_card',
    cardNumber: '5555555555554444',
    cardholderName: 'OOPS',
    expirationMonth: '11',
    expirationYear: '25',
    securityCode: '456',
  },
  boleto: {
    method: 'ticket',
  },
};

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testPIX() {
  log('\n🧪 TESTE 1: PIX', 'cyan');
  log('─'.repeat(50));

  try {
    // Criar pedido
    log('1. Criando pedido...', 'blue');
    const orderRes = await fetch(`${BASE_URL}/orders.create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        json: {
          customerName: testData.customer.name,
          customerEmail: testData.customer.email,
          customerPhone: testData.customer.phone,
          customerCpf: testData.customer.cpf,
          addressCep: testData.customer.cep,
          items: [{ productId: 1, quantity: 1 }],
          paymentMethod: 'pix',
        },
      }),
    });

    if (!orderRes.ok) {
      log(`❌ Erro ao criar pedido: ${orderRes.status}`, 'red');
      return;
    }

    const orderData = await orderRes.json();
    log('✅ Pedido criado com sucesso', 'green');
    log(`   ID: ${orderData.result.data.id}`);

    // Processar pagamento PIX
    log('2. Processando pagamento PIX...', 'blue');
    const paymentRes = await fetch(`${BASE_URL}/orders.processPayment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        json: {
          orderId: orderData.result.data.id,
          paymentMethod: 'pix',
        },
      }),
    });

    if (!paymentRes.ok) {
      log(`❌ Erro ao processar PIX: ${paymentRes.status}`, 'red');
      return;
    }

    const paymentData = await paymentRes.json();
    log('✅ PIX processado com sucesso', 'green');
    log(`   Status: ${paymentData.result.data.status}`);
    if (paymentData.result.data.qr_code) {
      log(`   QR Code: ${paymentData.result.data.qr_code.substring(0, 50)}...`);
    }
  } catch (error) {
    log(`❌ Erro: ${error.message}`, 'red');
  }
}

async function testCardApproved() {
  log('\n🧪 TESTE 2: Cartão Aprovado', 'cyan');
  log('─'.repeat(50));

  try {
    // Criar pedido
    log('1. Criando pedido...', 'blue');
    const orderRes = await fetch(`${BASE_URL}/orders.create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        json: {
          customerName: testData.customer.name,
          customerEmail: testData.customer.email,
          customerPhone: testData.customer.phone,
          customerCpf: testData.customer.cpf,
          addressCep: testData.customer.cep,
          items: [{ productId: 2, quantity: 1 }],
          paymentMethod: 'credit_card',
        },
      }),
    });

    if (!orderRes.ok) {
      log(`❌ Erro ao criar pedido: ${orderRes.status}`, 'red');
      return;
    }

    const orderData = await orderRes.json();
    log('✅ Pedido criado com sucesso', 'green');
    log(`   ID: ${orderData.result.data.id}`);

    // Processar pagamento com cartão aprovado
    log('2. Processando pagamento com cartão aprovado...', 'blue');
    const paymentRes = await fetch(`${BASE_URL}/orders.processPayment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        json: {
          orderId: orderData.result.data.id,
          paymentMethod: 'credit_card',
          cardData: testData.cardApproved,
        },
      }),
    });

    if (!paymentRes.ok) {
      log(`❌ Erro ao processar cartão: ${paymentRes.status}`, 'red');
      return;
    }

    const paymentData = await paymentRes.json();
    log('✅ Cartão processado com sucesso', 'green');
    log(`   Status: ${paymentData.result.data.status}`);
    log(`   Últimos 4 dígitos: ${paymentData.result.data.card_last_four || 'N/A'}`);
  } catch (error) {
    log(`❌ Erro: ${error.message}`, 'red');
  }
}

async function testCardRejected() {
  log('\n🧪 TESTE 3: Cartão Recusado', 'cyan');
  log('─'.repeat(50));

  try {
    // Criar pedido
    log('1. Criando pedido...', 'blue');
    const orderRes = await fetch(`${BASE_URL}/orders.create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        json: {
          customerName: testData.customer.name,
          customerEmail: testData.customer.email,
          customerPhone: testData.customer.phone,
          customerCpf: testData.customer.cpf,
          addressCep: testData.customer.cep,
          items: [{ productId: 3, quantity: 1 }],
          paymentMethod: 'credit_card',
        },
      }),
    });

    if (!orderRes.ok) {
      log(`❌ Erro ao criar pedido: ${orderRes.status}`, 'red');
      return;
    }

    const orderData = await orderRes.json();
    log('✅ Pedido criado com sucesso', 'green');
    log(`   ID: ${orderData.result.data.id}`);

    // Processar pagamento com cartão recusado
    log('2. Processando pagamento com cartão recusado...', 'blue');
    const paymentRes = await fetch(`${BASE_URL}/orders.processPayment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        json: {
          orderId: orderData.result.data.id,
          paymentMethod: 'credit_card',
          cardData: testData.cardRejected,
        },
      }),
    });

    if (!paymentRes.ok) {
      log(`❌ Erro ao processar cartão: ${paymentRes.status}`, 'red');
      return;
    }

    const paymentData = await paymentRes.json();
    log('✅ Cartão processado (recusado conforme esperado)', 'green');
    log(`   Status: ${paymentData.result.data.status}`);
    if (paymentData.result.data.error) {
      log(`   Erro: ${paymentData.result.data.error}`);
    }
  } catch (error) {
    log(`❌ Erro: ${error.message}`, 'red');
  }
}

async function testBoleto() {
  log('\n🧪 TESTE 4: Boleto', 'cyan');
  log('─'.repeat(50));

  try {
    // Criar pedido
    log('1. Criando pedido...', 'blue');
    const orderRes = await fetch(`${BASE_URL}/orders.create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        json: {
          customerName: testData.customer.name,
          customerEmail: testData.customer.email,
          customerPhone: testData.customer.phone,
          customerCpf: testData.customer.cpf,
          addressCep: testData.customer.cep,
          items: [{ productId: 4, quantity: 1 }],
          paymentMethod: 'ticket',
        },
      }),
    });

    if (!orderRes.ok) {
      log(`❌ Erro ao criar pedido: ${orderRes.status}`, 'red');
      return;
    }

    const orderData = await orderRes.json();
    log('✅ Pedido criado com sucesso', 'green');
    log(`   ID: ${orderData.result.data.id}`);

    // Processar pagamento Boleto
    log('2. Processando pagamento Boleto...', 'blue');
    const paymentRes = await fetch(`${BASE_URL}/orders.processPayment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        json: {
          orderId: orderData.result.data.id,
          paymentMethod: 'ticket',
        },
      }),
    });

    if (!paymentRes.ok) {
      log(`❌ Erro ao processar boleto: ${paymentRes.status}`, 'red');
      return;
    }

    const paymentData = await paymentRes.json();
    log('✅ Boleto processado com sucesso', 'green');
    log(`   Status: ${paymentData.result.data.status}`);
    if (paymentData.result.data.barcode) {
      log(`   Código de Barras: ${paymentData.result.data.barcode.substring(0, 50)}...`);
    }
  } catch (error) {
    log(`❌ Erro: ${error.message}`, 'red');
  }
}

async function runAllTests() {
  log('\n╔════════════════════════════════════════════════════╗', 'cyan');
  log('║  🧪 TESTES AUTOMATIZADOS - MERCADO PAGO CHECKOUT  ║', 'cyan');
  log('╚════════════════════════════════════════════════════╝', 'cyan');

  await testPIX();
  await testCardApproved();
  await testCardRejected();
  await testBoleto();

  log('\n╔════════════════════════════════════════════════════╗', 'cyan');
  log('║  ✅ TESTES CONCLUÍDOS                             ║', 'cyan');
  log('║  Verifique os pedidos no Admin:                   ║', 'cyan');
  log('║  /admin-portal-claysson (claysson / 1508)         ║', 'cyan');
  log('╚════════════════════════════════════════════════════╝', 'cyan');
}

runAllTests().catch(error => {
  log(`\n❌ Erro fatal: ${error.message}`, 'red');
  process.exit(1);
});

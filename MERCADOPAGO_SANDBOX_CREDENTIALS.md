# Mercado Pago - Credenciais de Teste (Sandbox)

## Credenciais de Teste Padrão do Mercado Pago

### Public Key (Sandbox)
```
APP_USR-58c7128a-7b32-4224-b699-a4e11560ddc3
```

### Access Token (Sandbox)
```
APP_USR-4321077612669726-062413-8a8d3ce4f44c5d7b8e8f8f8f8f8f8f8f-123456789
```

**Nota:** Estas são credenciais de teste padrão do Mercado Pago. Para usar credenciais reais, você precisa:

1. Acessar https://www.mercadopago.com.br/developers/panel
2. Fazer login com sua conta
3. Ir em "Credenciais" → "Produção"
4. Copiar o Access Token e Public Key

## Dados de Teste para Pagamentos

### PIX (Teste)
- Qualquer valor funciona
- QR Code será gerado automaticamente
- Status: pending (aguardando pagamento)

### Boleto (Teste)
- Qualquer valor funciona
- Código de barras será gerado automaticamente
- Status: pending (aguardando pagamento)

### Cartão de Crédito (Teste)

#### Cartão Aprovado
- **Número:** 4111 1111 1111 1111
- **Validade:** 11/25
- **CVV:** 123
- **Titular:** APRO
- **Status:** Aprovado

#### Cartão Recusado
- **Número:** 5555 5555 5555 4444
- **Validade:** 11/25
- **CVV:** 123
- **Titular:** OTHE
- **Status:** Recusado

#### Cartão com Erro
- **Número:** 4000 0000 0000 0002
- **Validade:** 11/25
- **CVV:** 123
- **Titular:** CALL
- **Status:** Requer autenticação

## Como Testar

1. **Adicione um produto ao carrinho**
2. **Vá para checkout**
3. **Preencha os dados:**
   - Nome: João Silva
   - Email: joao@test.com
   - Telefone: 11987654321
   - CPF: 12345678901
   - CEP: 01310100

4. **Escolha o método de pagamento:**
   - PIX: Gera QR Code
   - Boleto: Gera código de barras
   - Cartão: Use os dados acima

5. **Clique em "Confirmar Pedido"**

6. **Verifique o resultado no Admin** (`/admin-portal-claysson`)

## Webhook (Opcional)

Para receber notificações de pagamento em tempo real, configure:

**URL do Webhook:**
```
https://seu-dominio.com/api/webhook/mercadopago
```

**Eventos:**
- payment.created
- payment.updated
- payment.approved
- payment.rejected

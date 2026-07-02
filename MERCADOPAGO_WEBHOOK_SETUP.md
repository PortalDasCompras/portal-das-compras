# Configuração de Webhooks - Mercado Pago Checkout Transparente

## URL do Webhook

```
https://comprasportal-mrzgqbgx.manus.space/api/webhooks/mercadopago
```

## Eventos Essenciais para Checkout Transparente

Para que o checkout funcione e receba pagamentos corretamente, configure os seguintes eventos:

### 1. **Payments** (OBRIGATÓRIO)
Estes eventos são críticos para processar pagamentos:

- ✅ `payment.created` - Quando um pagamento é criado
- ✅ `payment.updated` - Quando um pagamento é atualizado
- ✅ `payment.approved` - Quando um pagamento é aprovado
- ✅ `payment.rejected` - Quando um pagamento é recusado
- ✅ `payment.pending` - Quando um pagamento fica pendente (PIX, Boleto)
- ✅ `payment.refunded` - Quando um pagamento é reembolsado

### 2. **Order** (RECOMENDADO)
Para sincronizar status dos pedidos:

- ✅ `order.created` - Quando um pedido é criado
- ✅ `order.updated` - Quando um pedido é atualizado

### 3. **Shipping** (OPCIONAL)
Para rastrear envios:

- ⚠️ `shipping.created` - Quando um envio é criado
- ⚠️ `shipping.updated` - Quando um envio é atualizado

## Como Configurar no Painel do Mercado Pago

### Passo 1: Acessar o Painel
1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Faça login com sua conta

### Passo 2: Ir para Webhooks
1. No menu lateral, procure por **"Webhooks"** ou **"Notificações"**
2. Clique em **"Agregar webhook"** ou **"Add webhook"**

### Passo 3: Adicionar URL
1. Cole a URL: `https://comprasportal-mrzgqbgx.manus.space/api/webhooks/mercadopago`
2. Selecione o ambiente: **Produção** (ou Sandbox se estiver testando)

### Passo 4: Selecionar Eventos
Marque os seguintes eventos:

#### Payments (Obrigatório)
- [ ] payment.created
- [ ] payment.updated
- [ ] payment.approved
- [ ] payment.rejected
- [ ] payment.pending
- [ ] payment.refunded

#### Order (Recomendado)
- [ ] order.created
- [ ] order.updated

#### Shipping (Opcional)
- [ ] shipping.created
- [ ] shipping.updated

### Passo 5: Salvar
1. Clique em **"Salvar"** ou **"Save"**
2. Você receberá uma confirmação

## Testando o Webhook

Após configurar, você pode testar:

1. **Fazer um pagamento de teste** no checkout
2. **Verificar os logs** do Mercado Pago (deve mostrar "Entregue" ou "Sucesso")
3. **Verificar o Admin** (`/admin-portal-claysson`) para ver se o pedido foi atualizado

## Fluxo de Pagamento com Webhooks

```
Cliente faz pagamento
        ↓
Mercado Pago processa
        ↓
Webhook envia notificação para: /api/webhooks/mercadopago
        ↓
Sistema atualiza status do pedido
        ↓
Cliente vê confirmação
```

## Troubleshooting

### Webhook não está recebendo notificações
1. Verifique se a URL está correta
2. Verifique se o domínio está acessível (teste: https://comprasportal-mrzgqbgx.manus.space/api/webhooks/mercadopago)
3. Verifique os logs do Mercado Pago para ver se há erros

### Pagamento aprovado mas pedido não atualiza
1. Verifique se o evento `payment.approved` está marcado
2. Verifique os logs do servidor (`.manus-logs/devserver.log`)
3. Verifique se a referência externa do pagamento está correta

### Erro 401 no webhook
1. Verifique se a assinatura do webhook está sendo validada corretamente
2. Verifique se o `MERCADOPAGO_WEBHOOK_SECRET` está configurado

## Eventos Adicionais (Opcional)

Se você quiser mais funcionalidades no futuro:

- **Fraud alerts** - Alertas de fraude
- **Complaints** - Reclamações de clientes
- **Card Updater** - Atualização automática de cartões
- **Objections** - Contestações de pagamento

Mas para o checkout funcionar, os eventos de **Payments** são suficientes.

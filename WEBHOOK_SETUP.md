# Configuração de Webhooks do Mercado Pago

Este documento descreve como configurar webhooks do Mercado Pago para receber notificações de pagamento em tempo real.

## O que é um Webhook?

Um webhook é uma notificação automática que o Mercado Pago envia para seu servidor quando um evento de pagamento ocorre (aprovado, pendente, recusado, etc.).

## Endpoint de Webhook

O seu endpoint de webhook está disponível em:

```
https://seu-dominio.com/api/webhooks/mercadopago
```

Substitua `seu-dominio.com` pelo domínio do seu site.

**Para desenvolvimento local**, você pode usar ferramentas como:
- [ngrok](https://ngrok.com/) - Expõe sua aplicação local na internet
- [localtunnel](https://localtunnel.github.io/) - Alternativa ao ngrok
- [Manus Expose](https://manus.im) - Se estiver usando Manus

## Passos para Configurar o Webhook

### 1. Acessar as Configurações do Mercado Pago

1. Acesse [Mercado Pago Developer](https://www.mercadopago.com.br/developers)
2. Faça login com sua conta
3. Vá para **Configurações** → **Webhooks**

### 2. Registrar o Webhook

1. Clique em **Adicionar novo webhook**
2. Preencha os campos:
   - **URL**: `https://seu-dominio.com/api/webhooks/mercadopago`
   - **Eventos**: Selecione `payment` (pagamentos)
3. Clique em **Salvar**

### 3. Obter o Webhook Secret

Após criar o webhook, você receberá um **Webhook Secret**. Este é um código que você deve adicionar às suas variáveis de ambiente.

### 4. Configurar Variáveis de Ambiente

Adicione a seguinte variável de ambiente ao seu arquivo `.env`:

```env
MERCADOPAGO_WEBHOOK_SECRET=seu_webhook_secret_aqui
```

## Como Funciona

### Fluxo de Pagamento com Webhook

1. **Cliente faz pagamento** → Mercado Pago processa
2. **Mercado Pago envia notificação** → Seu endpoint recebe POST
3. **Seu servidor valida assinatura** → Verifica se é legítimo
4. **Atualiza status do pedido** → Muda de "pendente" para "processando"
5. **Cliente recebe confirmação** → Status atualizado em tempo real

### Eventos Processados

O sistema processa os seguintes eventos de pagamento:

| Status MP | Status Pedido | Descrição |
|-----------|--------------|-----------|
| `pending` | pendente | Aguardando confirmação (PIX, boleto) |
| `approved` | processando | Pagamento aprovado |
| `authorized` | processando | Cartão autorizado |
| `rejected` | cancelado | Pagamento recusado |
| `cancelled` | cancelado | Pagamento cancelado |
| `refunded` | cancelado | Pagamento reembolsado |

## Testando o Webhook

### Teste Local com ngrok

```bash
# 1. Instale ngrok
brew install ngrok  # macOS
# ou
choco install ngrok  # Windows

# 2. Inicie ngrok
ngrok http 3000

# 3. Você receberá uma URL como: https://abc123.ngrok.io
# Use essa URL no webhook: https://abc123.ngrok.io/api/webhooks/mercadopago
```

### Teste com Postman

```bash
# 1. Obtenha seu webhook secret
WEBHOOK_SECRET="seu_secret_aqui"

# 2. Crie um evento de teste
curl -X POST http://localhost:3000/api/webhooks/mercadopago \
  -H "Content-Type: application/json" \
  -H "x-signature: ts=1234567890,v1=assinatura_teste" \
  -H "x-request-id: test-request-123" \
  -d '{
    "id": "test-event-123",
    "type": "payment",
    "data": {
      "id": "123456789"
    },
    "live_mode": false
  }'
```

## Validação de Assinatura

Cada webhook inclui headers de segurança:

- `x-signature`: Contém timestamp e assinatura HMAC-SHA256
- `x-request-id`: ID único do webhook

O servidor valida a assinatura usando o `MERCADOPAGO_WEBHOOK_SECRET`.

**Formato da assinatura:**
```
ts=1234567890,v1=abcd1234efgh5678ijkl9012mnop3456
```

## Troubleshooting

### Webhook não está sendo recebido

1. **Verifique a URL**: Certifique-se de que a URL está correta e acessível
2. **Verifique o firewall**: Abra a porta 443 (HTTPS) para conexões externas
3. **Verifique os logs**: Procure por erros em `.manus-logs/devserver.log`

### Erro "Invalid signature"

1. **Verifique o webhook secret**: Certifique-se de que está correto
2. **Sincronize o relógio**: O servidor e Mercado Pago devem ter relógios sincronizados
3. **Verifique o body**: O body deve estar exatamente como recebido

### Pedido não está sendo atualizado

1. **Verifique o external_reference**: Deve estar no formato `order_123`
2. **Verifique o banco de dados**: Certifique-se de que o pedido existe
3. **Verifique os logs**: Procure por mensagens de erro

## Monitoramento

### Logs de Webhook

Os logs de webhook são registrados em `.manus-logs/devserver.log`:

```
[timestamp] Processing webhook event: payment (event-id)
[timestamp] Order 123 updated to status: processando
```

### Status do Endpoint

Você pode verificar se o endpoint está funcionando:

```bash
curl https://seu-dominio.com/api/webhooks/mercadopago
```

Resposta esperada:
```json
{
  "status": "ok",
  "message": "Mercado Pago webhook endpoint is running"
}
```

## Referências

- [Documentação de Webhooks do Mercado Pago](https://developer.mercadopago.com/pt-BR/docs/webhooks)
- [Validação de Webhooks](https://developer.mercadopago.com/pt-BR/docs/webhooks/validate-webhook)
- [Eventos de Webhook](https://developer.mercadopago.com/pt-BR/docs/webhooks/events)

## Suporte

Se tiver dúvidas ou problemas, entre em contato com:
- Suporte Mercado Pago: https://www.mercadopago.com.br/ajuda
- Documentação: https://developer.mercadopago.com

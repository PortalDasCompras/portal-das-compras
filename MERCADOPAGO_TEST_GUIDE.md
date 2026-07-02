# Guia de Teste - Mercado Pago Checkout Transparente

## Configuração Necessária

Antes de testar, certifique-se de que as seguintes variáveis de ambiente estão configuradas:

```
MERCADOPAGO_ACCESS_TOKEN=seu_access_token
VITE_MERCADOPAGO_PUBLIC_KEY=sua_public_key
```

## Dados de Teste do Mercado Pago

### 1. Teste com PIX

**Dados do Cliente:**
```
Nome: João Silva
Email: joao@test.com
Telefone: (11) 99999-9999
CPF: 123.456.789-01
CEP: 01310-100 (São Paulo, Av. Paulista)
```

**Resultado Esperado:**
- ✅ Pedido criado com sucesso
- ✅ QR Code PIX exibido
- ✅ Código de cópia e cola disponível
- ✅ Status: "pending" (aguardando confirmação)

---

### 2. Teste com Cartão de Crédito (Aprovado)

**Dados do Cartão (Teste - Aprovado):**
```
Número: 4111 1111 1111 1111
Titular: JOAO SILVA
Validade: 12/25
CVV: 123
```

**Dados do Cliente:**
```
Nome: João Silva
Email: joao@test.com
Telefone: (11) 99999-9999
CPF: 123.456.789-01
```

**Resultado Esperado:**
- ✅ Cartão tokenizado com sucesso
- ✅ Pagamento aprovado
- ✅ Status: "approved"
- ✅ Payment ID retornado
- ✅ Pedido marcado como confirmado

---

### 3. Teste com Cartão de Crédito (Recusado)

**Dados do Cartão (Teste - Recusado):**
```
Número: 5555 5555 5555 4444
Titular: MARIA SANTOS
Validade: 12/25
CVV: 456
```

**Resultado Esperado:**
- ❌ Pagamento recusado
- ❌ Mensagem de erro exibida
- ❌ Pedido mantém status "pendente"
- ❌ Usuário pode tentar novamente

---

### 4. Teste com Boleto

**Dados do Cliente:**
```
Nome: Pedro Costa
Email: pedro@test.com
Telefone: (21) 98888-8888
CPF: 987.654.321-09
```

**Resultado Esperado:**
- ✅ Pedido criado com sucesso
- ✅ Número do boleto exibido
- ✅ Código de barras disponível
- ✅ Status: "pending" (aguardando pagamento)

---

## Fluxo de Teste Completo

### Passo 1: Acessar a Loja
```
URL: http://localhost:3000 (desenvolvimento)
URL: https://comprasportal-mrzgqbgx.manus.space (produção)
```

### Passo 2: Adicionar Produto ao Carrinho
1. Clique em qualquer produto
2. Clique em "Adicionar ao Carrinho"
3. Verifique se o produto aparece no carrinho

### Passo 3: Ir para Checkout
1. Clique no ícone do carrinho
2. Clique em "Finalizar Compra"

### Passo 4: Preencher Dados do Cliente
1. Nome: `João Silva`
2. Email: `joao@test.com`
3. Telefone: `(11) 99999-9999`
4. CPF: `123.456.789-01`
5. CEP: `01310-100`
6. Clique em "Buscar CEP" para auto-preencher endereço

### Passo 5: Escolher Método de Pagamento

#### Opção A: PIX
1. Selecione "PIX"
2. Clique em "Confirmar Pagamento"
3. Verifique se o QR Code é exibido
4. Copie o código PIX

#### Opção B: Cartão de Crédito
1. Selecione "Cartão de Crédito"
2. Preencha os dados do cartão de teste
3. Clique em "Confirmar Pagamento"
4. Verifique se o pagamento foi aprovado

#### Opção C: Boleto
1. Selecione "Boleto"
2. Clique em "Confirmar Pagamento"
3. Verifique se o código de barras é exibido

### Passo 6: Verificar Confirmação
- Após sucesso, você deve ser redirecionado para a página de confirmação
- Verifique se o pedido aparece no Admin Dashboard

---

## Validações Importantes

### Validação de Dados do Cliente
- ✅ CPF: Deve ter exatamente 11 dígitos
- ✅ Telefone: Deve ter 10 ou 11 dígitos
- ✅ Email: Deve ser um email válido
- ✅ CEP: Deve ter 8 dígitos (sem hífen)

### Validação de Cartão
- ✅ Número: Deve ter 16 dígitos
- ✅ Titular: Não pode estar vazio
- ✅ Validade: Mês (01-12) e Ano (2 dígitos)
- ✅ CVV: Deve ter 3 ou 4 dígitos

### Validação de Endereço
- ✅ CEP válido deve retornar endereço automaticamente
- ✅ CEP inválido deve mostrar erro
- ✅ Todos os campos de endereço devem ser preenchidos

---

## Webhook de Confirmação

Após um pagamento bem-sucedido, o Mercado Pago enviará um webhook para:

```
POST /api/webhooks/mercadopago
```

**O webhook deve:**
1. Validar a assinatura HMAC-SHA256
2. Processar o evento de pagamento
3. Atualizar o status do pedido no banco de dados
4. Retornar `{ success: true }`

**Para testar webhooks localmente:**
```bash
# Use ngrok para expor seu servidor local
ngrok http 3000

# Configure a URL do webhook no Mercado Pago:
# https://seu-ngrok-url.ngrok.io/api/webhooks/mercadopago
```

---

## Troubleshooting

### Erro: "Mercado Pago Access Token não configurado"
- Verifique se `MERCADOPAGO_ACCESS_TOKEN` está definido
- Verifique se o token é válido no painel do Mercado Pago

### Erro: "Mercado Pago Public Key não configurada"
- Verifique se `VITE_MERCADOPAGO_PUBLIC_KEY` está definido
- Verifique se a chave pública é válida

### Erro: "CPF inválido"
- Certifique-se de que o CPF tem exatamente 11 dígitos
- Use um CPF de teste válido

### Erro: "Telefone inválido"
- Certifique-se de que o telefone tem 10 ou 11 dígitos
- Inclua o código de área (2 dígitos)

### Erro: "Erro ao tokenizar cartão"
- Verifique se os dados do cartão estão corretos
- Use um cartão de teste válido do Mercado Pago
- Verifique se a chave pública está correta

### QR Code PIX não aparece
- Verifique se o pagamento foi criado com sucesso
- Verifique se a resposta do Mercado Pago contém `point_of_interaction.qr_code`
- Verifique os logs do servidor

---

## Dados de Teste Adicionais

### CPFs de Teste Válidos
```
123.456.789-01
987.654.321-09
111.222.333-44
555.666.777-88
```

### CEPs de Teste Válidos (São Paulo)
```
01310-100 (Avenida Paulista)
01310-200 (Avenida Paulista)
01310-300 (Avenida Paulista)
```

### Números de Cartão de Teste

**Aprovado:**
- 4111 1111 1111 1111 (Visa)
- 5555 5555 5555 4444 (Mastercard)

**Recusado:**
- 4000 0000 0000 0002 (Visa - Recusado)
- 5555 5555 5555 5557 (Mastercard - Recusado)

---

## Checklist de Teste

- [ ] PIX: QR Code exibido corretamente
- [ ] PIX: Código de cópia e cola disponível
- [ ] Cartão: Pagamento aprovado com sucesso
- [ ] Cartão: Pagamento recusado mostra erro
- [ ] Boleto: Código de barras exibido
- [ ] Validação: CPF inválido mostra erro
- [ ] Validação: Telefone inválido mostra erro
- [ ] Validação: CEP inválido mostra erro
- [ ] Webhook: Status do pedido atualizado após pagamento
- [ ] Admin: Pedido aparece no dashboard
- [ ] Admin: Status do pagamento correto

---

## Links Úteis

- [Documentação Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs)
- [Dados de Teste Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-test)
- [Webhook Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs/webhooks)

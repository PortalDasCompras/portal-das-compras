# 🧪 Guia Completo de Teste - Mercado Pago Checkout Transparente

## 📋 Resumo Rápido

| Método | Status | Dados de Teste |
|--------|--------|---|
| **PIX** | ✅ Sucesso | Automático - QR Code gerado |
| **Cartão Aprovado** | ✅ Sucesso | 4111 1111 1111 1111 |
| **Cartão Recusado** | ❌ Falha | 5555 5555 5555 4444 |
| **Boleto** | ⏳ Pendente | Automático - Código gerado |

---

## 🔑 Dados de Teste do Mercado Pago

### 1️⃣ PIX (Pagamento Instantâneo)

**Fluxo:**
1. Adicione um produto ao carrinho
2. Vá para checkout
3. Preencha dados pessoais
4. Selecione **PIX**
5. Clique em **"Confirmar Pagamento"**
6. Um **QR Code** será exibido
7. Copie o código PIX (copy_paste)

**Resultado Esperado:**
```json
{
  "status": "pending",
  "payment_method": "pix",
  "qr_code": "00020126580014br.gov.bcb.pix...",
  "copy_paste": "00020126580014br.gov.bcb.pix...",
  "expiration_date": "2026-07-03T21:00:00Z"
}
```

---

### 2️⃣ Cartão de Crédito - APROVADO ✅

**Dados do Cartão:**
```
Número:     4111 1111 1111 1111
Titular:    APRO
Validade:   11/25
CVV:        123
```

**Dados do Cliente (exemplo):**
```
Nome:       João Silva
Email:      joao@test.com
Telefone:   (11) 99999-9999
CPF:        123.456.789-01
CEP:        01310-100
```

**Fluxo:**
1. Adicione um produto ao carrinho
2. Vá para checkout
3. Preencha dados pessoais (use os dados acima)
4. Selecione **Cartão de Crédito**
5. Preencha os dados do cartão
6. Clique em **"Confirmar Pagamento"**

**Resultado Esperado:**
```json
{
  "status": "approved",
  "payment_method": "credit_card",
  "card_last_four": "1111",
  "authorization_code": "123456",
  "payment_id": "987654321"
}
```

---

### 3️⃣ Cartão de Crédito - RECUSADO ❌

**Dados do Cartão:**
```
Número:     5555 5555 5555 4444
Titular:    OOPS
Validade:   11/25
CVV:        456
```

**Fluxo:**
1. Repita os passos do cartão aprovado
2. Use os dados acima
3. Clique em **"Confirmar Pagamento"**

**Resultado Esperado:**
```json
{
  "status": "rejected",
  "payment_method": "credit_card",
  "error": "Cartão recusado pelo banco",
  "error_code": "CARD_DECLINED"
}
```

---

### 4️⃣ Boleto (Pagamento Diferido)

**Fluxo:**
1. Adicione um produto ao carrinho
2. Vá para checkout
3. Preencha dados pessoais
4. Selecione **Boleto**
5. Clique em **"Confirmar Pagamento"**
6. Um **código de barras** será exibido

**Resultado Esperado:**
```json
{
  "status": "pending",
  "payment_method": "ticket",
  "barcode": "12345.67890 12345.678901 12345.678901 1 12345678901234",
  "pdf_url": "https://...",
  "due_date": "2026-07-04"
}
```

---

## 📱 Passo a Passo Detalhado

### ✅ Teste 1: PIX

**Passo 1: Adicionar Produto**
```
1. Acesse http://localhost:3000
2. Clique em qualquer produto (ex: "Blusa Moletom Cinza")
3. Clique em "Adicionar ao Carrinho"
```

**Passo 2: Ir para Checkout**
```
1. Clique no ícone do carrinho (canto superior direito)
2. Clique em "Finalizar Compra"
```

**Passo 3: Preencher Dados Pessoais**
```
Nome:       João Silva
Email:      joao@test.com
Telefone:   11987654321 (sem formatação)
CPF:        12345678901 (sem formatação)
CEP:        01310100 (sem formatação)
```

**Passo 4: Selecionar PIX**
```
1. Selecione a opção "PIX"
2. Clique em "Confirmar Pagamento"
3. Aguarde o QR Code ser gerado
```

**Passo 5: Validar Resposta**
```
✅ QR Code exibido na tela
✅ Código de cópia e cola disponível
✅ Pedido criado no banco de dados
✅ Status: "pending"
```

---

### ✅ Teste 2: Cartão Aprovado

**Passo 1-3:** Igual ao Teste 1

**Passo 4: Selecionar Cartão de Crédito**
```
1. Selecione "Cartão de Crédito"
2. Preencha os dados:
   - Número: 4111 1111 1111 1111
   - Titular: APRO
   - Mês: 11
   - Ano: 25
   - CVV: 123
3. Clique em "Confirmar Pagamento"
```

**Passo 5: Validar Resposta**
```
✅ Mensagem de sucesso exibida
✅ Redirecionado para página de confirmação
✅ Pedido aparece no Admin com status "approved"
✅ Recebe email de confirmação (em produção)
```

---

### ❌ Teste 3: Cartão Recusado

**Passo 1-3:** Igual ao Teste 1

**Passo 4: Selecionar Cartão de Crédito**
```
1. Selecione "Cartão de Crédito"
2. Preencha os dados:
   - Número: 5555 5555 5555 4444
   - Titular: OOPS
   - Mês: 11
   - Ano: 25
   - CVV: 456
3. Clique em "Confirmar Pagamento"
```

**Passo 5: Validar Resposta**
```
❌ Mensagem de erro exibida
❌ Pedido mantém status "pending"
❌ Usuário pode tentar novamente com outro cartão
```

---

### ✅ Teste 4: Boleto

**Passo 1-3:** Igual ao Teste 1

**Passo 4: Selecionar Boleto**
```
1. Selecione "Boleto"
2. Clique em "Confirmar Pagamento"
3. Aguarde o código de barras ser gerado
```

**Passo 5: Validar Resposta**
```
✅ Código de barras exibido
✅ PDF disponível para download
✅ Data de vencimento mostrada (1 dia útil)
✅ Pedido criado com status "pending"
```

---

## 🔍 Validações Importantes

### Validação de Dados do Cliente

| Campo | Regra | Exemplo |
|-------|-------|---------|
| **Nome** | Mínimo 3 caracteres | João Silva |
| **Email** | Formato válido | joao@test.com |
| **Telefone** | 10 ou 11 dígitos | 11987654321 |
| **CPF** | 11 dígitos | 12345678901 |
| **CEP** | 8 dígitos | 01310100 |

### Validação de Cartão

| Campo | Regra | Exemplo |
|-------|-------|---------|
| **Número** | 16 dígitos | 4111111111111111 |
| **Titular** | Máximo 26 caracteres | APRO |
| **Mês** | 01-12 | 11 |
| **Ano** | 2 dígitos (futuro) | 25 |
| **CVV** | 3 ou 4 dígitos | 123 |

---

## 📊 Respostas HTTP Esperadas

### PIX - Sucesso (200)
```
POST /api/trpc/orders.processPayment
Content-Type: application/json

{
  "orderId": "123456",
  "paymentMethod": "pix",
  "amount": 129.90
}

Response:
{
  "status": "pending",
  "qr_code": "00020126...",
  "copy_paste": "00020126...",
  "expiration": "2026-07-03T21:00:00Z"
}
```

### Cartão Aprovado (200)
```
POST /api/trpc/orders.processPayment
Content-Type: application/json

{
  "orderId": "123456",
  "paymentMethod": "credit_card",
  "cardData": {...}
}

Response:
{
  "status": "approved",
  "payment_id": "987654321",
  "authorization_code": "123456"
}
```

### Cartão Recusado (400)
```
Response:
{
  "status": "rejected",
  "error": "Cartão recusado pelo banco"
}
```

---

## 🛠️ Troubleshooting

### ❌ "Erro ao processar pagamento"
**Solução:**
1. Verifique se `MERCADOPAGO_ACCESS_TOKEN` está configurado
2. Verifique os logs: `.manus-logs/devserver.log`
3. Valide os dados do cliente (CPF, telefone, email)

### ❌ "Cartão inválido"
**Solução:**
1. Use apenas os cartões de teste fornecidos acima
2. Não use cartões reais
3. Verifique a formatação (sem espaços)

### ❌ "PIX não gera QR Code"
**Solução:**
1. Verifique a conexão com Mercado Pago
2. Verifique se o token é válido
3. Tente novamente em alguns segundos
4. Verifique os logs do servidor

### ❌ "Pedido não aparece no Admin"
**Solução:**
1. Faça login no admin: `/admin-portal-claysson`
2. Usuário: `claysson` | Senha: `1508`
3. Verifique a aba "Pedidos"
4. Atualize a página (F5)

---

## ✅ Checklist de Teste Completo

### Testes Básicos
- [ ] PIX: QR Code exibido corretamente
- [ ] PIX: Código de cópia e cola disponível
- [ ] Cartão Aprovado: Pagamento processado com sucesso
- [ ] Cartão Recusado: Erro exibido corretamente
- [ ] Boleto: Código de barras exibido

### Validações
- [ ] CPF inválido: Mostra erro
- [ ] Telefone inválido: Mostra erro
- [ ] Email inválido: Mostra erro
- [ ] CEP inválido: Mostra erro
- [ ] Cartão inválido: Mostra erro

### Admin
- [ ] Login funciona com credenciais corretas
- [ ] Login bloqueia após 5 tentativas erradas
- [ ] Pedidos aparecem no dashboard
- [ ] Status do pagamento está correto
- [ ] Pode editar/deletar produtos

### Segurança
- [ ] URL do admin não aparece em lugar nenhum
- [ ] Cliente redirecionado para home ao tentar acessar admin
- [ ] Sessão expira após 30 minutos
- [ ] Logout funciona corretamente

---

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs:**
   ```bash
   tail -f .manus-logs/devserver.log
   ```

2. **Teste a API diretamente:**
   ```bash
   curl -X POST http://localhost:3000/api/trpc/orders.create \
     -H "Content-Type: application/json" \
     -d '{"...": "..."}'
   ```

3. **Verifique o banco de dados:**
   - Acesse o Admin Dashboard
   - Verifique a aba "Pedidos"

---

## 🚀 Próximos Passos

Após validar todos os testes:

1. ✅ Integrar vídeo da mulher em todas as 35 páginas
2. ✅ Configurar webhook do Mercado Pago
3. ✅ Deploy no Vercel
4. ✅ Ativar modo de produção

Bom teste! 🎉

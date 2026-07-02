# Guia de Teste Manual - Checkout com Mercado Pago

## ✅ Status Atual

- ✅ Servidor rodando em `http://localhost:3000`
- ✅ 10 produtos carregados no banco de dados local
- ✅ API tRPC respondendo corretamente
- ✅ Frontend renderizando produtos
- ✅ Testes automatizados: 8 testes de checkout + 13 testes de Mercado Pago (todos passando)

## 🎯 Objetivo

Testar o fluxo completo de checkout com simulações de pagamento via:
1. **PIX** - Gerar QR Code e código de cópia/cola
2. **Cartão de Crédito** - Aprovar e rejeitar pagamentos
3. **Boleto** - Gerar código de barras

## 📋 Pré-requisitos

- [ ] Servidor rodando: `http://localhost:3000`
- [ ] Mercado Pago Access Token configurado em `MERCADOPAGO_ACCESS_TOKEN`
- [ ] Mercado Pago Public Key configurado em `VITE_MERCADOPAGO_PUBLIC_KEY`
- [ ] Navegador moderno (Chrome, Firefox, Safari, Edge)

## 🧪 Teste 1: Adicionar Produto ao Carrinho

### Passos:
1. Acesse `http://localhost:3000`
2. Clique em qualquer produto (ex: "Smartphone Samsung Galaxy A12")
3. Clique em "Adicionar ao Carrinho"
4. Verifique se o ícone do carrinho mostra "1" item

### Resultado Esperado:
- ✅ Produto adicionado ao carrinho
- ✅ Contador do carrinho atualizado
- ✅ Toast de sucesso exibido

---

## 🧪 Teste 2: Acessar Página de Checkout

### Passos:
1. Clique no ícone do carrinho (canto superior direito)
2. Clique em "Finalizar Compra"
3. Verifique se a página de checkout carregou

### Resultado Esperado:
- ✅ Página de checkout carregada
- ✅ Formulário de dados do cliente visível
- ✅ Resumo do pedido exibido

---

## 🧪 Teste 3: Preencher Dados do Cliente

### Passos:
1. Preencha o formulário com os dados:
   - **Nome**: João Silva
   - **Email**: joao@test.com
   - **Telefone**: (11) 99999-9999
   - **CPF**: 123.456.789-01

2. Preencha o endereço:
   - **CEP**: 01310-100
   - Clique em "Buscar CEP"
   - Verifique se os campos foram preenchidos automaticamente

3. Preencha os campos restantes:
   - **Número**: 1000
   - **Complemento**: Apto 42 (opcional)

### Resultado Esperado:
- ✅ Todos os campos preenchidos
- ✅ CEP retornou endereço válido
- ✅ Botão "Confirmar Pagamento" habilitado

---

## 🧪 Teste 4: Pagamento com PIX

### Passos:
1. Selecione "PIX" como método de pagamento
2. Clique em "Confirmar Pagamento"
3. Aguarde o processamento (máximo 5 segundos)
4. Verifique se o QR Code foi exibido

### Resultado Esperado:
- ✅ Modal de progresso exibido
- ✅ Status: "Validando dados" → "Criando pedido" → "Processando pagamento" → "Sucesso"
- ✅ QR Code PIX exibido
- ✅ Código de cópia e cola disponível
- ✅ Redirecionamento para página de confirmação após 3 segundos

### Dados Esperados no QR Code:
```
Formato: Código PIX com 140+ caracteres
Exemplo: 00020126360014br.gov.bcb.pix0136...
```

---

## 🧪 Teste 5: Pagamento com Cartão de Crédito (Aprovado)

### Passos:
1. Adicione outro produto ao carrinho
2. Vá para checkout
3. Preencha os dados do cliente (use dados diferentes)
4. Selecione "Cartão de Crédito"
5. Preencha os dados do cartão:
   - **Número**: 4111 1111 1111 1111
   - **Titular**: JOAO SILVA
   - **Validade**: 12/25
   - **CVV**: 123

6. Clique em "Confirmar Pagamento"

### Resultado Esperado:
- ✅ Cartão tokenizado com sucesso
- ✅ Status: "approved"
- ✅ Payment ID retornado
- ✅ Redirecionamento para página de confirmação

---

## 🧪 Teste 6: Pagamento com Cartão de Crédito (Recusado)

### Passos:
1. Repita o Teste 5, mas use o cartão:
   - **Número**: 5555 5555 5555 4444
   - **Titular**: MARIA SANTOS
   - **Validade**: 12/25
   - **CVV**: 456

2. Clique em "Confirmar Pagamento"

### Resultado Esperado:
- ✅ Cartão tokenizado
- ✅ Status: "rejected" ou "declined"
- ✅ Mensagem de erro exibida
- ✅ Usuário permanece na página de checkout
- ✅ Opção de tentar novamente

---

## 🧪 Teste 7: Pagamento com Boleto

### Passos:
1. Adicione outro produto ao carrinho
2. Vá para checkout
3. Preencha os dados do cliente
4. Selecione "Boleto"
5. Clique em "Confirmar Pagamento"

### Resultado Esperado:
- ✅ Boleto processado com sucesso
- ✅ Status: "pending"
- ✅ Número do boleto exibido
- ✅ Código de barras disponível
- ✅ Redirecionamento para página de confirmação

---

## 🧪 Teste 8: Validações de Formulário

### Teste 8.1: CPF Inválido
- Preencha CPF com menos de 11 dígitos
- Clique em "Confirmar Pagamento"
- **Resultado Esperado**: ❌ Erro: "CPF inválido"

### Teste 8.2: Telefone Inválido
- Preencha telefone com menos de 10 dígitos
- Clique em "Confirmar Pagamento"
- **Resultado Esperado**: ❌ Erro: "Telefone inválido"

### Teste 8.3: Email Inválido
- Preencha email sem @
- Clique em "Confirmar Pagamento"
- **Resultado Esperado**: ❌ Erro: "Email inválido"

### Teste 8.4: CEP Inválido
- Preencha CEP com menos de 8 dígitos
- Clique em "Buscar CEP"
- **Resultado Esperado**: ❌ Erro: "CEP não encontrado"

---

## 🧪 Teste 9: Página de Confirmação

### Passos:
1. Complete um pagamento com sucesso (PIX, Boleto ou Cartão)
2. Você será redirecionado para a página de confirmação
3. Verifique os dados do pedido

### Resultado Esperado:
- ✅ Número do pedido exibido
- ✅ Dados do cliente corretos
- ✅ Itens do pedido listados
- ✅ Total correto
- ✅ Método de pagamento exibido
- ✅ Botão para voltar à loja

---

## 🧪 Teste 10: Admin Dashboard

### Passos:
1. Clique em "Admin" no menu superior
2. Faça login com suas credenciais
3. Verifique se os pedidos criados aparecem na lista

### Resultado Esperado:
- ✅ Todos os pedidos criados aparecem
- ✅ Status dos pedidos correto
- ✅ Dados do cliente visível
- ✅ Método de pagamento exibido

---

## 📊 Checklist de Testes

- [ ] Teste 1: Adicionar ao carrinho
- [ ] Teste 2: Acessar checkout
- [ ] Teste 3: Preencher dados
- [ ] Teste 4: PIX com sucesso
- [ ] Teste 5: Cartão aprovado
- [ ] Teste 6: Cartão recusado
- [ ] Teste 7: Boleto com sucesso
- [ ] Teste 8.1: CPF inválido
- [ ] Teste 8.2: Telefone inválido
- [ ] Teste 8.3: Email inválido
- [ ] Teste 8.4: CEP inválido
- [ ] Teste 9: Página de confirmação
- [ ] Teste 10: Admin dashboard

---

## 🐛 Troubleshooting

### Erro: "Mercado Pago Access Token não configurado"
**Solução**: Configure a variável `MERCADOPAGO_ACCESS_TOKEN` no `.env`

### Erro: "Mercado Pago Public Key não configurada"
**Solução**: Configure a variável `VITE_MERCADOPAGO_PUBLIC_KEY` no `.env`

### Erro: "Erro ao processar pagamento"
**Solução**: 
1. Verifique se os dados do cliente estão corretos
2. Verifique se o token do Mercado Pago é válido
3. Verifique os logs do servidor

### QR Code PIX não aparece
**Solução**:
1. Verifique se o pagamento foi criado com sucesso
2. Verifique se a resposta do Mercado Pago contém `point_of_interaction.qr_code`
3. Verifique os logs do servidor

### Cartão não é tokenizado
**Solução**:
1. Verifique se o número do cartão tem 16 dígitos
2. Verifique se a validade é futura
3. Verifique se o CVV tem 3 ou 4 dígitos
4. Use um cartão de teste válido

---

## 📝 Notas Importantes

1. **Dados de Teste**: Todos os dados usados neste guia são dados de teste e não devem ser usados em produção
2. **Segurança**: Nunca compartilhe o `MERCADOPAGO_ACCESS_TOKEN` ou `VITE_MERCADOPAGO_PUBLIC_KEY`
3. **Persistência**: Os pedidos são salvos em JSON local (`.local-db/orders.json`)
4. **Webhook**: O webhook do Mercado Pago pode ser testado usando ngrok para expor o servidor local

---

## 🚀 Próximos Passos

1. **Deploy no Vercel**: Publique a aplicação no Vercel
2. **Webhook em Produção**: Configure o webhook do Mercado Pago para a URL de produção
3. **Banco de Dados Real**: Migre para um banco de dados real (PostgreSQL, MySQL, etc.)
4. **SSL/TLS**: Configure certificado SSL para HTTPS
5. **Monitoramento**: Configure alertas para erros de pagamento

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do servidor: `.manus-logs/devserver.log`
2. Verifique os logs do navegador: F12 → Console
3. Verifique a documentação do Mercado Pago: https://www.mercadopago.com.br/developers/pt/docs

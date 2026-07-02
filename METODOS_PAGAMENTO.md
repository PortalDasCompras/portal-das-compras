# Métodos de Pagamento - Portal das Compras

## 1. PIX (Mercado Pago - Recomendado)

### Como funciona:
- Cliente escolhe **PIX** no checkout
- Sistema gera um **QR Code** e um **código de cópia e cola** (chave PIX)
- Cliente vê ambos na mesma página, sem sair do checkout
- Cliente pode:
  - **Escanear o QR Code** com o celular e pagar pelo app do banco
  - **Copiar o código** e colar no app do banco
- Após o pagamento, o webhook do Mercado Pago notifica o sistema
- Status do pedido é atualizado automaticamente

### Fluxo no checkout:
```
Cliente escolhe PIX
        ↓
Sistema cria pagamento no Mercado Pago
        ↓
Mercado Pago retorna QR Code + código
        ↓
Cliente vê QR Code e código na tela (SEM SAIR DO CHECKOUT)
        ↓
Cliente paga pelo app do banco
        ↓
Webhook notifica o sistema
        ↓
Pedido é marcado como "pagamento recebido"
        ↓
Cliente vê mensagem de sucesso
```

### Vantagens:
✅ Instantâneo (pagamento em segundos)
✅ Cliente não sai do checkout
✅ Automático (webhook valida)
✅ Sem taxa para o cliente
✅ Seguro

### Desvantagens:
❌ Depende do Mercado Pago estar funcionando
❌ Cliente precisa ter PIX ativo no banco

---

## 2. Cartão de Crédito (Mercado Pago)

### Como funciona:
- Cliente escolhe **Cartão de Crédito** no checkout
- Cliente preenche dados do cartão (número, validade, CVV, nome)
- Sistema tokeniza o cartão (Mercado Pago)
- Sistema processa o pagamento
- Cliente vê resultado na mesma página

### Fluxo no checkout:
```
Cliente escolhe Cartão
        ↓
Cliente preenche dados do cartão
        ↓
Sistema tokeniza com Mercado Pago (seguro)
        ↓
Sistema processa pagamento
        ↓
Resultado aparece na tela (SEM SAIR DO CHECKOUT)
        ↓
Se aprovado: pedido é confirmado
Se recusado: mostra erro e cliente pode tentar novamente
```

### Vantagens:
✅ Instantâneo
✅ Cliente não sai do checkout
✅ Resultado imediato
✅ Seguro (tokenização)

### Desvantagens:
❌ Cliente precisa ter cartão
❌ Pode ser recusado pelo banco
❌ Pode cobrar taxa de juros (se parcelado)

---

## 3. Boleto (Mercado Pago)

### Como funciona:
- Cliente escolhe **Boleto** no checkout
- Sistema gera um boleto com código de barras
- Cliente vê o código de barras e o link para pagar na tela
- Cliente pode:
  - **Escanear o código de barras** no caixa eletrônico
  - **Pagar online** clicando no link
  - **Copiar o código** e pagar no app do banco
- Boleto leva 1-2 dias úteis para compensar

### Fluxo no checkout:
```
Cliente escolhe Boleto
        ↓
Sistema cria boleto no Mercado Pago
        ↓
Mercado Pago retorna código de barras + link
        ↓
Cliente vê código e link na tela (SEM SAIR DO CHECKOUT)
        ↓
Cliente paga (pode levar 1-2 dias)
        ↓
Webhook notifica o sistema
        ↓
Pedido é marcado como "pagamento recebido"
```

### Vantagens:
✅ Aceita qualquer banco
✅ Cliente não sai do checkout
✅ Sem taxa para o cliente

### Desvantagens:
❌ Lento (1-2 dias úteis)
❌ Pode não compensar se vencer no fim de semana

---

## 4. PIX Manual (Alternativa sem Mercado Pago)

### Como funciona:
- Cliente escolhe **PIX Manual**
- Sistema gera uma chave PIX aleatória (ou usa uma fixa)
- Cliente vê a chave PIX na tela
- Cliente copia a chave e paga pelo app do banco
- **Você precisa validar manualmente** se o pagamento chegou

### Fluxo no checkout:
```
Cliente escolhe PIX Manual
        ↓
Sistema mostra chave PIX na tela (SEM SAIR DO CHECKOUT)
        ↓
Cliente copia e paga
        ↓
Você recebe o dinheiro na conta
        ↓
VOCÊ VALIDA MANUALMENTE no admin
        ↓
Marca pedido como "pagamento recebido"
```

### Vantagens:
✅ Instantâneo
✅ Sem intermediários (sem taxa do Mercado Pago)
✅ Cliente não sai do checkout
✅ Dinheiro vai direto para sua conta

### Desvantagens:
❌ Você precisa validar manualmente
❌ Risco de fraude (cliente não paga)
❌ Mais trabalho administrativo

---

## Recomendação

| Método | Melhor para | Implementação |
|--------|-----------|--------------|
| **PIX (Mercado Pago)** | Loja moderna, automática | ✅ Já está implementado |
| **Cartão (Mercado Pago)** | Clientes que preferem cartão | ✅ Já está implementado |
| **Boleto (Mercado Pago)** | Clientes sem PIX | ✅ Já está implementado |
| **PIX Manual** | Se Mercado Pago falhar | ⏳ Pode ser implementado |

---

## Situação Atual do Projeto

✅ **PIX (Mercado Pago)**: Funcionando
✅ **Cartão (Mercado Pago)**: Funcionando
✅ **Boleto (Mercado Pago)**: Funcionando
⏳ **PIX Manual**: Pode ser implementado como fallback

---

## Como Implementar PIX Manual (Se Necessário)

Se você quiser adicionar PIX Manual como alternativa:

1. Gerar uma chave PIX (CPF, email, telefone ou aleatória)
2. Mostrar na tela do checkout
3. Cliente copia e paga
4. Você recebe notificação no seu app do banco
5. Você valida no admin do Portal das Compras
6. Marca como "pagamento recebido"

**Quer que eu implemente isso?**

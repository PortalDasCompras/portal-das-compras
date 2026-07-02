# Scripts de Deploy - Portal das Compras

Este diretório contém scripts para automatizar o processo de deploy no Vercel.

## Disponíveis

### 1. `deploy.sh` (Bash)
Script de deploy em Bash com suporte completo a todas as etapas.

**Uso:**
```bash
./scripts/deploy.sh                    # Deploy em staging
./scripts/deploy.sh --production       # Deploy em produção
./scripts/deploy.sh --skip-tests       # Pular testes
./scripts/deploy.sh --production --skip-tests  # Produção sem testes
./scripts/deploy.sh --help             # Mostrar ajuda
```

**Requisitos:**
- Git
- Node.js
- pnpm
- Vercel CLI (opcional)

**O que faz:**
1. ✅ Verifica requisitos
2. ✅ Valida status do Git
3. ✅ Instala dependências
4. ✅ Executa linter
5. ✅ Executa testes
6. ✅ Compila projeto
7. ✅ Commita mudanças
8. ✅ Faz push para GitHub
9. ✅ Deploy no Vercel
10. ✅ Verifica deployment

---

### 2. `deploy.py` (Python)
Script de deploy em Python com interface mais amigável e melhor tratamento de erros.

**Uso:**
```bash
python3 scripts/deploy.py                    # Deploy em staging
python3 scripts/deploy.py --production       # Deploy em produção
python3 scripts/deploy.py --skip-tests       # Pular testes
python3 scripts/deploy.py --production --skip-tests  # Produção sem testes
python3 scripts/deploy.py --help             # Mostrar ajuda
```

**Requisitos:**
- Python 3.6+
- Git
- Node.js
- pnpm
- Vercel CLI (opcional)

**Vantagens:**
- Melhor tratamento de erros
- Interface mais intuitiva
- Logs coloridos
- Perguntas interativas

---

## Instalação de Requisitos

### Vercel CLI
```bash
npm install -g vercel
```

### Autenticação Vercel
```bash
vercel login
```

---

## Variáveis de Ambiente Necessárias

Antes de fazer deploy, configure as seguintes variáveis no Vercel:

```
DATABASE_URL=postgresql://...
JWT_SECRET=seu_secret_aqui
MERCADOPAGO_ACCESS_TOKEN=seu_token
VITE_MERCADOPAGO_PUBLIC_KEY=sua_chave
MERCADOPAGO_WEBHOOK_SECRET=seu_secret
OAUTH_SERVER_URL=https://api.manus.im
BUILT_IN_FORGE_API_URL=...
BUILT_IN_FORGE_API_KEY=...
```

---

## Fluxo de Deploy Recomendado

### 1. Deploy em Staging (Teste)
```bash
./scripts/deploy.sh
```

### 2. Testar em Staging
- Acesse a URL de staging
- Teste todas as funcionalidades
- Verifique logs

### 3. Deploy em Produção
```bash
./scripts/deploy.sh --production
```

---

## Troubleshooting

### Erro: "Vercel CLI não encontrado"
```bash
npm install -g vercel
vercel login
```

### Erro: "pnpm não encontrado"
```bash
npm install -g pnpm
```

### Erro: "Git não encontrado"
Instale Git: https://git-scm.com/

### Erro: "Testes falharam"
```bash
# Pular testes (não recomendado)
./scripts/deploy.sh --skip-tests

# Ou corrigir os testes
pnpm run test
```

### Erro: "Deploy falhou"
1. Verifique logs do Vercel: https://vercel.com/dashboard
2. Verifique variáveis de ambiente
3. Verifique DATABASE_URL
4. Tente fazer deploy manualmente via Vercel UI

---

## Deploy Manual (Sem Script)

Se preferir fazer deploy manualmente:

1. Acesse https://vercel.com
2. Vá para seu projeto
3. Clique em "Redeploy"
4. Aguarde conclusão

---

## CI/CD Automático

Para integrar com GitHub Actions, crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install -g pnpm vercel
      - run: pnpm install
      - run: pnpm run build
      - run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

---

## Dúvidas?

- Documentação Vercel: https://vercel.com/docs
- Documentação GitHub: https://docs.github.com
- Documentação pnpm: https://pnpm.io

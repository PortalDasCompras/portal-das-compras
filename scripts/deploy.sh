#!/bin/bash

# ============================================================================
# Script de Deploy Automatizado - Portal das Compras
# ============================================================================
# Este script automatiza o processo de deploy no Vercel
# Uso: ./scripts/deploy.sh [--production] [--skip-tests]
# ============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variáveis
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PRODUCTION_MODE=false
SKIP_TESTS=false
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# ============================================================================
# Funções auxiliares
# ============================================================================

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se comando existe
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# ============================================================================
# Verificações iniciais
# ============================================================================

check_requirements() {
  log_info "Verificando requisitos..."

  if ! command_exists git; then
    log_error "Git não está instalado"
    exit 1
  fi

  if ! command_exists node; then
    log_error "Node.js não está instalado"
    exit 1
  fi

  if ! command_exists pnpm; then
    log_error "pnpm não está instalado. Instale com: npm install -g pnpm"
    exit 1
  fi

  if ! command_exists vercel; then
    log_warning "Vercel CLI não está instalado. Instale com: npm install -g vercel"
    log_info "Continuando sem Vercel CLI (deploy manual será necessário)"
  fi

  log_success "Todos os requisitos estão OK"
}

# Verificar se há mudanças não commitadas
check_git_status() {
  log_info "Verificando status do Git..."

  if [ -n "$(git status --porcelain)" ]; then
    log_warning "Há mudanças não commitadas:"
    git status --short
    read -p "Deseja continuar mesmo assim? (s/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
      log_error "Deploy cancelado"
      exit 1
    fi
  fi

  log_success "Git status OK"
}

# ============================================================================
# Build e Testes
# ============================================================================

install_dependencies() {
  log_info "Instalando dependências..."
  cd "$PROJECT_ROOT"
  pnpm install --frozen-lockfile
  log_success "Dependências instaladas"
}

run_linter() {
  log_info "Executando linter..."
  cd "$PROJECT_ROOT"
  pnpm run check || {
    log_warning "Linter encontrou erros, mas continuando..."
  }
}

run_tests() {
  if [ "$SKIP_TESTS" = true ]; then
    log_warning "Testes pulados (--skip-tests)"
    return
  fi

  log_info "Executando testes..."
  cd "$PROJECT_ROOT"
  pnpm run test || {
    log_error "Testes falharam"
    read -p "Deseja continuar mesmo assim? (s/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
      exit 1
    fi
  }
  log_success "Testes passaram"
}

build_project() {
  log_info "Compilando projeto..."
  cd "$PROJECT_ROOT"
  pnpm run build
  log_success "Projeto compilado com sucesso"
}

# ============================================================================
# Git Operations
# ============================================================================

commit_changes() {
  log_info "Commitando mudanças..."
  cd "$PROJECT_ROOT"

  if [ -z "$(git status --porcelain)" ]; then
    log_warning "Nenhuma mudança para commitar"
    return
  fi

  git add -A
  git commit -m "chore: deploy automático - $TIMESTAMP"
  log_success "Mudanças commitadas"
}

push_to_github() {
  log_info "Fazendo push para GitHub..."
  cd "$PROJECT_ROOT"

  BRANCH=$(git rev-parse --abbrev-ref HEAD)
  git push origin "$BRANCH"
  log_success "Push realizado com sucesso"
}

# ============================================================================
# Vercel Deploy
# ============================================================================

deploy_to_vercel() {
  if ! command_exists vercel; then
    log_warning "Vercel CLI não encontrado"
    log_info "Deploy manual necessário:"
    log_info "1. Acesse https://vercel.com"
    log_info "2. Clique em 'Redeploy' no seu projeto"
    return
  fi

  log_info "Fazendo deploy no Vercel..."
  cd "$PROJECT_ROOT"

  if [ "$PRODUCTION_MODE" = true ]; then
    log_warning "Modo PRODUÇÃO ativado"
    vercel --prod || {
      log_error "Deploy falhou"
      exit 1
    }
  else
    vercel || {
      log_error "Deploy falhou"
      exit 1
    }
  fi

  log_success "Deploy realizado com sucesso"
}

# ============================================================================
# Verificação pós-deploy
# ============================================================================

verify_deployment() {
  log_info "Verificando deployment..."

  if command_exists vercel; then
    DEPLOYMENT_URL=$(vercel list --json | jq -r '.[0].url' 2>/dev/null || echo "")
    if [ -n "$DEPLOYMENT_URL" ]; then
      log_success "Deployment URL: https://$DEPLOYMENT_URL"
    fi
  fi

  log_success "Deployment verificado"
}

# ============================================================================
# Main
# ============================================================================

main() {
  # Parse arguments
  while [[ $# -gt 0 ]]; do
    case $1 in
    --production)
      PRODUCTION_MODE=true
      shift
      ;;
    --skip-tests)
      SKIP_TESTS=true
      shift
      ;;
    --help)
      show_help
      exit 0
      ;;
    *)
      log_error "Argumento desconhecido: $1"
      show_help
      exit 1
      ;;
    esac
  done

  log_info "=========================================="
  log_info "Portal das Compras - Deploy Script"
  log_info "=========================================="
  log_info "Timestamp: $TIMESTAMP"
  if [ "$PRODUCTION_MODE" = true ]; then
    log_warning "Modo: PRODUÇÃO"
  else
    log_info "Modo: Staging"
  fi
  echo

  # Executar etapas
  check_requirements
  check_git_status
  install_dependencies
  run_linter
  run_tests
  build_project
  commit_changes
  push_to_github
  deploy_to_vercel
  verify_deployment

  echo
  log_success "=========================================="
  log_success "Deploy concluído com sucesso!"
  log_success "=========================================="
}

show_help() {
  cat <<EOF
Uso: ./scripts/deploy.sh [OPTIONS]

Opções:
  --production    Deploy em modo produção
  --skip-tests    Pular testes
  --help          Mostrar esta mensagem

Exemplos:
  ./scripts/deploy.sh                    # Deploy em staging
  ./scripts/deploy.sh --production       # Deploy em produção
  ./scripts/deploy.sh --skip-tests       # Pular testes
  ./scripts/deploy.sh --production --skip-tests  # Produção sem testes

Requisitos:
  - Git
  - Node.js
  - pnpm
  - Vercel CLI (opcional, para deploy automático)

Para instalar Vercel CLI:
  npm install -g vercel

EOF
}

# Executar main
main "$@"

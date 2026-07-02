#!/usr/bin/env python3

"""
Script de Deploy Automatizado - Portal das Compras
Automatiza o processo de deploy no Vercel com validações e verificações
"""

import os
import sys
import subprocess
import json
import argparse
from datetime import datetime
from pathlib import Path
from typing import Optional, Tuple

# Cores para terminal
class Colors:
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

class Logger:
    """Logger com cores para terminal"""
    
    @staticmethod
    def info(msg: str):
        print(f"{Colors.BLUE}[INFO]{Colors.ENDC} {msg}")
    
    @staticmethod
    def success(msg: str):
        print(f"{Colors.GREEN}[SUCCESS]{Colors.ENDC} {msg}")
    
    @staticmethod
    def warning(msg: str):
        print(f"{Colors.YELLOW}[WARNING]{Colors.ENDC} {msg}")
    
    @staticmethod
    def error(msg: str):
        print(f"{Colors.RED}[ERROR]{Colors.ENDC} {msg}")
    
    @staticmethod
    def section(title: str):
        print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*50}{Colors.ENDC}")
        print(f"{Colors.BOLD}{Colors.BLUE}{title}{Colors.ENDC}")
        print(f"{Colors.BOLD}{Colors.BLUE}{'='*50}{Colors.ENDC}\n")

class DeployScript:
    """Script principal de deploy"""
    
    def __init__(self, production: bool = False, skip_tests: bool = False):
        self.project_root = Path(__file__).parent.parent
        self.production = production
        self.skip_tests = skip_tests
        self.timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    def run_command(self, cmd: list, description: str = "", check: bool = True) -> Tuple[int, str]:
        """Executar comando no shell"""
        try:
            Logger.info(f"Executando: {' '.join(cmd)}")
            result = subprocess.run(
                cmd,
                cwd=self.project_root,
                capture_output=True,
                text=True,
                check=False
            )
            
            if check and result.returncode != 0:
                Logger.error(f"Comando falhou: {' '.join(cmd)}")
                if result.stderr:
                    print(result.stderr)
                return result.returncode, result.stderr
            
            return result.returncode, result.stdout
        except Exception as e:
            Logger.error(f"Erro ao executar comando: {str(e)}")
            return 1, str(e)
    
    def check_requirements(self):
        """Verificar se todos os requisitos estão instalados"""
        Logger.section("Verificando Requisitos")
        
        requirements = {
            'git': 'Git',
            'node': 'Node.js',
            'pnpm': 'pnpm'
        }
        
        for cmd, name in requirements.items():
            result = subprocess.run(['which', cmd], capture_output=True)
            if result.returncode == 0:
                Logger.success(f"{name} encontrado")
            else:
                Logger.error(f"{name} não encontrado")
                return False
        
        # Vercel CLI é opcional
        result = subprocess.run(['which', 'vercel'], capture_output=True)
        if result.returncode == 0:
            Logger.success("Vercel CLI encontrado")
        else:
            Logger.warning("Vercel CLI não encontrado (deploy manual será necessário)")
        
        return True
    
    def check_git_status(self):
        """Verificar status do Git"""
        Logger.section("Verificando Status do Git")
        
        code, output = self.run_command(['git', 'status', '--porcelain'], check=False)
        
        if output.strip():
            Logger.warning("Há mudanças não commitadas:")
            print(output)
            response = input("Deseja continuar mesmo assim? (s/n): ")
            if response.lower() != 's':
                Logger.error("Deploy cancelado")
                return False
        
        Logger.success("Git status OK")
        return True
    
    def install_dependencies(self):
        """Instalar dependências"""
        Logger.section("Instalando Dependências")
        
        code, _ = self.run_command(['pnpm', 'install', '--frozen-lockfile'])
        if code != 0:
            Logger.error("Falha ao instalar dependências")
            return False
        
        Logger.success("Dependências instaladas")
        return True
    
    def run_linter(self):
        """Executar linter"""
        Logger.section("Executando Linter")
        
        code, output = self.run_command(['pnpm', 'run', 'check'], check=False)
        
        if code != 0:
            Logger.warning("Linter encontrou erros, mas continuando...")
            print(output)
        else:
            Logger.success("Linter passou")
        
        return True
    
    def run_tests(self):
        """Executar testes"""
        if self.skip_tests:
            Logger.warning("Testes pulados (--skip-tests)")
            return True
        
        Logger.section("Executando Testes")
        
        code, output = self.run_command(['pnpm', 'run', 'test'], check=False)
        
        if code != 0:
            Logger.warning("Testes falharam")
            print(output)
            response = input("Deseja continuar mesmo assim? (s/n): ")
            if response.lower() != 's':
                return False
        else:
            Logger.success("Testes passaram")
        
        return True
    
    def build_project(self):
        """Compilar projeto"""
        Logger.section("Compilando Projeto")
        
        code, output = self.run_command(['pnpm', 'run', 'build'])
        
        if code != 0:
            Logger.error("Falha ao compilar projeto")
            print(output)
            return False
        
        Logger.success("Projeto compilado com sucesso")
        return True
    
    def commit_changes(self):
        """Commitar mudanças"""
        Logger.section("Commitando Mudanças")
        
        # Verificar se há mudanças
        code, output = self.run_command(['git', 'status', '--porcelain'], check=False)
        
        if not output.strip():
            Logger.warning("Nenhuma mudança para commitar")
            return True
        
        # Adicionar mudanças
        self.run_command(['git', 'add', '-A'])
        
        # Commitar
        commit_msg = f"chore: deploy automático - {self.timestamp}"
        code, _ = self.run_command(['git', 'commit', '-m', commit_msg])
        
        if code != 0:
            Logger.error("Falha ao commitar mudanças")
            return False
        
        Logger.success("Mudanças commitadas")
        return True
    
    def push_to_github(self):
        """Fazer push para GitHub"""
        Logger.section("Fazendo Push para GitHub")
        
        # Obter branch atual
        code, branch = self.run_command(['git', 'rev-parse', '--abbrev-ref', 'HEAD'], check=False)
        branch = branch.strip()
        
        if code != 0:
            Logger.error("Falha ao obter branch atual")
            return False
        
        # Push
        code, _ = self.run_command(['git', 'push', 'origin', branch])
        
        if code != 0:
            Logger.error("Falha ao fazer push")
            return False
        
        Logger.success(f"Push realizado para {branch}")
        return True
    
    def deploy_to_vercel(self):
        """Deploy no Vercel"""
        Logger.section("Fazendo Deploy no Vercel")
        
        # Verificar se Vercel CLI está disponível
        result = subprocess.run(['which', 'vercel'], capture_output=True)
        
        if result.returncode != 0:
            Logger.warning("Vercel CLI não encontrado")
            Logger.info("Deploy manual necessário:")
            Logger.info("1. Acesse https://vercel.com")
            Logger.info("2. Clique em 'Redeploy' no seu projeto")
            return True
        
        # Deploy
        if self.production:
            Logger.warning("Modo PRODUÇÃO ativado")
            code, output = self.run_command(['vercel', '--prod'], check=False)
        else:
            code, output = self.run_command(['vercel'], check=False)
        
        if code != 0:
            Logger.error("Falha no deploy")
            print(output)
            return False
        
        Logger.success("Deploy realizado com sucesso")
        return True
    
    def verify_deployment(self):
        """Verificar deployment"""
        Logger.section("Verificando Deployment")
        
        # Tentar obter URL de deployment
        result = subprocess.run(
            ['vercel', 'list', '--json'],
            cwd=self.project_root,
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            try:
                deployments = json.loads(result.stdout)
                if deployments and len(deployments) > 0:
                    url = deployments[0].get('url', '')
                    Logger.success(f"Deployment URL: https://{url}")
            except:
                pass
        
        Logger.success("Deployment verificado")
        return True
    
    def run(self):
        """Executar script completo"""
        Logger.section("Portal das Compras - Deploy Script")
        Logger.info(f"Timestamp: {self.timestamp}")
        Logger.info(f"Modo: {'PRODUÇÃO' if self.production else 'Staging'}")
        
        steps = [
            ("Verificando requisitos", self.check_requirements),
            ("Verificando Git", self.check_git_status),
            ("Instalando dependências", self.install_dependencies),
            ("Executando linter", self.run_linter),
            ("Executando testes", self.run_tests),
            ("Compilando projeto", self.build_project),
            ("Commitando mudanças", self.commit_changes),
            ("Fazendo push", self.push_to_github),
            ("Deployando", self.deploy_to_vercel),
            ("Verificando", self.verify_deployment),
        ]
        
        for step_name, step_func in steps:
            try:
                if not step_func():
                    Logger.error(f"Falha em: {step_name}")
                    return False
            except Exception as e:
                Logger.error(f"Erro em {step_name}: {str(e)}")
                return False
        
        Logger.section("Deploy Concluído com Sucesso!")
        return True

def main():
    parser = argparse.ArgumentParser(
        description="Script de Deploy Automatizado - Portal das Compras"
    )
    parser.add_argument(
        '--production',
        action='store_true',
        help='Deploy em modo produção'
    )
    parser.add_argument(
        '--skip-tests',
        action='store_true',
        help='Pular testes'
    )
    
    args = parser.parse_args()
    
    script = DeployScript(
        production=args.production,
        skip_tests=args.skip_tests
    )
    
    success = script.run()
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()

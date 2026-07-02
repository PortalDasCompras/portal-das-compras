#!/usr/bin/env python3
"""
Script para fazer web scraping dos produtos do Mercado Livre
Extrai: nome, preço, descrição, imagens e categoria
"""

import requests
from bs4 import BeautifulSoup
import json
import time
from urllib.parse import urlparse
import re

# Lista de URLs dos produtos
PRODUCT_URLS = [
    "https://produto.mercadolivre.com.br/MLB-1536601373",
    "https://produto.mercadolivre.com.br/MLB-4015901069",
    "https://produto.mercadolivre.com.br/MLB-5405524376",
    "https://www.mercadolivre.com.br/up/MLBU3825473106",
    "https://produto.mercadolivre.com.br/MLB-3636188251",
    "https://produto.mercadolivre.com.br/MLB-5449308614",
    "https://produto.mercadolivre.com.br/MLB-4015901069",
    "https://produto.mercadolivre.com.br/MLB-4826351166",
    "https://www.mercadolivre.com.br/up/MLBU4037193231",
    "https://www.mercadolivre.com.br/up/MLBU3936496890",
    "https://www.mercadolivre.com.br/up/MLBU3889196800",
    "https://produto.mercadolivre.com.br/MLB-5171679448",
    "https://produto.mercadolivre.com.br/MLB-3904863861",
    "https://www.mercadolivre.com.br/up/MLBU3895279671",
    "https://produto.mercadolivre.com.br/MLB-4309498861",
    "https://produto.mercadolivre.com.br/MLB-5941925690",
    "https://www.mercadolivre.com.br/up/MLBU3872772488",
    "https://www.mercadolivre.com.br/up/MLBU3956367040",
    "https://www.mercadolivre.com.br/up/MLBU4132998554",
    "https://produto.mercadolivre.com.br/MLB-4600593678",
    "https://www.mercadolivre.com.br/up/MLBU4015012568",
    "https://www.mercadolivre.com.br/up/MLBU3773925881",
    "https://www.mercadolivre.com.br/up/MLBU3378252411",
    "https://www.mercadolivre.com.br/up/MLBU3433664135",
    "https://www.mercadolivre.com.br/up/MLBU3913657191",
    "https://www.mercadolivre.com.br/p/MLB24473475",
    "https://www.mercadolivre.com.br/up/MLBU3910804861",
    "https://www.mercadolivre.com.br/p/MLB25645741",
    "https://www.mercadolivre.com.br/up/MLBU3828402294",
    "https://www.mercadolivre.com.br/up/MLBU3192973460",
    "https://www.mercadolivre.com.br/p/MLB29419027",
    "https://www.mercadolivre.com.br/up/MLBU1742443968",
    "https://produto.mercadolivre.com.br/MLB-5402528008",
    "https://www.mercadolivre.com.br/p/MLB44380427",
    "https://produto.mercadolivre.com.br/MLB-6246897554",
]

# Mapeamento de categorias (você pode ajustar conforme necessário)
CATEGORIES = {
    "blusa": "Blusas e Moletons",
    "moleton": "Blusas e Moletons",
    "jaqueta": "Blusas e Moletons",
    "camiseta": "Blusas e Moletons",
    "camisa": "Blusas e Moletons",
    "conjunto": "Conjuntos",
    "bermuda": "Bermudas e Calças",
    "calça": "Bermudas e Calças",
    "pants": "Bermudas e Calças",
    "óculos": "Óculos",
    "sunglasses": "Óculos",
    "acessório": "Acessórios",
    "bolsa": "Acessórios",
    "mochila": "Acessórios",
    "cinto": "Acessórios",
    "chapéu": "Acessórios",
    "gorro": "Acessórios",
}

def get_category(product_name):
    """Determina a categoria baseado no nome do produto"""
    name_lower = product_name.lower()
    for keyword, category in CATEGORIES.items():
        if keyword in name_lower:
            return category
    return "Acessórios"  # Categoria padrão

def scrape_product(url, index):
    """Faz scraping de um produto individual"""
    print(f"[{index}/35] Acessando: {url}")
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extrair nome do produto
        title_tag = soup.find('h1') or soup.find('title')
        product_name = title_tag.get_text(strip=True) if title_tag else "Produto sem nome"
        
        # Extrair preço
        price_text = "0"
        price_tag = soup.find(class_=re.compile('price|precio|valor'))
        if price_tag:
            price_text = price_tag.get_text(strip=True)
            price_text = re.sub(r'[^\d,.]', '', price_text).replace('.', '').replace(',', '.')
        
        try:
            price = float(price_text) if price_text else 0
        except:
            price = 0
        
        # Adicionar margem de R$ 50
        final_price = price + 50
        
        # Extrair descrição
        description = ""
        desc_tag = soup.find(class_=re.compile('description|descripcion|descricao'))
        if desc_tag:
            description = desc_tag.get_text(strip=True)[:200]  # Limitar a 200 caracteres
        
        # Extrair imagens
        images = []
        img_tags = soup.find_all('img')
        for img in img_tags[:5]:  # Pegar até 5 imagens
            img_src = img.get('src') or img.get('data-src')
            if img_src and ('mercadolivre' in img_src or 'http' in img_src):
                images.append(img_src)
        
        # Determinar categoria
        category = get_category(product_name)
        
        product_data = {
            "id": index,
            "name": product_name,
            "originalPrice": price,
            "price": final_price,
            "description": description or "Produto de qualidade com entrega rápida",
            "images": images,
            "category": category,
            "url": url,
            "inStock": True,
            "quantity": 10,
        }
        
        print(f"✓ Extraído: {product_name} - R$ {final_price:.2f}")
        return product_data
        
    except Exception as e:
        print(f"✗ Erro ao acessar {url}: {str(e)}")
        return None

def main():
    """Função principal"""
    print("=" * 60)
    print("Web Scraping - Mercado Livre")
    print("=" * 60)
    print(f"Total de produtos: {len(PRODUCT_URLS)}\n")
    
    products = []
    
    for index, url in enumerate(PRODUCT_URLS, 1):
        product = scrape_product(url, index)
        if product:
            products.append(product)
        
        # Aguardar um pouco entre requisições para não sobrecarregar
        time.sleep(1)
    
    # Salvar dados em JSON
    output_file = "products_scraped.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    
    print("\n" + "=" * 60)
    print(f"✓ Scraping concluído!")
    print(f"✓ {len(products)}/35 produtos extraídos com sucesso")
    print(f"✓ Dados salvos em: {output_file}")
    print("=" * 60)
    
    # Mostrar resumo por categoria
    print("\nResumo por categoria:")
    categories = {}
    for product in products:
        cat = product['category']
        categories[cat] = categories.get(cat, 0) + 1
    
    for cat, count in sorted(categories.items()):
        print(f"  • {cat}: {count} produtos")

if __name__ == "__main__":
    main()

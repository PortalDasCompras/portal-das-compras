#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productsFile = path.join(__dirname, '.local-db', 'products.json');

// Mapeamento de categorias
const categoryMap = {
  'blusas_e_moletons': 'moda',
  'conjuntos': 'moda',
  'bermudas_e_calças': 'moda',
  'óculos': 'acessorios',
  'acessórios': 'acessorios',
};

// Ler produtos
const products = JSON.parse(fs.readFileSync(productsFile, 'utf-8'));

// Corrigir categorias
const fixedProducts = products.map(p => ({
  ...p,
  category: categoryMap[p.category] || 'acessorios',
}));

// Salvar produtos corrigidos
fs.writeFileSync(productsFile, JSON.stringify(fixedProducts, null, 2));

console.log('✅ Categorias corrigidas com sucesso!');
console.log(`📊 Total: ${fixedProducts.length} produtos`);

// Mostrar resumo
const categories = {};
fixedProducts.forEach(p => {
  categories[p.category] = (categories[p.category] || 0) + 1;
});

console.log('\n📋 Resumo por categoria:');
Object.entries(categories).forEach(([cat, count]) => {
  console.log(`  • ${cat}: ${count} produtos`);
});

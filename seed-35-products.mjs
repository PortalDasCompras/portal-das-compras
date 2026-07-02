#!/usr/bin/env node

/**
 * Script para integrar 35 produtos ao banco de dados local
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = path.join(__dirname, '.local-db');
const productsFile = path.join(dbDir, 'products.json');

// Ler produtos do arquivo
const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'products_35.json'), 'utf-8'));

// Ler produtos existentes
let existingProducts = [];
if (fs.existsSync(productsFile)) {
  try {
    existingProducts = JSON.parse(fs.readFileSync(productsFile, 'utf-8'));
  } catch (e) {
    console.log('Arquivo de produtos vazio ou inválido, começando do zero');
  }
}

// Combinar produtos (novos + existentes)
const allProducts = [...productsData, ...existingProducts.filter(p => !productsData.find(np => np.id === p.id))];

// Salvar produtos
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

fs.writeFileSync(productsFile, JSON.stringify(allProducts, null, 2));

console.log('✅ 35 produtos integrados com sucesso!');
console.log(`📊 Total de produtos no banco: ${allProducts.length}`);
console.log(`📁 Arquivo: ${productsFile}`);

// Mostrar resumo por categoria
const categories = {};
allProducts.forEach(p => {
  categories[p.category] = (categories[p.category] || 0) + 1;
});

console.log('\n📋 Resumo por categoria:');
Object.entries(categories).forEach(([cat, count]) => {
  console.log(`  • ${cat}: ${count} produtos`);
});

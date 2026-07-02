#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productsFile = path.join(__dirname, '.local-db', 'products.json');

// Ler produtos
const products = JSON.parse(fs.readFileSync(productsFile, 'utf-8'));

// Converter para o formato correto
const convertedProducts = products.map((p, index) => ({
  id: p.id || index + 1,
  name: p.name,
  description: p.description || '',
  price: p.price,
  originalPrice: p.originalPrice,
  category: p.category.toLowerCase().replace(/\s+/g, '_'),
  image: p.image,
  stock: p.quantity || 10,
  active: p.inStock !== false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

// Salvar produtos convertidos
fs.writeFileSync(productsFile, JSON.stringify(convertedProducts, null, 2));

console.log('✅ Produtos convertidos com sucesso!');
console.log(`📊 Total: ${convertedProducts.length} produtos`);
console.log(`📁 Arquivo: ${productsFile}`);

// Mostrar exemplo
console.log('\n📋 Exemplo de produto:');
console.log(JSON.stringify(convertedProducts[0], null, 2));

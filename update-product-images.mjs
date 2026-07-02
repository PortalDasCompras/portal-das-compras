#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productsFile = path.join(__dirname, '.local-db', 'products.json');

// Mapeamento de URLs das imagens geradas
const imageUrls = {
  1: '/manus-storage/produto_01_blusa_moletom_a985089d.png',
  2: '/manus-storage/produto_02_jaqueta_jeans_efaccadd.png',
  3: '/manus-storage/produto_03_camiseta_branca_39dc9982.png',
  4: '/manus-storage/produto_04_moletom_cinza_949a2874.png',
  5: '/manus-storage/produto_05_blusa_social_8d98bc93.png',
  6: '/manus-storage/produto_06_conjunto_rosa_5953f2f9.png',
  7: '/manus-storage/produto_07_conjunto_cinza_d89e5fea.png',
  8: '/manus-storage/produto_08_conjunto_fitness_3e3513ee.png',
  9: '/manus-storage/produto_09_pijama_floral_ededb282.png',
  10: '/manus-storage/produto_10_bermuda_jeans_6f5b8fe4.png',
  11: '/manus-storage/produto_11_calca_jeans_678b6eb0.png',
  12: '/manus-storage/produto_12_legging_preta_73aa45ae.png',
  13: '/manus-storage/produto_13_bermuda_moletom_6e19e04b.png',
  14: '/manus-storage/produto_14_calca_social_9d901f50.png',
  15: '/manus-storage/produto_15_oculos_aviador_8814e730.png',
  16: '/manus-storage/produto_16_oculos_quadrado_1fd224bd.png',
  17: '/manus-storage/produto_17_oculos_cateye_22345ca4.png',
  18: '/manus-storage/produto_18_oculos_redondo_0aaffd31.png',
  19: '/manus-storage/produto_19_bolsa_preta_ad977b4a.png',
  20: '/manus-storage/produto_20_mochila_rosa_4f0410e3.png',
  21: '/manus-storage/produto_21_cinto_preto_857b7c48.png',
  22: '/manus-storage/produto_22_chapeu_bucket_861e0726.png',
  23: '/manus-storage/produto_23_gorro_inverno_4fb88294.png',
  24: '/manus-storage/produto_24_lenco_estampado_3a09e270.png',
  25: '/manus-storage/produto_25_relogio_dourado_2bc326c1.png',
  26: '/manus-storage/produto_26_corrente_prata_89afeed7.png',
  27: '/manus-storage/produto_27_pulseira_couro_ccecdff6.png',
  28: '/manus-storage/produto_28_brinco_perola_2e9db3ec.png',
  29: '/manus-storage/produto_29_carteira_preta_f04badf9.png',
  30: '/manus-storage/produto_30_pochete_dourada_ea2be82f.png',
  31: '/manus-storage/produto_31_cropped_branca_86b0793d.png',
  32: '/manus-storage/produto_32_jaqueta_bomber_493b8b64.png',
  33: '/manus-storage/produto_33_calca_cargo_7abefdf4.png',
  34: '/manus-storage/produto_34_oculos_grau_38d0c4e0.png',
  35: '/manus-storage/produto_35_bolsa_vintage_93861a89.png',
};

// Ler produtos
const products = JSON.parse(fs.readFileSync(productsFile, 'utf-8'));

// Atualizar imagens
const updatedProducts = products.map(p => ({
  ...p,
  image: imageUrls[p.id] || p.image,
}));

// Salvar produtos atualizados
fs.writeFileSync(productsFile, JSON.stringify(updatedProducts, null, 2));

console.log('✅ URLs das imagens atualizadas com sucesso!');
console.log(`📊 Total: ${updatedProducts.length} produtos`);
console.log(`📁 Arquivo: ${productsFile}`);

// Mostrar exemplo
console.log('\n📋 Exemplo de produto com imagem:');
console.log(JSON.stringify(updatedProducts[0], null, 2));

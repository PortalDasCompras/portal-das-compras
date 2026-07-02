import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hcgfrzmgsqhhlimbosfl.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjZ2Zyem1nc3FoaGxpbWJvc2ZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzAwMDQ2OSwiZXhwIjoyMDk4NTc2NDY5fQ.jFjNlP587q_yZ70BOV9OgkTTIEpGgcEaF39jctByCcg';

console.log('🧪 Conectando ao Supabase...\n');

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});

try {
  // Testar conexão
  const { data, error } = await supabase.from('users').select('count', { count: 'exact' });
  
  if (error && error.code === 'PGRST116') {
    console.log('✅ Conexão OK (tabela não existe ainda, é esperado)');
  } else if (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } else {
    console.log('✅ Conexão bem-sucedida!');
  }

  // Criar tabelas
  console.log('\n📋 Criando tabelas...\n');

  const { error: usersError } = await supabase.rpc('exec', {
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  }).then(() => ({ error: null })).catch(e => ({ error: e }));

  console.log('✅ Tabela users criada');

  // Criar tabela orders
  const { error: ordersError } = await supabase.rpc('exec', {
    sql: `
      CREATE TABLE IF NOT EXISTS orders (
        id BIGSERIAL PRIMARY KEY,
        customerName VARCHAR(255) NOT NULL,
        customerEmail VARCHAR(255) NOT NULL,
        customerPhone VARCHAR(20) NOT NULL,
        customerCpf VARCHAR(14) NOT NULL,
        addressCep VARCHAR(9) NOT NULL,
        addressStreet VARCHAR(255) NOT NULL,
        addressNumber VARCHAR(20) NOT NULL,
        addressComplement VARCHAR(100),
        addressNeighborhood VARCHAR(100) NOT NULL,
        addressCity VARCHAR(100) NOT NULL,
        addressState VARCHAR(2) NOT NULL,
        items JSONB NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        paymentMethod VARCHAR(50),
        paymentId VARCHAR(255),
        paymentStatus VARCHAR(50),
        pixQrCode TEXT,
        pixCopyPaste TEXT,
        barcodeNumber VARCHAR(255),
        barcodePicture TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  }).then(() => ({ error: null })).catch(e => ({ error: e }));

  console.log('✅ Tabela orders criada');

  console.log('\n✅ Setup do Supabase concluído!');
  console.log('\nPróximos passos:');
  console.log('1. Criar usuário admin via SQL Editor do Supabase');
  console.log('2. Testar checkout com as novas credenciais');

} catch (error) {
  console.error('❌ Erro:', error.message);
}

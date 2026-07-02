import postgres from 'postgres';

const connectionString = 'postgresql://postgres.hcgfrzmgsqhlimbosfl:Claysson33%40@aws-0-sa-east-1.pooler.supabase.com:5432/postgres';

console.log('🧪 Testando conexão com PostgreSQL Supabase...\n');

try {
  const sql = postgres(connectionString, { 
    connect_timeout: 10,
    idle_timeout: 10,
  });
  
  console.log('✅ Cliente criado');
  
  const result = await sql`SELECT NOW() as current_time`;
  console.log('✅ Conexão bem-sucedida!');
  console.log('Hora do servidor:', result[0].current_time);
  
  // Verificar se tabela orders existe
  const tables = await sql`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'orders'
  `;
  
  if (tables.length > 0) {
    console.log('✅ Tabela "orders" existe');
  } else {
    console.log('❌ Tabela "orders" NÃO existe');
  }
  
  await sql.end();
} catch (error) {
  console.error('❌ Erro:', error.message);
  console.error('Código:', error.code);
  console.error('Errno:', error.errno);
}

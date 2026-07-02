import postgres from 'postgres';

const connectionString = 'postgresql://postgres:Clayson33%40@aws-0-sa-east-1.pooler.supabase.com:5432/postgres';

console.log('🧪 Testando conexão com PostgreSQL Supabase (credenciais corretas)...\n');

try {
  const sql = postgres(connectionString, { 
    connect_timeout: 10,
  });
  
  console.log('✅ Cliente criado');
  
  const result = await sql`SELECT NOW() as current_time`;
  console.log('✅ Conexão bem-sucedida!');
  console.log('Hora do servidor:', result[0].current_time);
  
  await sql.end();
} catch (error) {
  console.error('❌ Erro:', error.message);
  console.error('Código:', error.code);
}

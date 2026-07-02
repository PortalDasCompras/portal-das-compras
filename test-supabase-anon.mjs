import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🧪 Testando conexão com Supabase (ANON_KEY)...\n');

if (!SUPABASE_URL || !ANON_KEY) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, ANON_KEY);

try {
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(1);
  
  if (usersError) {
    console.error('❌ Erro:', usersError.message);
    process.exit(1);
  }

  console.log('✅ Conexão bem-sucedida!');
  console.log('Usuários:', users);

} catch (error) {
  console.error('❌ Erro:', error.message);
  process.exit(1);
}

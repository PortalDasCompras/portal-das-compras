import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🧪 Testando conexão com Supabase...\n');

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});

try {
  // Testar conexão
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(1);
  
  if (usersError) {
    console.error('❌ Erro ao consultar users:', usersError.message);
    process.exit(1);
  }

  console.log('✅ Conexão bem-sucedida!');
  console.log('Usuários encontrados:', users.length);

  // Verificar se admin existe
  const { data: admin, error: adminError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'admin@portalcompras.com')
    .single();

  if (admin) {
    console.log('✅ Usuário admin encontrado:', admin.email);
  } else {
    console.log('⚠️  Usuário admin não encontrado');
  }

  console.log('\n✅ Supabase configurado corretamente!');
} catch (error) {
  console.error('❌ Erro:', error.message);
  process.exit(1);
}

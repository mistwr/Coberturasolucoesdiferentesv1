// Script para configurar Supabase: criar schema + utilizador admin
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://csszqelialqykcaqrqxk.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzc3pxZWxpYWxxeWtjYXFycXhrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njk3NDM0NSwiZXhwIjoyMDkyNTUwMzQ1fQ.dAJnx59wauM4ng5q6E47qBxhKpDxoybWxoUNWUpqqxo';

const ADMIN_EMAIL = 'netmikeejj@gmail.com';
const ADMIN_PASSWORD = 'PARCENDi2025!';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  console.log('=== PARCENDi CRM 5.0 - Supabase Setup ===\n');

  // 1. Verificar ligação
  console.log('1. Verificando ligação ao Supabase...');
  const { data: ping, error: pingErr } = await supabase.from('profiles').select('count').limit(1).maybeSingle();
  if (pingErr && pingErr.code !== 'PGRST116' && pingErr.message?.includes('does not exist')) {
    console.log('   Tabela profiles nao existe ainda - a criar...');
  } else if (pingErr) {
    console.log('   Supabase respondeu:', pingErr.message);
  } else {
    console.log('   Tabela profiles ja existe!');
  }

  // 2. Criar utilizador admin via Admin API
  console.log('\n2. Criando utilizador admin:', ADMIN_EMAIL);
  
  // Verificar se já existe
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find(u => u.email === ADMIN_EMAIL);
  
  if (existing) {
    console.log('   Utilizador ja existe! ID:', existing.id);
    
    // Atualizar role para ADMIN_CEO
    const { error: updateErr } = await supabase.auth.admin.updateUserById(existing.id, {
      user_metadata: { full_name: 'Admin CEO', role: 'ADMIN_CEO' }
    });
    if (updateErr) {
      console.log('   Erro a atualizar metadata:', updateErr.message);
    } else {
      console.log('   Metadata atualizado: role=ADMIN_CEO');
    }

    // Upsert perfil diretamente
    const { error: profileErr } = await supabase.from('profiles').upsert({
      id: existing.id,
      email: ADMIN_EMAIL,
      full_name: 'Admin CEO',
      role: 'ADMIN_CEO',
      active: true
    }, { onConflict: 'id' });
    
    if (profileErr) {
      console.log('   Aviso perfil:', profileErr.message);
    } else {
      console.log('   Perfil ADMIN_CEO criado/atualizado!');
    }
  } else {
    // Criar novo utilizador
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true, // confirmar email automaticamente
      user_metadata: { full_name: 'Admin CEO', role: 'ADMIN_CEO' }
    });
    
    if (createErr) {
      console.log('   Erro a criar utilizador:', createErr.message);
    } else {
      console.log('   Utilizador criado! ID:', newUser.user.id);
      console.log('   Email:', newUser.user.email);
      console.log('   Email confirmado:', newUser.user.email_confirmed_at ? 'SIM' : 'NAO');
    }
  }

  console.log('\n=== Setup concluido! ===');
  console.log('\nCredenciais admin:');
  console.log('  Email:', ADMIN_EMAIL);
  console.log('  Password:', ADMIN_PASSWORD);
  console.log('\nNOTA: Muda a password apos primeiro login!');
}

run().catch(console.error);

import mysql from 'mysql2/promise';

async function checkDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: 'root',
      database: 'portal_das_compras',
    });

    console.log('✅ Conectado ao banco de dados\n');

    // Verificar se tabela existe
    const [tables] = await connection.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'portal_das_compras' AND TABLE_NAME = 'orders'"
    );
    
    if (tables.length === 0) {
      console.log('❌ Tabela "orders" NÃO existe!');
      console.log('\nTabelas disponíveis:');
      const [allTables] = await connection.execute(
        "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'portal_das_compras'"
      );
      allTables.forEach(t => console.log(`  - ${t.TABLE_NAME}`));
    } else {
      console.log('✅ Tabela "orders" existe\n');

      // Verificar estrutura
      const [columns] = await connection.execute('DESCRIBE portal_das_compras.orders');
      console.log('Colunas da tabela:');
      columns.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });

      // Tentar inserir um registro de teste
      console.log('\n🧪 Tentando inserir registro de teste...');
      try {
        const result = await connection.execute(
          `INSERT INTO orders (customerName, customerEmail, customerPhone, customerCpf, addressCep, addressStreet, addressNumber, addressNeighborhood, addressCity, addressState, items, total, paymentMethod) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'Teste Cliente',
            'teste@example.com',
            '11987654321',
            '12345678901',
            '01310100',
            'Rua Teste',
            '123',
            'Bairro',
            'São Paulo',
            'SP',
            JSON.stringify([{productId: 1, name: 'Produto', price: 100, quantity: 1}]),
            '100.00',
            'pix'
          ]
        );
        console.log('✅ Inserção bem-sucedida!');
        console.log('ID gerado:', result[0].insertId);
      } catch (insertError) {
        console.log('❌ Erro ao inserir:');
        console.log('  Mensagem:', insertError.message);
        console.log('  Código:', insertError.code);
        console.log('  SQL:', insertError.sql);
      }
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
  }
}

checkDatabase();

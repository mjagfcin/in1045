import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'provas_db';

async function initDatabase() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('Conectando ao MongoDB...');
    await client.connect();
    console.log('✓ Conexão estabelecida\n');

    const db = client.db(DB_NAME);

    // Definir coleções a criar
    const collections = [
      {
        name: 'questoes',
        indexes: [
          { key: { texto: 'text' } },
          { key: { disciplina: 1, professor: 1 } }
        ]
      },
      {
        name: 'provas',
        indexes: [
          { key: { professor: 1, data_criacao: -1 } },
          { key: { disciplina: 1 } }
        ]
      },
      {
        name: 'provas_geradas',
        indexes: [
          { key: { id_prova: 1, data_geracao: -1 } }
        ]
      },
      {
        name: 'resultados_provas',
        indexes: [
          { key: { id_prova_gerada: 1, id_aluno: 1 } },
          { key: { data_correcao: -1 } }
        ]
      },
      {
        name: 'relatorios',
        indexes: [
          { key: { id_prova: 1, data_criacao: -1 } }
        ]
      }
    ];

    console.log('Criando coleções e índices...\n');

    for (const col of collections) {
      try {
        // Verificar se coleção já existe
        const existing = await db.listCollections({ name: col.name }).toArray();
        
        if (existing.length === 0) {
          // Criar coleção
          await db.createCollection(col.name);
          console.log(`✓ Coleção '${col.name}' criada`);
        } else {
          console.log(`✓ Coleção '${col.name}' já existe`);
        }

        // Criar índices
        const collection = db.collection(col.name);
        if (col.indexes) {
          for (const indexSpec of col.indexes) {
            try {
              await collection.createIndex(indexSpec.key);
            } catch (e) {
              // Índice pode já existir
            }
          }
        }
      } catch (error) {
        console.error(`✗ Erro ao processar '${col.name}':`, error.message);
        throw error;
      }
    }

    console.log('\n✓ Banco de dados inicializado com sucesso!\n');
    console.log('Coleções criadas:');
    collections.forEach(col => console.log(`  • ${col.name}`));
    
    console.log('\n✓ Banco: provas_db');
    console.log('✓ URL: mongodb://localhost:27017/provas_db\n');

  } catch (error) {
    console.error('✗ Erro:', error.message);
    console.error('\nVerifique se MongoDB está rodando em mongodb://localhost:27017');
    process.exit(1);
  } finally {
    await client.close();
    console.log('✓ Desconectado\n');
  }
}

initDatabase();

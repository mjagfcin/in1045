import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://localhost:27017/provas_db';

async function initDatabase() {
  try {
    console.log('Conectando ao MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      retryWrites: false,
      w: 'majority'
    });
    
    const db = mongoose.connection;
    console.log('✓ Conexão estabelecida\n');

    // Coleções e seus esquemas
    const collections = [
      {
        name: 'questoes',
        schema: {
          disciplina: String,
          professor: String,
          texto: String,
          alternativas: [{
            letra: String,
            texto: String,
            correta: Boolean
          }],
          criado_em: { type: Date, default: Date.now }
        },
        indexes: [
          { texto: 'text' },
          { disciplina: 1, professor: 1 }
        ]
      },
      {
        name: 'provas',
        schema: {
          titulo: String,
          disciplina: String,
          professor: String,
          questoes: [mongoose.Schema.Types.ObjectId],
          data_criacao: { type: Date, default: Date.now }
        },
        indexes: [
          { professor: 1, data_criacao: -1 },
          { disciplina: 1 }
        ]
      },
      {
        name: 'provas_geradas',
        schema: {
          id_prova: mongoose.Schema.Types.ObjectId,
          numero: Number,
          ordem_questoes: [Number],
          ordem_alternativas: [[Number]],
          data_geracao: { type: Date, default: Date.now }
        },
        indexes: [
          { id_prova: 1, data_geracao: -1 }
        ]
      },
      {
        name: 'resultados_provas',
        schema: {
          id_prova_gerada: mongoose.Schema.Types.ObjectId,
          id_aluno: String,
          respostas: [String],
          modo_correcao: String,
          nota_final: Number,
          data_correcao: { type: Date, default: Date.now }
        },
        indexes: [
          { id_prova_gerada: 1, id_aluno: 1 },
          { data_correcao: -1 }
        ]
      },
      {
        name: 'relatorios',
        schema: {
          id_prova: mongoose.Schema.Types.ObjectId,
          media: Number,
          desvio_padrao: Number,
          taxa_aprovacao: Number,
          total_alunos: Number,
          data_criacao: { type: Date, default: Date.now }
        },
        indexes: [
          { id_prova: 1, data_criacao: -1 }
        ]
      }
    ];

    console.log('Criando coleções e índices...\n');

    for (const col of collections) {
      try {
        // Criar coleção
        await db.createCollection(col.name);
        console.log(`✓ Coleção '${col.name}' criada`);

        // Criar índices
        const collection = db.collection(col.name);
        if (col.indexes) {
          for (const index of col.indexes) {
            try {
              await collection.createIndex(index);
            } catch (e) {
              // Índice pode já existir
            }
          }
        }
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`✓ Coleção '${col.name}' já existe`);
        } else {
          throw error;
        }
      }
    }

    console.log('\n✓ Banco de dados inicializado com sucesso!\n');
    console.log('Coleções criadas:');
    collections.forEach(col => console.log(`  • ${col.name}`));

    await mongoose.disconnect();
    console.log('\n✓ Desconectado\n');
    
  } catch (error) {
    console.error('✗ Erro:', error.message);
    console.error('\nVerifique se MongoDB está rodando em mongodb://localhost:27017');
    process.exit(1);
  }
}

initDatabase();

import { spawn } from 'child_process';
import { MongoClient } from 'mongodb';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'provas_db';

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║      Sistema de Gerenciamento de Provas - Inicialização    ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(prefix, message, color = colors.reset) {
  console.log(`${color}${prefix}${colors.reset} ${message}`);
}

async function checkMongoDB() {
  log('📋', 'Verificando MongoDB...');
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    log('✓', 'MongoDB está acessível', colors.green);
    await client.close();
    return true;
  } catch (error) {
    log('✗', `MongoDB não está acessível: ${error.message}`, colors.red);
    log('ℹ', 'Certifique-se de que MongoDB está rodando localmente em docker', colors.yellow);
    return false;
  }
}

async function initializeDatabase() {
  log('📋', 'Inicializando banco de dados...');
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    
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

    for (const col of collections) {
      const exists = await db.listCollections({ name: col.name }).hasNext();
      
      if (!exists) {
        await db.createCollection(col.name);
        log('  ✓', `Coleção '${col.name}' criada`);
      }

      for (const index of col.indexes) {
        await db.collection(col.name).createIndex(index.key);
      }
    }

    log('✓', 'Banco de dados inicializado com sucesso', colors.green);
    await client.close();
    return true;
  } catch (error) {
    log('✗', `Erro ao inicializar banco: ${error.message}`, colors.red);
    return false;
  }
}

function startService(name, cwd, command, args = []) {
  return new Promise((resolve) => {
    log('🚀', `Iniciando ${name}...`);
    
    const service = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true,
      detached: false
    });

    service.on('error', (error) => {
      log('✗', `Erro ao iniciar ${name}: ${error.message}`, colors.red);
      resolve(false);
    });

    // Dar tempo para o serviço iniciar
    setTimeout(() => {
      log('✓', `${name} iniciado com sucesso`, colors.green);
      resolve(true);
    }, 3000);
  });
}

async function main() {
  try {
    // Step 1: Verificar MongoDB
    const mongoOk = await checkMongoDB();
    if (!mongoOk) {
      process.exit(1);
    }

    console.log();

    // Step 2: Inicializar banco de dados
    const dbOk = await initializeDatabase();
    if (!dbOk) {
      process.exit(1);
    }

    console.log();

    // Step 3: Iniciar serviços em paralelo
    log('📋', 'Iniciando serviços...\n');

    const backendPath = path.join(__dirname, 'backend');
    const frontendPath = path.join(__dirname, 'frontend');

    // Iniciar backend e frontend em paralelo
    await Promise.all([
      startService('Backend', backendPath, 'npm', ['run', 'dev']),
      startService('Frontend', frontendPath, 'npm', ['run', 'dev'])
    ]);

    console.log();
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                    SISTEMA INICIADO COM SUCESSO            ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║  🌐 Frontend:        ${colors.bright}http://localhost:3000${colors.reset}                   ║`);
    console.log(`║  🔌 Backend:         ${colors.bright}http://localhost:3001${colors.reset}                   ║`);
    console.log(`║  💾 MongoDB:         ${colors.bright}mongodb://localhost:27017${colors.reset}          ║`);
    console.log('║                                                            ║');
    console.log('║  Para rodar testes de aceitação em outro terminal:          ║');
    console.log(`║  ${colors.bright}npm run test:acceptance${colors.reset}                                  ║`);
    console.log('║                                                            ║');
    console.log('║  Para rodar testes unitários:                              ║');
    console.log(`║  ${colors.bright}npm test${colors.reset}                                            ║`);
    console.log('║                                                            ║');
    console.log('║  Pressione Ctrl+C para parar os serviços                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

  } catch (error) {
    log('✗', `Erro crítico: ${error.message}`, colors.red);
    process.exit(1);
  }
}

main();

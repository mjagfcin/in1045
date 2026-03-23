import app from './app';
import env from './config/env';
import logger from './config/logger';
import { connectDB } from './config/database';

const PORT = env.PORT || 3001;

const startServer = async () => {
  try {
    // Conectar ao MongoDB
    await connectDB();

    // Iniciar servidor Express
    app.listen(PORT, () => {
      logger.info(`Servidor iniciado`, {
        porta: PORT,
        ambiente: env.NODE_ENV,
        mongo: env.MONGODB_URI,
      });
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Falha ao iniciar servidor', {
      erro: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM recebido, encerrando graciosamente...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT recebido, encerrando graciosamente...');
  process.exit(0);
});

startServer();

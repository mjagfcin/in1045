import mongoose from 'mongoose';
import logger from './logger';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sistema-provas';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    logger.info('MongoDB conectado com sucesso', { uri: mongoUri });
  } catch (error) {
    logger.error('Erro ao conectar MongoDB', {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
};

const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB desconectado com sucesso');
  } catch (error) {
    logger.error('Erro ao desconectar MongoDB', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};

export { connectDB, disconnectDB };

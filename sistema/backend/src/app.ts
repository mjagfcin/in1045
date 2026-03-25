import express, { Request, Response } from 'express';
import cors from 'cors';
import env from './config/env';

// Importar rutas
import questoesRoutes from './routes/questoes';
import provasRoutes from './routes/provas';
import pdfRoutes from './routes/pdf';
import correcaoRoutes from './routes/correcao';
import relatorioRoutes from './routes/relatorio';

// Importar middlewares
import errorHandler from './middleware/errorHandler';
import requestLogger from './middleware/requestLogger';

const app = express();

// Middlewares globais
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Middleware de log
app.use(requestLogger);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    sucesso: true,
    mensagem: 'Servidor está online',
    timestamp: new Date().toISOString(),
  });
});

// Rotas da API
app.use('/api/questoes', questoesRoutes);
app.use('/api/provas', provasRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/correcao', correcaoRoutes);
app.use('/api/relatorios', relatorioRoutes);

// Rota 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    sucesso: false,
    mensagem: 'Endpoint não encontrado',
    caminho: req.path,
  });
});

// Middleware de erro (deve ser o último)
app.use(errorHandler);

export default app;

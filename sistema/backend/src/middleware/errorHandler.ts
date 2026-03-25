import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

interface CustomError extends Error {
  statusCode?: number;
}

const errorHandler = (err: CustomError, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const mensagem = err.message || 'Erro interno do servidor';

  logger.error('Erro capturado pelo middleware', {
    erro: mensagem,
    statusCode,
    caminho: req.path,
    metodo: req.method,
  });

  res.status(statusCode).json({
    sucesso: false,
    mensagem, 
    erro: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

export default errorHandler;

import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const inicio = Date.now();

  // Log quando a resposta é enviada
  res.on('finish', () => {
    const duracao = Date.now() - inicio;
    logger.info('Requisição processada', {
      metodo: req.method,
      caminho: req.path,
      statusCode: res.statusCode,
      duracao: `${duracao}ms`,
    });
  });

  next();
};

export default requestLogger;

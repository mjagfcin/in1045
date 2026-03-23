import { Router } from 'express';
import relatorioController from '../controllers/relatorioController';

const router = Router();

// POST gerar relatório
router.post('/', relatorioController.gerar.bind(relatorioController));

// GET relatórios de uma prova
router.get('/:idProva', relatorioController.obterRelatorios.bind(relatorioController));

// GET relatório específico
router.get('/detalhe/:id', relatorioController.obterRelatorio.bind(relatorioController));

export default router;

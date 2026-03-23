import { Router } from 'express';
import correcaoController from '../controllers/correcaoController';

const router = Router();

// POST importar respostas e corrigir
router.post('/importar', correcaoController.importarRespostas.bind(correcaoController));

// GET resultados de uma prova
router.get('/:idProva/resultados', correcaoController.obterResultados.bind(correcaoController));

// GET estatísticas de uma prova
router.get('/:idProva/estatisticas', correcaoController.obterEstatisticas.bind(correcaoController));

// GET resultado específico
router.get('/resultado/:id', correcaoController.obterResultado.bind(correcaoController));

export default router;

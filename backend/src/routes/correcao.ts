import { Router } from 'express';
import correcaoController from '../controllers/correcaoController';

const router = Router();

// POST corrigir provas em lote (upload de CSVs)
router.post('/corrigir', correcaoController.uploadArquivos, correcaoController.corrigirProvas.bind(correcaoController));

// GET relatório de notas da turma
router.get('/relatorio/:provaId', correcaoController.gerarRelatorioNotas.bind(correcaoController));

// GET exportar relatório como CSV
router.get('/relatorio/:provaId/csv', correcaoController.exportarRelatorioCSV.bind(correcaoController));

// GET exportar relatório como PDF
router.get('/relatorio/:provaId/pdf', correcaoController.exportarRelatorioPDF.bind(correcaoController));

// Rotas de relatórios e resultados
router.get('/:idProva/resultados', correcaoController.obterResultados.bind(correcaoController));
router.get('/:idProva/estatisticas', correcaoController.obterEstatisticas.bind(correcaoController));
router.get('/resultado/:id', correcaoController.obterResultado.bind(correcaoController));

export default router;

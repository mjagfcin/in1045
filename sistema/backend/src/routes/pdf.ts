import { Router } from 'express';
import pdfController from '../controllers/pdfController';

const router = Router();

// POST gerar múltiplos PDFs
router.post('/gerar', pdfController.gerarPDFs.bind(pdfController));

// GET baixar múltiplos PDFs em ZIP
router.get('/zip', pdfController.baixarPDFsComoZip.bind(pdfController));

// POST gerar gabarito CSV
router.post('/gabarito', pdfController.gerarGabarito.bind(pdfController));

export default router;

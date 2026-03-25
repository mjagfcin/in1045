import { Router } from 'express';
import questaoController from '../controllers/questaoController';

const router = Router();

// GET todas as questões (com paginação e busca)
router.get('/', questaoController.getAll.bind(questaoController));

// POST criar nova questão
router.post('/', questaoController.create.bind(questaoController));

// GET questão por ID
router.get('/:id', questaoController.getById.bind(questaoController));

// PUT atualizar questão
router.put('/:id', questaoController.update.bind(questaoController));

// DELETE questão (soft delete)
router.delete('/:id', questaoController.delete.bind(questaoController));

export default router;

import { Router } from 'express';
import provaController from '../controllers/provaController';

const router = Router();

// GET todas as provas
router.get('/', provaController.getAll.bind(provaController));

// POST criar nova prova
router.post('/', provaController.create.bind(provaController));

// GET prova por ID
router.get('/:id', provaController.getById.bind(provaController));

// PUT atualizar prova
router.put('/:id', provaController.update.bind(provaController));

// DELETE prova
router.delete('/:id', provaController.delete.bind(provaController));

export default router;

import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import {
  createCard,
  getCard,
  updateCard,
  deleteCard,
  reorderCards,
  searchCards,
} from '../controllers/cardController';

const router = Router();

router.get('/search', searchCards);
router.post(
  '/',
  [
    body('list_id').isUUID().withMessage('Valid list_id is required'),
    body('title').trim().notEmpty().withMessage('Title is required'),
  ],
  validate,
  createCard
);
router.patch('/reorder', reorderCards);
router.get('/:id', getCard);
router.patch('/:id', updateCard);
router.delete('/:id', deleteCard);

export default router;

import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import {
  createList,
  updateList,
  deleteList,
  reorderLists,
} from '../controllers/listController';

const router = Router();

router.post(
  '/',
  [
    body('board_id').isUUID().withMessage('Valid board_id is required'),
    body('title').trim().notEmpty().withMessage('Title is required'),
  ],
  validate,
  createList
);
router.patch('/reorder', reorderLists);
router.patch('/:id', updateList);
router.delete('/:id', deleteList);

export default router;

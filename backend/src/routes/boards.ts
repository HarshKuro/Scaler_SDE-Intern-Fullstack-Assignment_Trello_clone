import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import {
  getBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  getBoardActivity,
} from '../controllers/boardController';

const router = Router();

router.get('/', getBoards);
router.get('/:id', getBoard);
router.post(
  '/',
  [body('title').trim().notEmpty().withMessage('Title is required')],
  validate,
  createBoard
);
router.patch('/:id', updateBoard);
router.delete('/:id', deleteBoard);
router.get('/:id/activity', getBoardActivity);

export default router;

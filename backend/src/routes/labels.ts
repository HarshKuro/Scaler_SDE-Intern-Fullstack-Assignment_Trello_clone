import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import {
  getBoardLabels,
  createLabel,
  updateLabel,
  deleteLabel,
  addLabelToCard,
  removeLabelFromCard,
} from '../controllers/labelController';

const router = Router();

router.get('/boards/:id/labels', getBoardLabels);
router.post(
  '/boards/:id/labels',
  [body('color').notEmpty().withMessage('Color is required')],
  validate,
  createLabel
);
router.patch('/labels/:id', updateLabel);
router.delete('/labels/:id', deleteLabel);
router.post('/cards/:id/labels/:labelId', addLabelToCard);
router.delete('/cards/:id/labels/:labelId', removeLabelFromCard);

export default router;

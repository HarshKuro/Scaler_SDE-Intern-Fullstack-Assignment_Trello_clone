import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import {
  createChecklist,
  updateChecklist,
  deleteChecklist,
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
} from '../controllers/checklistController';

const router = Router();

router.post('/cards/:id/checklists', createChecklist);
router.patch('/checklists/:id', updateChecklist);
router.delete('/checklists/:id', deleteChecklist);
router.post(
  '/checklists/:id/items',
  [body('title').trim().notEmpty().withMessage('Title is required')],
  validate,
  addChecklistItem
);
router.patch('/checklist-items/:id', updateChecklistItem);
router.delete('/checklist-items/:id', deleteChecklistItem);

export default router;

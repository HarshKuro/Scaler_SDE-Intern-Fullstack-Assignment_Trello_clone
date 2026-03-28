import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import {
  getComments,
  addComment,
  updateComment,
  deleteComment,
} from '../controllers/commentController';

const router = Router();

router.get('/cards/:id/comments', getComments);
router.post(
  '/cards/:id/comments',
  [
    body('member_id').isUUID().withMessage('Valid member_id is required'),
    body('text').trim().notEmpty().withMessage('Comment text is required'),
  ],
  validate,
  addComment
);
router.patch('/comments/:id', updateComment);
router.delete('/comments/:id', deleteComment);

export default router;

import { Router } from 'express';
import {
  getMembers,
  addMemberToCard,
  removeMemberFromCard,
} from '../controllers/memberController';

const router = Router();

router.get('/', getMembers);
router.post('/:memberId/cards/:id', addMemberToCard);
router.delete('/:memberId/cards/:id', removeMemberFromCard);

export default router;

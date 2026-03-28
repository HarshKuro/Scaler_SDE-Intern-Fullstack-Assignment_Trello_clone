import { Router } from 'express';
import { addAttachment, deleteAttachment, upload } from '../controllers/attachmentController';

const router = Router();

router.post('/cards/:id/attachments', upload.single('file'), addAttachment);
router.delete('/attachments/:id', deleteAttachment);

export default router;

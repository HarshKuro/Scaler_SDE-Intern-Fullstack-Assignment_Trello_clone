import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

const UPLOADS_DIR = path.join(__dirname, '../../uploads/attachments');

// Ensure uploads directory exists
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const addAttachment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const card_id = req.params.id as string;
    const file = req.file;

    if (!file) {
      res.status(400).json({ data: null, error: { message: 'No file provided' } });
      return;
    }

    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const cardDir = path.join(UPLOADS_DIR, card_id);
    fs.mkdirSync(cardDir, { recursive: true });

    const filePath = path.join(cardDir, filename);
    fs.writeFileSync(filePath, file.buffer);

    // Build public URL relative to API server
    const publicUrl = `/uploads/attachments/${card_id}/${filename}`;

    const { data, error } = await db
      .from('attachments')
      .insert({
        card_id,
        file_name: file.originalname,
        url: publicUrl,
        mime_type: file.mimetype,
        file_size: file.size,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ data, error: null });
  } catch (err) {
    next(err);
  }
};

export const deleteAttachment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const { data: attachment } = await db
      .from('attachments')
      .select('url')
      .eq('id', id)
      .single();

    // Delete physical file if it's a local upload
    if (attachment?.url && (attachment.url as string).startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '../..', attachment.url as string);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    const { error } = await db.from('attachments').delete().eq('id', id);
    if (error) throw error;
    res.json({ data: { id }, error: null });
  } catch (err) {
    next(err);
  }
};

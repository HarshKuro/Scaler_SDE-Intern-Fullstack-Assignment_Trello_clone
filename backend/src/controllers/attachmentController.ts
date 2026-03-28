import { Request, Response, NextFunction } from 'express';
import { supabase } from '../db/supabase';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const addAttachment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: card_id } = req.params;
    const file = req.file;

    if (!file) {
      res.status(400).json({ data: null, error: { message: 'No file provided' } });
      return;
    }

    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const filePath = `attachments/${card_id}/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('attachments')
      .getPublicUrl(filePath);

    const { data, error } = await supabase
      .from('attachments')
      .insert({
        card_id,
        file_name: file.originalname,
        url: publicUrlData.publicUrl,
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

    const { data: attachment } = await supabase
      .from('attachments')
      .select('url')
      .eq('id', id)
      .single();

    if (attachment?.url) {
      const urlPath = new URL(attachment.url).pathname;
      const storagePath = urlPath.split('/storage/v1/object/public/attachments/')[1];
      if (storagePath) {
        await supabase.storage.from('attachments').remove([storagePath]);
      }
    }

    const { error } = await supabase.from('attachments').delete().eq('id', id);
    if (error) throw error;
    res.json({ data: { id }, error: null });
  } catch (err) {
    next(err);
  }
};

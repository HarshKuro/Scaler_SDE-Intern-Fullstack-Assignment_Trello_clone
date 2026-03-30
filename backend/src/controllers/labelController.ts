import { Request, Response, NextFunction } from 'express';
import { db } from '../db';

export const getBoardLabels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { data, error } = await db
      .from('labels')
      .select('*')
      .eq('board_id', id)
      .order('created_at');

    if (error) throw error;
    res.json({ data, error: null });
  } catch (err) {
    next(err);
  }
};

export const createLabel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: board_id } = req.params;
    const { name, color } = req.body;

    const { data, error } = await db
      .from('labels')
      .insert({ board_id, name: name || '', color })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ data, error: null });
  } catch (err) {
    next(err);
  }
};

export const updateLabel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await db
      .from('labels')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ data, error: null });
  } catch (err) {
    next(err);
  }
};

export const deleteLabel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { error } = await db.from('labels').delete().eq('id', id);
    if (error) throw error;
    res.json({ data: { id }, error: null });
  } catch (err) {
    next(err);
  }
};

export const addLabelToCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: card_id, labelId: label_id } = req.params;

    const { data, error } = await db
      .from('card_labels')
      .insert({ card_id, label_id })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ data, error: null });
  } catch (err) {
    next(err);
  }
};

export const removeLabelFromCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: card_id, labelId: label_id } = req.params;

    const { error } = await db
      .from('card_labels')
      .delete()
      .eq('card_id', card_id)
      .eq('label_id', label_id);

    if (error) throw error;
    res.json({ data: { card_id, label_id }, error: null });
  } catch (err) {
    next(err);
  }
};

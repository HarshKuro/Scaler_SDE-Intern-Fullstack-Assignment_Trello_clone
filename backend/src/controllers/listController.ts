import { Request, Response, NextFunction } from 'express';
import { db } from '../db';

export const createList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { board_id, title, position } = req.body;

    let pos = position;
    if (pos === undefined) {
      const { data: lastList } = await db
        .from('lists')
        .select('position')
        .eq('board_id', board_id)
        .order('position', { ascending: false })
        .limit(1)
        .single();
      pos = lastList ? lastList.position + 1000 : 1000;
    }

    const { data, error } = await db
      .from('lists')
      .insert({ board_id, title, position: pos })
      .select()
      .single();

    if (error) throw error;

    await db.from('activity_log').insert({
      board_id,
      member_id: null,
      action: 'list_created',
      data: { list_title: title },
    });

    res.status(201).json({ data, error: null });
  } catch (err) {
    next(err);
  }
};

export const updateList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await db
      .from('lists')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ data, error: null });
  } catch (err) {
    next(err);
  }
};

export const deleteList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { error } = await db.from('lists').delete().eq('id', id);
    if (error) throw error;
    res.json({ data: { id }, error: null });
  } catch (err) {
    next(err);
  }
};

export const reorderLists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items } = req.body;

    const updates = items.map((item: { id: string; position: number }) =>
      db
        .from('lists')
        .update({ position: item.position, updated_at: new Date().toISOString() })
        .eq('id', item.id),
    );

    await Promise.all(updates);
    res.json({ data: { updated: items.length }, error: null });
  } catch (err) {
    next(err);
  }
};

import { Request, Response, NextFunction } from 'express';
import { supabase } from '../db/supabase';

export const createChecklist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: card_id } = req.params;
    const { title } = req.body;

    const { data: lastChecklist } = await supabase
      .from('checklists')
      .select('position')
      .eq('card_id', card_id)
      .order('position', { ascending: false })
      .limit(1)
      .single();

    const position = lastChecklist ? lastChecklist.position + 1000 : 1000;

    const { data, error } = await supabase
      .from('checklists')
      .insert({ card_id, title: title || 'Checklist', position })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ data, error: null });
  } catch (err) {
    next(err);
  }
};

export const updateChecklist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const { data, error } = await supabase
      .from('checklists')
      .update({ title })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ data, error: null });
  } catch (err) {
    next(err);
  }
};

export const deleteChecklist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('checklists').delete().eq('id', id);
    if (error) throw error;
    res.json({ data: { id }, error: null });
  } catch (err) {
    next(err);
  }
};

export const addChecklistItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: checklist_id } = req.params;
    const { title } = req.body;

    const { data: lastItem } = await supabase
      .from('checklist_items')
      .select('position')
      .eq('checklist_id', checklist_id)
      .order('position', { ascending: false })
      .limit(1)
      .single();

    const position = lastItem ? lastItem.position + 1000 : 1000;

    const { data, error } = await supabase
      .from('checklist_items')
      .insert({ checklist_id, title, position })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ data, error: null });
  } catch (err) {
    next(err);
  }
};

export const updateChecklistItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('checklist_items')
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

export const deleteChecklistItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('checklist_items').delete().eq('id', id);
    if (error) throw error;
    res.json({ data: { id }, error: null });
  } catch (err) {
    next(err);
  }
};

import { Request, Response, NextFunction } from 'express';
import { supabase } from '../db/supabase';

export const getComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: card_id } = req.params;

    const { data, error } = await supabase
      .from('comments')
      .select('*, member:member_id ( * )')
      .eq('card_id', card_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ data, error: null });
  } catch (err) {
    next(err);
  }
};

export const addComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: card_id } = req.params;
    const { member_id, text } = req.body;

    const { data, error } = await supabase
      .from('comments')
      .insert({ card_id, member_id, text })
      .select('*, member:member_id ( * )')
      .single();

    if (error) throw error;

    const { data: card } = await supabase
      .from('cards')
      .select('title, lists:list_id ( board_id )')
      .eq('id', card_id)
      .single();

    if (card?.lists) {
      await supabase.from('activity_log').insert({
        board_id: (card.lists as unknown as { board_id: string }).board_id,
        card_id,
        member_id,
        action: 'comment_added',
        data: { card_title: card.title },
      });
    }

    res.status(201).json({ data, error: null });
  } catch (err) {
    next(err);
  }
};

export const updateComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const { data, error } = await supabase
      .from('comments')
      .update({ text, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, member:member_id ( * )')
      .single();

    if (error) throw error;
    res.json({ data, error: null });
  } catch (err) {
    next(err);
  }
};

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (error) throw error;
    res.json({ data: { id }, error: null });
  } catch (err) {
    next(err);
  }
};

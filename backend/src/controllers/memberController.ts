import { Request, Response, NextFunction } from 'express';
import { supabase } from '../db/supabase';

export const getMembers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('full_name');

    if (error) throw error;
    res.json({ data, error: null });
  } catch (err) {
    next(err);
  }
};

export const addMemberToCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: card_id, memberId: member_id } = req.params;

    const { data, error } = await supabase
      .from('card_members')
      .insert({ card_id, member_id })
      .select()
      .single();

    if (error) throw error;

    const { data: card } = await supabase
      .from('cards')
      .select('title, lists:list_id ( board_id )')
      .eq('id', card_id)
      .single();

    const { data: member } = await supabase
      .from('members')
      .select('full_name')
      .eq('id', member_id)
      .single();

    if (card?.lists) {
      await supabase.from('activity_log').insert({
        board_id: (card.lists as unknown as { board_id: string }).board_id,
        card_id,
        member_id,
        action: 'member_assigned',
        data: { card_title: card.title, member_name: member?.full_name },
      });
    }

    res.status(201).json({ data, error: null });
  } catch (err) {
    next(err);
  }
};

export const removeMemberFromCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: card_id, memberId: member_id } = req.params;

    const { error } = await supabase
      .from('card_members')
      .delete()
      .eq('card_id', card_id)
      .eq('member_id', member_id);

    if (error) throw error;
    res.json({ data: { card_id, member_id }, error: null });
  } catch (err) {
    next(err);
  }
};

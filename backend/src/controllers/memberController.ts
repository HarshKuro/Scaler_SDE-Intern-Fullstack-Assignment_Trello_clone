import { Request, Response, NextFunction } from 'express';
import { db, queryOne } from '../db';

export const getMembers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await db
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

    const { data, error } = await db
      .from('card_members')
      .insert({ card_id, member_id })
      .select()
      .single();

    if (error) throw error;

    // Get card + board_id and member name for activity log
    const card = await queryOne<{ title: string; board_id: string }>(
      'SELECT c.title, l.board_id FROM cards c JOIN lists l ON c.list_id = l.id WHERE c.id = $1',
      [card_id],
    );

    const member = await queryOne<{ full_name: string }>(
      'SELECT full_name FROM members WHERE id = $1',
      [member_id],
    );

    if (card) {
      await db.from('activity_log').insert({
        board_id: card.board_id,
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

    const { error } = await db
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

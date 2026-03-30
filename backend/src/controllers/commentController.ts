import { Request, Response, NextFunction } from 'express';
import { db, query, queryOne } from '../db';

export const getComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: card_id } = req.params;

    const data = await query(
      `SELECT c.*, row_to_json(m.*) as member
       FROM comments c
       LEFT JOIN members m ON c.member_id = m.id
       WHERE c.card_id = $1
       ORDER BY c.created_at DESC`,
      [card_id],
    );

    res.json({ data, error: null });
  } catch (err) {
    next(err);
  }
};

export const addComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: card_id } = req.params;
    const { member_id, text } = req.body;

    // Insert and return with member join
    const comment = await queryOne(
      `WITH inserted AS (
        INSERT INTO comments (card_id, member_id, text) VALUES ($1, $2, $3) RETURNING *
      )
      SELECT i.*, row_to_json(m.*) as member
      FROM inserted i
      LEFT JOIN members m ON i.member_id = m.id`,
      [card_id, member_id, text],
    );

    // Activity log
    const card = await queryOne<{ title: string; board_id: string }>(
      'SELECT c.title, l.board_id FROM cards c JOIN lists l ON c.list_id = l.id WHERE c.id = $1',
      [card_id],
    );

    if (card) {
      await db.from('activity_log').insert({
        board_id: card.board_id,
        card_id,
        member_id,
        action: 'comment_added',
        data: { card_title: card.title },
      });
    }

    res.status(201).json({ data: comment, error: null });
  } catch (err) {
    next(err);
  }
};

export const updateComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const comment = await queryOne(
      `WITH updated AS (
        UPDATE comments SET text = $1, updated_at = NOW() WHERE id = $2 RETURNING *
      )
      SELECT u.*, row_to_json(m.*) as member
      FROM updated u
      LEFT JOIN members m ON u.member_id = m.id`,
      [text, id],
    );

    res.json({ data: comment, error: null });
  } catch (err) {
    next(err);
  }
};

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { error } = await db.from('comments').delete().eq('id', id);
    if (error) throw error;
    res.json({ data: { id }, error: null });
  } catch (err) {
    next(err);
  }
};

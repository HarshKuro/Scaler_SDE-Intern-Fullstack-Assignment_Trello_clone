import { Request, Response, NextFunction } from 'express';
import { db, query, queryOne } from '../db';

export const createCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { list_id, title, position } = req.body;

    let pos = position;
    if (pos === undefined) {
      const { data: lastCard } = await db
        .from('cards')
        .select('position')
        .eq('list_id', list_id)
        .order('position', { ascending: false })
        .limit(1)
        .single();
      pos = lastCard ? lastCard.position + 1000 : 1000;
    }

    const { data, error } = await db
      .from('cards')
      .insert({ list_id, title, position: pos })
      .select()
      .single();

    if (error) throw error;

    const list = await queryOne<{ board_id: string; title: string }>(
      'SELECT board_id, title FROM lists WHERE id = $1',
      [list_id],
    );

    if (list) {
      await db.from('activity_log').insert({
        board_id: list.board_id,
        card_id: data.id,
        member_id: null,
        action: 'card_created',
        data: { card_title: title, list_title: list.title },
      });
    }

    res.status(201).json({ data, error: null });
  } catch (err) {
    next(err);
  }
};

export const getCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Card + board_id from list
    const card = await queryOne(
      'SELECT c.*, l.board_id FROM cards c JOIN lists l ON c.list_id = l.id WHERE c.id = $1',
      [id],
    );
    if (!card) {
      res.status(404).json({ data: null, error: { message: 'Card not found' } });
      return;
    }

    // Fetch all relations in parallel
    const [labels, members, checklists, attachments, comments] = await Promise.all([
      query(
        `SELECT l.* FROM card_labels cl JOIN labels l ON cl.label_id = l.id WHERE cl.card_id = $1`,
        [id],
      ),
      query(
        `SELECT m.* FROM card_members cm JOIN members m ON cm.member_id = m.id WHERE cm.card_id = $1`,
        [id],
      ),
      query('SELECT * FROM checklists WHERE card_id = $1 ORDER BY position', [id]),
      query('SELECT * FROM attachments WHERE card_id = $1 ORDER BY created_at', [id]),
      query(
        `SELECT c.*, row_to_json(m.*) as member FROM comments c
         LEFT JOIN members m ON c.member_id = m.id
         WHERE c.card_id = $1 ORDER BY c.created_at DESC`,
        [id],
      ),
    ]);

    // Checklist items
    const checklistIds = checklists.map((cl: Record<string, unknown>) => cl.id);
    const checklistItems =
      checklistIds.length > 0
        ? await query(
            'SELECT * FROM checklist_items WHERE checklist_id = ANY($1) ORDER BY position',
            [checklistIds],
          )
        : [];

    const checklistsWithItems = checklists.map((cl: Record<string, unknown>) => ({
      ...cl,
      items: (checklistItems as Record<string, unknown>[]).filter(
        (i) => i.checklist_id === cl.id,
      ),
    }));

    res.json({
      data: {
        ...card,
        labels,
        members,
        checklists: checklistsWithItems,
        attachments,
        comments,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Get old card with list info for activity logging
    const oldCard = await queryOne<Record<string, unknown>>(
      `SELECT c.*, l.board_id, l.title as list_title FROM cards c
       JOIN lists l ON c.list_id = l.id WHERE c.id = $1`,
      [id],
    );

    const { data, error } = await db
      .from('cards')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (oldCard) {
      const boardId = oldCard.board_id as string;

      if (updates.list_id && updates.list_id !== oldCard.list_id) {
        const newList = await queryOne<{ title: string }>(
          'SELECT title FROM lists WHERE id = $1',
          [updates.list_id],
        );

        await db.from('activity_log').insert({
          board_id: boardId,
          card_id: id,
          action: 'card_moved',
          data: {
            card_title: oldCard.title,
            from_list: oldCard.list_title,
            to_list: newList?.title,
          },
        });
      }

      if (updates.due_date !== undefined) {
        await db.from('activity_log').insert({
          board_id: boardId,
          card_id: id,
          action: 'due_date_changed',
          data: { card_title: oldCard.title, due_date: updates.due_date },
        });
      }
    }

    res.json({ data, error: null });
  } catch (err) {
    next(err);
  }
};

export const deleteCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { error } = await db.from('cards').delete().eq('id', id);
    if (error) throw error;
    res.json({ data: { id }, error: null });
  } catch (err) {
    next(err);
  }
};

export const reorderCards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items } = req.body;

    const updates = items.map((item: { id: string; position: number; list_id?: string }) => {
      const updateData: Record<string, unknown> = {
        position: item.position,
        updated_at: new Date().toISOString(),
      };
      if (item.list_id) {
        updateData.list_id = item.list_id;
      }
      return db.from('cards').update(updateData).eq('id', item.id);
    });

    await Promise.all(updates);
    res.json({ data: { updated: items.length }, error: null });
  } catch (err) {
    next(err);
  }
};

export const searchCards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, board_id } = req.query;

    if (!q || typeof q !== 'string') {
      res.json({ data: [], error: null });
      return;
    }

    let sql = `SELECT c.*, l.board_id, l.title as list_title
               FROM cards c JOIN lists l ON c.list_id = l.id
               WHERE c.title ILIKE $1 AND c.is_archived = false`;
    const params: unknown[] = [`%${q}%`];

    if (board_id && typeof board_id === 'string') {
      sql += ' AND l.board_id = $2';
      params.push(board_id);
    }

    sql += ' LIMIT 20';

    const data = await query(sql, params);

    // Reshape to match frontend expectations: nest list info
    const shaped = (data as Record<string, unknown>[]).map((row) => {
      const { board_id: bId, list_title, ...card } = row;
      return { ...card, lists: { board_id: bId, title: list_title } };
    });

    res.json({ data: shaped, error: null });
  } catch (err) {
    next(err);
  }
};

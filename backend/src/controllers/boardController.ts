import { Request, Response, NextFunction } from 'express';
import { db, query, queryOne } from '../db';

export const getBoards = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await db
      .from('boards')
      .select('*')
      .eq('is_closed', false)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.json({ data, error: null });
  } catch (err) {
    next(err);
  }
};

export const getBoard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // 1. Board
    const board = await queryOne('SELECT * FROM boards WHERE id = $1', [id]);
    if (!board) {
      res.status(404).json({ data: null, error: { message: 'Board not found' } });
      return;
    }

    // 2. Lists
    const lists = await query(
      'SELECT * FROM lists WHERE board_id = $1 AND is_archived = false ORDER BY position',
      [id],
    );

    const listIds = lists.map((l: Record<string, unknown>) => l.id);

    if (listIds.length === 0) {
      const [boardLabels, allMembers] = await Promise.all([
        query('SELECT * FROM labels WHERE board_id = $1', [id]),
        query('SELECT * FROM members ORDER BY full_name'),
      ]);
      res.json({
        data: { ...board, lists: [], labels: boardLabels, members: allMembers },
        error: null,
      });
      return;
    }

    // 3. Cards for all those lists
    const cards = await query(
      'SELECT * FROM cards WHERE list_id = ANY($1) ORDER BY position',
      [listIds],
    );
    const cardIds = cards.map((c: Record<string, unknown>) => c.id);

    // 4-9. Batch fetch all relations for all cards
    const [cardLabels, cardMembers, checklists, attachments, comments, boardLabels, allMembers] =
      cardIds.length > 0
        ? await Promise.all([
            query(
              `SELECT cl.card_id, l.* FROM card_labels cl
               JOIN labels l ON cl.label_id = l.id
               WHERE cl.card_id = ANY($1)`,
              [cardIds],
            ),
            query(
              `SELECT cm.card_id, m.* FROM card_members cm
               JOIN members m ON cm.member_id = m.id
               WHERE cm.card_id = ANY($1)`,
              [cardIds],
            ),
            query('SELECT * FROM checklists WHERE card_id = ANY($1) ORDER BY position', [cardIds]),
            query('SELECT * FROM attachments WHERE card_id = ANY($1) ORDER BY created_at', [
              cardIds,
            ]),
            query(
              `SELECT c.*, row_to_json(m.*) as member FROM comments c
               LEFT JOIN members m ON c.member_id = m.id
               WHERE c.card_id = ANY($1) ORDER BY c.created_at DESC`,
              [cardIds],
            ),
            query('SELECT * FROM labels WHERE board_id = $1', [id]),
            query('SELECT * FROM members ORDER BY full_name'),
          ])
        : [[], [], [], [], [], 
           await query('SELECT * FROM labels WHERE board_id = $1', [id]),
           await query('SELECT * FROM members ORDER BY full_name')];

    // Checklist items
    const checklistIds = checklists.map((cl: Record<string, unknown>) => cl.id);
    const checklistItems =
      checklistIds.length > 0
        ? await query(
            'SELECT * FROM checklist_items WHERE checklist_id = ANY($1) ORDER BY position',
            [checklistIds],
          )
        : [];

    // Assemble nested structure
    const checklistMap = new Map<string, Record<string, unknown>[]>();
    for (const item of checklistItems as Record<string, unknown>[]) {
      const clId = item.checklist_id as string;
      if (!checklistMap.has(clId)) checklistMap.set(clId, []);
      checklistMap.get(clId)!.push(item);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cardMap = new Map<string, any>();
    for (const card of cards as Record<string, unknown>[]) {
      cardMap.set(card.id as string, {
        ...card,
        labels: [] as unknown[],
        members: [] as unknown[],
        checklists: [] as unknown[],
        attachments: [] as unknown[],
        comments: [] as unknown[],
      });
    }

    for (const cl of cardLabels as Record<string, unknown>[]) {
      const cardId = cl.card_id as string;
      const { card_id: _, ...label } = cl;
      cardMap.get(cardId)?.labels?.push(label);
    }
    for (const cm of cardMembers as Record<string, unknown>[]) {
      const cardId = cm.card_id as string;
      const { card_id: _, ...member } = cm;
      cardMap.get(cardId)?.members?.push(member);
    }
    for (const cl of checklists as Record<string, unknown>[]) {
      const cardId = cl.card_id as string;
      cardMap.get(cardId)?.checklists?.push({
        ...cl,
        items: checklistMap.get(cl.id as string) || [],
      });
    }
    for (const att of attachments as Record<string, unknown>[]) {
      cardMap.get(att.card_id as string)?.attachments?.push(att);
    }
    for (const com of comments as Record<string, unknown>[]) {
      cardMap.get(com.card_id as string)?.comments?.push(com);
    }

    // Attach cards to lists
    const assembledLists = lists.map((list: Record<string, unknown>) => ({
      ...list,
      cards: cards
        .filter((c: Record<string, unknown>) => c.list_id === list.id)
        .map((c: Record<string, unknown>) => cardMap.get(c.id as string)),
    }));

    res.json({
      data: { ...board, lists: assembledLists, labels: boardLabels, members: allMembers },
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

export const createBoard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, background } = req.body;

    const { data, error } = await db
      .from('boards')
      .insert({ title, background: background || '#0079bf' })
      .select()
      .single();

    if (error) throw error;

    const defaultLabels = [
      { board_id: data.id, name: '', color: '#61bd4f' },
      { board_id: data.id, name: '', color: '#f2d600' },
      { board_id: data.id, name: '', color: '#ff9f1a' },
      { board_id: data.id, name: '', color: '#eb5a46' },
      { board_id: data.id, name: '', color: '#c377e0' },
      { board_id: data.id, name: '', color: '#0079bf' },
    ];
    await db.from('labels').insert(defaultLabels);

    res.status(201).json({ data, error: null });
  } catch (err) {
    next(err);
  }
};

export const updateBoard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await db
      .from('boards')
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

export const deleteBoard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { error } = await db.from('boards').delete().eq('id', id);
    if (error) throw error;
    res.json({ data: { id }, error: null });
  } catch (err) {
    next(err);
  }
};

export const getBoardActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = await query(
      `SELECT a.*, row_to_json(m.*) as member
       FROM activity_log a
       LEFT JOIN members m ON a.member_id = m.id
       WHERE a.board_id = $1
       ORDER BY a.created_at DESC
       LIMIT 50`,
      [id],
    );

    res.json({ data, error: null });
  } catch (err) {
    next(err);
  }
};

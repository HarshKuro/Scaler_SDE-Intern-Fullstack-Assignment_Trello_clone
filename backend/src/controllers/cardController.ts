import { Request, Response, NextFunction } from 'express';
import { supabase } from '../db/supabase';

export const createCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { list_id, title, position } = req.body;

    let pos = position;
    if (pos === undefined) {
      const { data: lastCard } = await supabase
        .from('cards')
        .select('position')
        .eq('list_id', list_id)
        .order('position', { ascending: false })
        .limit(1)
        .single();
      pos = lastCard ? lastCard.position + 1000 : 1000;
    }

    const { data, error } = await supabase
      .from('cards')
      .insert({ list_id, title, position: pos })
      .select()
      .single();

    if (error) throw error;

    const { data: list } = await supabase
      .from('lists')
      .select('board_id, title')
      .eq('id', list_id)
      .single();

    if (list) {
      await supabase.from('activity_log').insert({
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

    const { data, error } = await supabase
      .from('cards')
      .select(`
        *,
        list:list_id ( board_id ),
        labels:card_labels ( ...labels ( * ) ),
        members:card_members ( ...members ( * ) ),
        checklists (
          *,
          items:checklist_items ( * )
        ),
        attachments ( * ),
        comments ( *, member:member_id ( * ) )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Flatten board_id from the nested list join
    const cardData = {
      ...data,
      board_id: (data.list as { board_id: string })?.board_id,
    };
    delete (cardData as Record<string, unknown>).list;

    res.json({ data: cardData, error: null });
  } catch (err) {
    next(err);
  }
};

export const updateCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: oldCard } = await supabase
      .from('cards')
      .select('*, lists:list_id ( board_id, title )')
      .eq('id', id)
      .single();

    const { data, error } = await supabase
      .from('cards')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (oldCard?.lists) {
      const boardId = (oldCard.lists as unknown as { board_id: string }).board_id;

      if (updates.list_id && updates.list_id !== oldCard.list_id) {
        const { data: newList } = await supabase
          .from('lists')
          .select('title')
          .eq('id', updates.list_id)
          .single();

        await supabase.from('activity_log').insert({
          board_id: boardId,
          card_id: id,
          action: 'card_moved',
          data: {
            card_title: oldCard.title,
            from_list: (oldCard.lists as unknown as { title: string }).title,
            to_list: newList?.title,
          },
        });
      }

      if (updates.due_date !== undefined) {
        await supabase.from('activity_log').insert({
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
    const { error } = await supabase.from('cards').delete().eq('id', id);
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
      return supabase.from('cards').update(updateData).eq('id', item.id);
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

    let query = supabase
      .from('cards')
      .select('*, lists:list_id ( board_id, title )')
      .ilike('title', `%${q}%`)
      .eq('is_archived', false)
      .limit(20);

    if (board_id && typeof board_id === 'string') {
      query = query.eq('lists.board_id', board_id);
    }

    const { data, error } = await query;
    if (error) throw error;

    const filtered = board_id
      ? data?.filter((card: Record<string, unknown>) => card.lists !== null)
      : data;

    res.json({ data: filtered, error: null });
  } catch (err) {
    next(err);
  }
};

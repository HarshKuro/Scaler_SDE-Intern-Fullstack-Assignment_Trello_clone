import { Request, Response, NextFunction } from 'express';
import { supabase } from '../db/supabase';

export const getBoards = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
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

    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('*')
      .eq('id', id)
      .single();

    if (boardError) throw boardError;

    const [listsRes, labelsRes, membersRes] = await Promise.all([
      supabase
        .from('lists')
        .select(`
          *,
          cards (
            *,
            labels:card_labels ( ...labels ( * ) ),
            members:card_members ( ...members ( * ) ),
            checklists (
              *,
              items:checklist_items ( * )
            ),
            attachments ( * ),
            comments ( *, member:member_id ( * ) )
          )
        `)
        .eq('board_id', id)
        .eq('is_archived', false)
        .order('position')
        .order('position', { referencedTable: 'cards' }),
      supabase.from('labels').select('*').eq('board_id', id),
      supabase.from('members').select('*'),
    ]);

    if (listsRes.error) throw listsRes.error;
    if (labelsRes.error) throw labelsRes.error;
    if (membersRes.error) throw membersRes.error;

    res.json({
      data: {
        ...board,
        lists: listsRes.data,
        labels: labelsRes.data,
        members: membersRes.data,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

export const createBoard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, background } = req.body;

    const { data, error } = await supabase
      .from('boards')
      .insert({
        title,
        background: background || '#0079bf',
      })
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
    await supabase.from('labels').insert(defaultLabels);

    res.status(201).json({ data, error: null });
  } catch (err) {
    next(err);
  }
};

export const updateBoard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
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
    const { error } = await supabase.from('boards').delete().eq('id', id);
    if (error) throw error;
    res.json({ data: { id }, error: null });
  } catch (err) {
    next(err);
  }
};

export const getBoardActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('activity_log')
      .select('*, member:member_id ( * )')
      .eq('board_id', id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json({ data, error: null });
  } catch (err) {
    next(err);
  }
};

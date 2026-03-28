export interface Member {
  id: string;
  full_name: string;
  email: string;
  avatar_color: string;
  initials: string;
  created_at: string;
}

export interface Board {
  id: string;
  title: string;
  background: string;
  is_starred: boolean;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
  lists?: List[];
  labels?: Label[];
  members?: Member[];
}

export interface List {
  id: string;
  board_id: string;
  title: string;
  position: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  cards?: Card[];
}

export interface Label {
  id: string;
  board_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Card {
  id: string;
  list_id: string;
  board_id?: string;
  title: string;
  description: string | null;
  position: number;
  cover_color: string | null;
  cover_image_url: string | null;
  due_date: string | null;
  is_complete: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  labels?: Label[];
  members?: Member[];
  checklists?: Checklist[];
  attachments?: Attachment[];
  comments?: Comment[];
  comment_count?: number;
  attachment_count?: number;
}

export interface Checklist {
  id: string;
  card_id: string;
  title: string;
  position: number;
  created_at: string;
  items?: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  title: string;
  is_checked: boolean;
  position: number;
  created_at: string;
}

export interface Attachment {
  id: string;
  card_id: string;
  file_name: string;
  url: string;
  mime_type: string | null;
  file_size: number | null;
  created_at: string;
}

export interface Comment {
  id: string;
  card_id: string;
  member_id: string;
  text: string;
  created_at: string;
  updated_at: string;
  member?: Member;
}

export interface ActivityLog {
  id: string;
  board_id: string | null;
  card_id: string | null;
  member_id: string | null;
  action: string;
  data: Record<string, unknown> | null;
  created_at: string;
  member?: Member;
}

export interface ApiResponse<T> {
  data: T;
  error: { message: string; details?: unknown } | null;
}

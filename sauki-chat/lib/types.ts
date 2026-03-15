export type SessionStatus =
  | 'active'
  | 'agent_required'
  | 'agent_active'
  | 'resolved'
  | 'flagged';

export type MessageSender = 'customer' | 'ai' | 'agent';

export interface ChatSession {
  id: string;
  customer_id: string;
  customer_name: string;
  status: SessionStatus;
  agent_required: boolean;
  agent_mode: boolean;
  agent_id: string | null;
  internal_notes: string[];
  last_message: string | null;
  last_message_at: string;
  started_at: string;
  resolved_at: string | null;
  message_count: number;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  sender: MessageSender;
  content: string;
  read: boolean;
  delivered: boolean;
  created_at: string;
}

export interface TypingIndicator {
  session_id: string;
  sender: string;
  is_typing: boolean;
  updated_at: string;
}

export interface SSEEvent {
  type: 'messages' | 'typing' | 'session_update' | 'new_session';
  data: unknown;
}

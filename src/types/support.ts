export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: {
    id: string;
    name: string;
    email: string;
    department?: string;
    avatar?: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  messages: TicketMessage[];
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
}

export interface TicketMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    role: 'admin' | 'employee';
    avatar?: string;
  };
  createdAt: Date;
  isInternalNote?: boolean;
}

export interface TicketCategory {
  id: string;
  name: string;
  description?: string;
  icon: string;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  lastUpdated: Date;
  views: number;
  helpfulCount: number;
}

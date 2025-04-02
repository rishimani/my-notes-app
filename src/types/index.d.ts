export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface EmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  historyId: string;
  internalDate: string;
  payload: {
    partId?: string;
    mimeType: string;
    filename?: string;
    headers: {
      name: string;
      value: string;
    }[];
    body?: {
      size: number;
      data?: string;
    };
    parts?: any[];
  };
  sizeEstimate: number;
  raw?: string;
  // Parsed fields for easier display
  from: string;
  to: string;
  subject: string;
  date: Date;
  body: string;
}

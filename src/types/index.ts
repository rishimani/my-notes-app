export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  reminderDate?: string | null;
  reminderTime?: string | null;
};

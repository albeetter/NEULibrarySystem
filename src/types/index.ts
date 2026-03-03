export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  affiliation: string | null; // e.g., 'Student', 'Faculty', or null for new users
  isBlocked: boolean;
}

export interface Visit {
  id: string;
  userId: string;
  timestamp: string;
  purpose: string;
}
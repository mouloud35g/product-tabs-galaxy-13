export type AppRole = 'admin' | 'moderator' | 'user';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface UserWithRoles {
  id: string;
  email?: string; // Rendu optionnel car non présent dans la table profiles
  full_name: string | null;
  username: string | null;
  roles: UserRole[];
  created_at: string;
  role: string | null;
}
import type { User } from '../types';

const TOKEN_KEY  = 'wavesync-token';
const USER_KEY   = 'wavesync-user';

// ─── Simple localStorage-based auth (no backend required) ─────────────────────

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getStoredToken() && !!getStoredUser();
}

export function signIn(email: string, _password: string): User {
  // In a real app this would call an API. For now we create/retrieve a local user.
  const existing = getStoredUser();
  if (existing && existing.email === email) return existing;

  const user: User = {
    id: crypto.randomUUID(),
    username: email.split('@')[0],
    email,
  };
  const token = crypto.randomUUID();
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export function signUp(email: string, _password: string, username: string): User {
  const user: User = {
    id: crypto.randomUUID(),
    username,
    email,
  };
  const token = crypto.randomUUID();
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export function signOut(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

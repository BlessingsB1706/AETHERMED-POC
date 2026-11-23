import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export type Role = 'patient' | 'student' | 'professional' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextValue {
  user: User | null;
  /** Demo-only sign in. Replace with a real provider (Supabase / Auth0 / Clerk) before launch. */
  signInDemo: (role: Role, email?: string) => User;
  signOut: () => void;
}

export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';

const STORAGE_KEY = 'aethermed.session';

const DEMO_USERS: Record<Role, Omit<User, 'email'>> = {
  patient: { id: 'demo-patient', name: 'Sarah Wilson', role: 'patient' },
  student: { id: 'demo-student', name: 'Sarah Wilson', role: 'student' },
  professional: { id: 'demo-pro', name: 'Dr. Michael Chen', role: 'professional' },
  admin: { id: 'demo-admin', name: 'System Admin', role: 'admin' },
};

export function homePathFor(role: Role): string {
  if (role === 'admin') return '/admin';
  if (role === 'professional') return '/pro';
  return '/patient';
}

function readSession(): User | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readSession);

  const signInDemo = useCallback((role: Role, email?: string) => {
    const next: User = { ...DEMO_USERS[role], email: email || `${role}@demo.aethermed.local` };
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable: session lives in memory only */
    }
    setUser(next);
    return next;
  }, []);

  const signOut = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, signInDemo, signOut }), [user, signInDemo, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/**
 * Client-side route guard. This is UX only: real authorization MUST be enforced by the API
 * (every request checks the session and role server-side).
 */
export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!roles.includes(user.role)) return <Navigate to={homePathFor(user.role)} replace />;
  return <>{children}</>;
}

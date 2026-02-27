import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { type Session, type AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserRole, type AuthUser, type LoginFormData, type RegisterFormData } from '../types/auth';

interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (data: LoginFormData) => Promise<{ error: AuthError | null; data?: { session: Session | null } }>;
  register: (data: RegisterFormData) => Promise<{ error: AuthError | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Timeout for a single profile-fetch call (ms). */
const PROFILE_FETCH_TIMEOUT_MS = 5_000;
const PROFILE_FETCH_RETRIES = 3;
const PROFILE_FETCH_DELAY_MS = 400;

function mapRowToUser(row: {
  id: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
}): AuthUser {
  return {
    id: row.id,
    email: row.email,
    role: row.role as UserRole,
    firstName: row.first_name,
    lastName: row.last_name,
  };
}

/**
 * Fetch the user profile from `public.users`.
 * Wrapped in `Promise.race` with a timeout so the call can never hang forever.
 */
async function fetchUserProfile(userId: string): Promise<AuthUser | null> {
  try {
    const result = await Promise.race([
      supabase
        .from('users')
        .select('id, email, role, first_name, last_name')
        .eq('id', userId)
        .single(),
      new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), PROFILE_FETCH_TIMEOUT_MS),
      ),
    ]);

    if (!result || typeof result !== 'object') return null;
    if ('error' in result && result.error) return null;
    if (!('data' in result) || !result.data) return null;

    return mapRowToUser(
      result.data as {
        id: string;
        email: string;
        role: string;
        first_name: string;
        last_name: string;
      },
    );
  } catch {
    return null;
  }
}

/**
 * Fetch with retry — the DB trigger may not have created the row yet after
 * signup, so we retry a few times with a short delay.
 */
async function fetchUserProfileWithRetry(
  userId: string,
): Promise<AuthUser | null> {
  for (let attempt = 0; attempt < PROFILE_FETCH_RETRIES; attempt++) {
    const profile = await fetchUserProfile(userId);
    if (profile) return profile;
    if (attempt < PROFILE_FETCH_RETRIES - 1) {
      await new Promise((r) => setTimeout(r, PROFILE_FETCH_DELAY_MS));
    }
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }): ReactNode {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  /**
   * When `true`, login / register are in progress — onAuthStateChange must
   * skip to avoid deadlocking the Supabase-JS internal session lock.
   */
  const authInProgressRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    // ── Restore session on mount ──────────────────────────────────────
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (!mounted) return;
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          if (!mounted) return;
          if (profile) {
            setState({ user: profile, session, loading: false });
          } else {
            // Stale / broken session — sign out cleanly.
            try {
              await supabase.auth.signOut();
            } catch {
              /* ignore */
            }
            if (mounted)
              setState({ user: null, session: null, loading: false });
          }
        } else {
          setState({ user: null, session: null, loading: false });
        }
      })
      .catch(() => {
        if (mounted)
          setState({ user: null, session: null, loading: false });
      });

    // ── Auth-state listener ───────────────────────────────────────────
    // CRITICAL: This callback must NOT await Supabase client calls
    // (supabase.from(...), supabase.auth.signOut(), etc.) because the SDK
    // holds an internal lock during onAuthStateChange that those calls also
    // try to acquire, causing a deadlock.  All async work is deferred via
    // setTimeout(0) to break out of the lock scope.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        setState({ user: null, session: null, loading: false });
        return;
      }

      // login() / register() handle their own state — skip.
      if (authInProgressRef.current) return;

      if (event === 'TOKEN_REFRESHED' && session) {
        setState((prev) => ({ ...prev, session }));
        return;
      }

      if (session?.user) {
        const userId = session.user.id;
        // Defer to avoid SDK session-lock deadlock.
        setTimeout(() => {
          if (!mounted || authInProgressRef.current) return;
          void fetchUserProfile(userId).then((profile) => {
            if (!mounted || authInProgressRef.current) return;
            if (profile) {
              setState({ user: profile, session, loading: false });
            } else {
              supabase.auth.signOut().catch(() => {});
              setState({ user: null, session: null, loading: false });
            }
          });
        }, 0);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────
  const login = useCallback(
    async (
      data: LoginFormData,
    ): Promise<{
      error: AuthError | null;
      data?: { session: Session | null };
    }> => {
      authInProgressRef.current = true;
      try {
        const { data: authData, error } =
          await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          });

        if (error) return { error };

        if (authData.session?.user) {
          const profile = await fetchUserProfile(authData.session.user.id);
          if (profile) {
            setState({
              user: profile,
              session: authData.session,
              loading: false,
            });
          } else {
            try {
              await supabase.auth.signOut();
            } catch {
              /* ignore */
            }
            return {
              error: {
                message:
                  'User profile not found. Please register a new account.',
                status: 500,
              } as AuthError,
            };
          }
        }

        return { error: null, data: { session: authData.session } };
      } finally {
        authInProgressRef.current = false;
      }
    },
    [],
  );

  // ── Register ──────────────────────────────────────────────────────────
  const register = useCallback(
    async (data: RegisterFormData): Promise<{ error: AuthError | null }> => {
      authInProgressRef.current = true;
      try {
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              role: data.role,
              first_name: data.firstName,
              last_name: data.lastName,
            },
          },
        });

        if (error) return { error };

        // When email confirmation is disabled, signUp returns a session.
        if (authData.session) {
          // DB trigger may need a moment — retry a few times.
          let profile = await fetchUserProfileWithRetry(
            authData.session.user.id,
          );
          if (!profile) {
            // Trigger hasn't run; build profile from sign-up data.
            profile = {
              id: authData.session.user.id,
              email: data.email,
              role: data.role as UserRole,
              firstName: data.firstName,
              lastName: data.lastName,
            };
          }
          setState({
            user: profile,
            session: authData.session,
            loading: false,
          });
        }

        return { error: null };
      } finally {
        authInProgressRef.current = false;
      }
    },
    [],
  );

  // ── Logout ────────────────────────────────────────────────────────────
  const logout = useCallback(async (): Promise<void> => {
    setState({ user: null, session: null, loading: false });
    try {
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';

import {
  getClinicApplicationsErrorMessage,
  listClinicApplications,
} from '../lib/clinicApplications';
import { supabase } from '../lib/supabase';
import { initialLogs } from '../store/initialData';
import type { ClinicApplication, ClinicApplicationInput, SystemLog } from '../types';

const STORAGE_KEY = 'maternalert-admin-data';

type StoredData = {
  logs?: SystemLog[];
};

type SignInResult = {
  success: boolean;
  error?: string;
};

type AppContextValue = {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  applications: ClinicApplication[];
  applicationsLoading: boolean;
  applicationsError: string | null;
  refreshApplications: () => Promise<void>;
  logs: SystemLog[];
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
  submitApplication: (input: ClinicApplicationInput) => void;
  getApplicationById: (id: string) => ClinicApplication | undefined;
};

const AppContext = createContext<AppContextValue | null>(null);

function loadStoredLogs(): SystemLog[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return initialLogs;
  }

  try {
    const storedData = JSON.parse(raw) as StoredData;
    return Array.isArray(storedData.logs) ? storedData.logs : initialLogs;
  } catch {
    return initialLogs;
  }
}

function saveStoredLogs(logs: SystemLog[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ logs }));
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatTimestamp(date = new Date()) {
  return date.toISOString();
}

async function verifyAdminProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', userId)
    .eq('role', 'admin')
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.id === userId && data.role === 'admin';
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [applications, setApplications] = useState<ClinicApplication[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState<string | null>(null);
  const [logs, setLogs] = useState<SystemLog[]>(loadStoredLogs);
  const applicationRequestId = useRef(0);
  const authRequestId = useRef(0);
  const verifiedAdminUserId = useRef<string | null>(null);
  const signInInProgress = useRef(false);
  const pendingSignOutMessage = useRef<string | null>(null);
  const isAuthenticated = Boolean(session && user && isAdmin);

  const clearApplicationState = useCallback(() => {
    applicationRequestId.current += 1;
    setApplications([]);
    setApplicationsLoading(false);
    setApplicationsError(null);
  }, []);

  const establishSession = useCallback(
    async (
      nextSession: Session | null,
      signedOutMessage: string | null = null,
    ): Promise<SignInResult> => {
      const requestId = ++authRequestId.current;

      if (!nextSession) {
        verifiedAdminUserId.current = null;
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setAuthLoading(false);
        setAuthError(signedOutMessage);
        clearApplicationState();
        return { success: false, error: signedOutMessage ?? undefined };
      }

      setAuthLoading(true);
      setAuthError(null);
      clearApplicationState();

      let hasAdminRole: boolean;
      try {
        hasAdminRole = await verifyAdminProfile(nextSession.user.id);
      } catch {
        if (authRequestId.current !== requestId) {
          return { success: false };
        }

        const message = 'Unable to verify admin access. Please try again.';
        pendingSignOutMessage.current = message;
        verifiedAdminUserId.current = null;
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setAuthLoading(false);
        setAuthError(message);
        await supabase.auth.signOut();
        return { success: false, error: message };
      }

      if (authRequestId.current !== requestId) {
        return { success: false };
      }

      if (!hasAdminRole) {
        const message = 'This account is not authorized to access the admin portal.';
        pendingSignOutMessage.current = message;
        verifiedAdminUserId.current = null;
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setAuthLoading(false);
        setAuthError(message);
        await supabase.auth.signOut();
        return { success: false, error: message };
      }

      verifiedAdminUserId.current = nextSession.user.id;
      setSession(nextSession);
      setUser(nextSession.user);
      setIsAdmin(true);
      setAuthLoading(false);
      setAuthError(null);
      return { success: true };
    },
    [clearApplicationState],
  );

  useEffect(() => {
    let active = true;
    const pendingTimeouts = new Set<number>();

    const schedule = (callback: () => void) => {
      const timeoutId = window.setTimeout(() => {
        pendingTimeouts.delete(timeoutId);
        if (active) {
          callback();
        }
      }, 0);
      pendingTimeouts.add(timeoutId);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'INITIAL_SESSION') {
        return;
      }

      if (event === 'SIGNED_IN' && signInInProgress.current) {
        return;
      }

      if (
        (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') &&
        nextSession &&
        verifiedAdminUserId.current === nextSession.user.id
      ) {
        schedule(() => {
          setSession(nextSession);
          setUser(nextSession.user);
        });
        return;
      }

      const signedOutMessage =
        event === 'SIGNED_OUT' ? pendingSignOutMessage.current : null;
      if (event === 'SIGNED_OUT') {
        pendingSignOutMessage.current = null;
      }

      schedule(() => {
        void establishSession(nextSession, signedOutMessage);
      });
    });

    const initializeAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!active) {
        return;
      }

      if (error) {
        await establishSession(null, 'Unable to restore the admin session. Please sign in again.');
        return;
      }

      await establishSession(data.session);
    };

    void initializeAuth();

    return () => {
      active = false;
      authRequestId.current += 1;
      pendingTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
      subscription.unsubscribe();
    };
  }, [establishSession]);

  const refreshApplications = useCallback(async () => {
    const requestId = ++applicationRequestId.current;
    setApplicationsLoading(true);
    setApplicationsError(null);

    try {
      const nextApplications = await listClinicApplications();
      if (applicationRequestId.current === requestId) {
        setApplications(nextApplications);
      }
    } catch (error) {
      if (applicationRequestId.current === requestId) {
        setApplications([]);
        setApplicationsError(getClinicApplicationsErrorMessage(error));
      }
    } finally {
      if (applicationRequestId.current === requestId) {
        setApplicationsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void refreshApplications();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isAuthenticated, refreshApplications]);

  const addLog = useCallback((action: string, details: string) => {
    const entry: SystemLog = {
      id: createId('log'),
      action,
      details,
      timestamp: formatTimestamp(),
    };

    setLogs((current) => {
      const nextLogs = [entry, ...current];
      saveStoredLogs(nextLogs);
      return nextLogs;
    });
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<SignInResult> => {
      signInInProgress.current = true;
      setAuthLoading(true);
      setAuthError(null);

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error || !data.session) {
          const message = error?.message.toLowerCase().includes('invalid login credentials')
            ? 'Invalid email or password.'
            : 'Unable to sign in. Please check your details and try again.';
          setAuthLoading(false);
          setAuthError(message);
          return { success: false, error: message };
        }

        const result = await establishSession(data.session);
        if (result.success) {
          addLog('Admin Login', `${data.user.email ?? email} signed in to the admin portal.`);
        }

        return result;
      } finally {
        signInInProgress.current = false;
      }
    },
    [addLog, establishSession],
  );

  const signOut = useCallback(async () => {
    const signedOutEmail = user?.email;
    pendingSignOutMessage.current = null;

    try {
      await supabase.auth.signOut();
    } finally {
      authRequestId.current += 1;
      verifiedAdminUserId.current = null;
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      setAuthLoading(false);
      setAuthError(null);
      clearApplicationState();
      addLog(
        'Admin Logout',
        signedOutEmail
          ? `${signedOutEmail} signed out of the admin portal.`
          : 'Administrator signed out of the admin portal.',
      );
    }
  }, [addLog, clearApplicationState, user?.email]);

  const submitApplication = useCallback(
    (input: ClinicApplicationInput) => {
      const application: ClinicApplication = {
        ...input,
        id: createId('app'),
        status: 'pending',
        submittedAt: formatTimestamp(),
      };

      setApplications((current) => [application, ...current]);
      addLog(
        'Application Submitted',
        `${application.facilityName} submitted a new registration application.`,
      );
    },
    [addLog],
  );

  const getApplicationById = useCallback(
    (id: string) => applications.find((item) => item.id === id),
    [applications],
  );

  const value = useMemo(
    () => ({
      session,
      user,
      isAdmin,
      isAuthenticated,
      authLoading,
      authError,
      applications,
      applicationsLoading,
      applicationsError,
      refreshApplications,
      logs,
      signIn,
      signOut,
      submitApplication,
      getApplicationById,
    }),
    [
      session,
      user,
      isAdmin,
      isAuthenticated,
      authLoading,
      authError,
      applications,
      applicationsLoading,
      applicationsError,
      refreshApplications,
      logs,
      signIn,
      signOut,
      submitApplication,
      getApplicationById,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }

  return context;
}

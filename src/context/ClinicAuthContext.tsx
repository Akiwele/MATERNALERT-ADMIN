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

import {
  restoreClinicSession,
  signInClinic,
  type AuthenticatedClinic,
} from '../lib/clinicAuth';
import { clinicSupabase } from '../lib/supabase';

type ClinicAuthContextValue = {
  clinic: AuthenticatedClinic | null;
  authLoading: boolean;
  signIn: (email: string, password: string) => Promise<AuthenticatedClinic>;
  signOut: () => Promise<void>;
};

const ClinicAuthContext = createContext<ClinicAuthContextValue | null>(null);

export function ClinicAuthProvider({ children }: { children: ReactNode }) {
  const restorePromise = useRef<Promise<AuthenticatedClinic | null> | null>(null);
  const [clinic, setClinic] = useState<AuthenticatedClinic | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (!restorePromise.current) {
      restorePromise.current = restoreClinicSession();
    }

    const pendingRestore = restorePromise.current;
    let active = true;

    void pendingRestore
      .then((restoredClinic) => {
        if (active) {
          setClinic(restoredClinic);
          setAuthLoading(false);
        }
      })
      .catch(async () => {
        try {
          await clinicSupabase.auth.signOut();
        } finally {
          if (active) {
            setClinic(null);
            setAuthLoading(false);
          }
        }
      });

    const {
      data: { subscription },
    } = clinicSupabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' && active) {
        setClinic(null);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const authenticatedClinic = await signInClinic(email, password);
    setClinic(authenticatedClinic);
    return authenticatedClinic;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await clinicSupabase.auth.signOut();
    } finally {
      setClinic(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      clinic,
      authLoading,
      signIn,
      signOut,
    }),
    [authLoading, clinic, signIn, signOut],
  );

  return <ClinicAuthContext.Provider value={value}>{children}</ClinicAuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useClinicAuth() {
  const context = useContext(ClinicAuthContext);
  if (!context) {
    throw new Error('useClinicAuth must be used within ClinicAuthProvider');
  }

  return context;
}

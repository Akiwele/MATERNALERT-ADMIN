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
  resumeClinicAccountActivation,
  signInClinic,
  type AuthenticatedClinic,
  type IncompleteClinicActivation,
} from '../lib/clinicAuth';
import { clinicSupabase } from '../lib/supabase';

type ClinicAuthContextValue = {
  clinic: AuthenticatedClinic | null;
  activationIncomplete: IncompleteClinicActivation | null;
  authLoading: boolean;
  signIn: (email: string, password: string) => Promise<
    | { status: 'active'; clinic: AuthenticatedClinic }
    | { status: 'activation_incomplete'; clinic: IncompleteClinicActivation }
  >;
  completeResumedActivation: () => Promise<AuthenticatedClinic>;
  signOut: () => Promise<void>;
};

const ClinicAuthContext = createContext<ClinicAuthContextValue | null>(null);

export function ClinicAuthProvider({ children }: { children: ReactNode }) {
  const restorePromise = useRef<ReturnType<typeof restoreClinicSession> | null>(null);
  const [clinic, setClinic] = useState<AuthenticatedClinic | null>(null);
  const [activationIncomplete, setActivationIncomplete] =
    useState<IncompleteClinicActivation | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (!restorePromise.current) {
      restorePromise.current = restoreClinicSession();
    }

    const pendingRestore = restorePromise.current;
    let active = true;

    void pendingRestore
      .then((inspection) => {
        if (!active) {
          return;
        }

        if (inspection.status === 'active') {
          setClinic(inspection.clinic);
          setActivationIncomplete(null);
        } else if (inspection.status === 'activation_incomplete') {
          setClinic(null);
          setActivationIncomplete(inspection.clinic);
        } else {
          setClinic(null);
          setActivationIncomplete(null);
        }

        setAuthLoading(false);
      })
      .catch(async () => {
        try {
          await clinicSupabase.auth.signOut();
        } finally {
          if (active) {
            setClinic(null);
            setActivationIncomplete(null);
            setAuthLoading(false);
          }
        }
      });

    const {
      data: { subscription },
    } = clinicSupabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' && active) {
        setClinic(null);
        setActivationIncomplete(null);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const inspection = await signInClinic(email, password);

    if (inspection.status === 'active') {
      setClinic(inspection.clinic);
      setActivationIncomplete(null);
      return inspection;
    }

    if (inspection.status === 'activation_incomplete') {
      setClinic(null);
      setActivationIncomplete(inspection.clinic);
      return inspection;
    }

    throw new Error('Unable to verify clinic access. Please try again.');
  }, []);

  const completeResumedActivation = useCallback(async () => {
    const activatedClinic = await resumeClinicAccountActivation();
    setClinic(activatedClinic);
    setActivationIncomplete(null);
    return activatedClinic;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await clinicSupabase.auth.signOut();
    } finally {
      setClinic(null);
      setActivationIncomplete(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      clinic,
      activationIncomplete,
      authLoading,
      signIn,
      completeResumedActivation,
      signOut,
    }),
    [activationIncomplete, authLoading, clinic, completeResumedActivation, signIn, signOut],
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

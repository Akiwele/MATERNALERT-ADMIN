import {

  createContext,

  useCallback,

  useContext,

  useMemo,

  useState,

  type ReactNode,

} from 'react';



import { initialApplications, initialLogs } from '../store/initialData';

import type { ClinicApplication, ClinicApplicationInput, SystemLog } from '../types';



const STORAGE_KEY = 'maternalert-admin-data';



type StoredData = {

  applications: ClinicApplication[];

  logs: SystemLog[];

};



type ApproveResult = {

  email: string;

  activationToken: string;

};



type AppContextValue = {

  isAuthenticated: boolean;

  applications: ClinicApplication[];

  logs: SystemLog[];

  login: (email: string, password: string) => boolean;

  logout: () => void;

  submitApplication: (input: ClinicApplicationInput) => void;

  approveApplication: (id: string) => ApproveResult | null;

  rejectApplication: (id: string, reason?: string) => void;

  getApplicationById: (id: string) => ClinicApplication | undefined;

};



const AppContext = createContext<AppContextValue | null>(null);



const ADMIN_EMAIL = 'admin@maternalert.com';

const ADMIN_PASSWORD = 'admin123';



function loadStoredData(): StoredData {

  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {

    return { applications: initialApplications, logs: initialLogs };

  }



  try {

    return JSON.parse(raw) as StoredData;

  } catch {

    return { applications: initialApplications, logs: initialLogs };

  }

}



function saveStoredData(data: StoredData) {

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

}



function createId(prefix: string) {

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

}



function formatTimestamp(date = new Date()) {

  return date.toISOString();

}



function generateActivationToken() {

  return `MAT-${Math.random().toString(36).slice(2, 10).toUpperCase()}-${Date.now().toString(36).slice(2, 6).toUpperCase()}`;

}



export function AppProvider({ children }: { children: ReactNode }) {

  const [isAuthenticated, setIsAuthenticated] = useState(

    () => sessionStorage.getItem('maternalert-admin-auth') === 'true',

  );

  const [applications, setApplications] = useState<ClinicApplication[]>(

    () => loadStoredData().applications,

  );

  const [logs, setLogs] = useState<SystemLog[]>(() => loadStoredData().logs);



  const persist = useCallback((nextApplications: ClinicApplication[], nextLogs: SystemLog[]) => {

    setApplications(nextApplications);

    setLogs(nextLogs);

    saveStoredData({ applications: nextApplications, logs: nextLogs });

  }, []);



  const addLog = useCallback(

    (action: string, details: string) => {

      const entry: SystemLog = {

        id: createId('log'),

        action,

        details,

        timestamp: formatTimestamp(),

      };

      setLogs((current) => {

        const nextLogs = [entry, ...current];

        saveStoredData({ applications, logs: nextLogs });

        return nextLogs;

      });

    },

    [applications],

  );



  const login = useCallback((email: string, password: string) => {

    const isValid =

      email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;



    if (isValid) {

      setIsAuthenticated(true);

      sessionStorage.setItem('maternalert-admin-auth', 'true');

      addLog('Admin Login', `${email} signed in to the admin portal.`);

    }



    return isValid;

  }, [addLog]);



  const logout = useCallback(() => {

    setIsAuthenticated(false);

    sessionStorage.removeItem('maternalert-admin-auth');

    addLog('Admin Logout', 'Administrator signed out of the admin portal.');

  }, [addLog]);



  const submitApplication = useCallback(

    (input: ClinicApplicationInput) => {

      const application: ClinicApplication = {

        ...input,

        id: createId('app'),

        status: 'pending',

        submittedAt: formatTimestamp(),

      };



      const nextApplications = [application, ...applications];

      const entry: SystemLog = {

        id: createId('log'),

        action: 'Application Submitted',

        details: `${application.facilityName} submitted a new registration application.`,

        timestamp: formatTimestamp(),

      };

      const nextLogs = [entry, ...logs];

      persist(nextApplications, nextLogs);

    },

    [applications, logs, persist],

  );



  const approveApplication = useCallback(

    (id: string): ApproveResult | null => {

      const application = applications.find((item) => item.id === id);

      if (!application || application.status !== 'pending') {

        return null;

      }



      const reviewedAt = formatTimestamp();

      const activationToken = generateActivationToken();

      const nextApplications = applications.map((item) =>

        item.id === id

          ? {

              ...item,

              status: 'approved' as const,

              reviewedAt,

              activationToken,

              accountStatus: 'Pending Activation' as const,

              activationStatus: 'Link Sent' as const,

            }

          : item,

      );

      const entry: SystemLog = {

        id: createId('log'),

        action: 'Application Approved',

        details: `${application.facilityName} was approved. Activation link sent to ${application.officialEmail}. Token: ${activationToken}`,

        timestamp: reviewedAt,

      };

      persist(nextApplications, [entry, ...logs]);

      return { email: application.officialEmail, activationToken };

    },

    [applications, logs, persist],

  );



  const rejectApplication = useCallback(

    (id: string, reason?: string) => {

      const application = applications.find((item) => item.id === id);

      if (!application || application.status !== 'pending') {

        return;

      }



      const reviewedAt = formatTimestamp();

      const rejectionReason = reason?.trim() || 'No reason provided.';

      const nextApplications = applications.map((item) =>

        item.id === id

          ? {

              ...item,

              status: 'rejected' as const,

              reviewedAt,

              rejectionReason,

            }

          : item,

      );

      const entry: SystemLog = {

        id: createId('log'),

        action: 'Application Rejected',

        details: `${application.facilityName} application was rejected. Reason: ${rejectionReason}`,

        timestamp: reviewedAt,

      };

      persist(nextApplications, [entry, ...logs]);

    },

    [applications, logs, persist],

  );



  const getApplicationById = useCallback(

    (id: string) => applications.find((item) => item.id === id),

    [applications],

  );



  const value = useMemo(

    () => ({

      isAuthenticated,

      applications,

      logs,

      login,

      logout,

      submitApplication,

      approveApplication,

      rejectApplication,

      getApplicationById,

    }),

    [

      isAuthenticated,

      applications,

      logs,

      login,

      logout,

      submitApplication,

      approveApplication,

      rejectApplication,

      getApplicationById,

    ],

  );



  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;

}



export function useApp() {

  const context = useContext(AppContext);

  if (!context) {

    throw new Error('useApp must be used within AppProvider');

  }

  return context;

}



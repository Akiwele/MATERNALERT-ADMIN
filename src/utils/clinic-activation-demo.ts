export const CLINIC_ACTIVATION_DEMO_STORAGE_KEY = 'maternalert-clinic-activation-demo';

export const DEMO_CLINIC_EMAIL = 'clinic@hopevalley.gov.gh';
export const DEMO_CLINIC_FACILITY_NAME = 'Hope Valley Maternity Clinic';

export type ClinicActivationDemoData = {
  email: string;
  facilityName: string;
};

export function saveClinicActivationDemo(data: ClinicActivationDemoData): void {
  sessionStorage.setItem(CLINIC_ACTIVATION_DEMO_STORAGE_KEY, JSON.stringify(data));
}

export function loadClinicActivationDemo(): ClinicActivationDemoData {
  const raw = sessionStorage.getItem(CLINIC_ACTIVATION_DEMO_STORAGE_KEY);

  if (!raw) {
    return {
      email: DEMO_CLINIC_EMAIL,
      facilityName: DEMO_CLINIC_FACILITY_NAME,
    };
  }

  try {
    const parsed = JSON.parse(raw) as ClinicActivationDemoData;
    return {
      email: parsed.email || DEMO_CLINIC_EMAIL,
      facilityName: parsed.facilityName || DEMO_CLINIC_FACILITY_NAME,
    };
  } catch {
    return {
      email: DEMO_CLINIC_EMAIL,
      facilityName: DEMO_CLINIC_FACILITY_NAME,
    };
  }
}

export function markClinicAccountActivated(): void {
  sessionStorage.setItem('maternalert-clinic-account-activated-demo', 'true');
}

export function isClinicAccountActivatedDemo(): boolean {
  return sessionStorage.getItem('maternalert-clinic-account-activated-demo') === 'true';
}

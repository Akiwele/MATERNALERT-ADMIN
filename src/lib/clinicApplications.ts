import { supabase } from './supabase';
import type {
  AccountStatus,
  ActivationStatus,
  ApplicationStatus,
  ClinicApplication,
} from '../types';

type ClinicOnboardingRow = {
  application_id: string;
  review_status: string;
  invitation_sent_at: string | null;
  activation_completed_at: string | null;
  clinic_is_active: boolean;
};

type ClinicApplicationDetailRow = {
  application_id: string;
  facility_name: string;
  hefra_licence_number: string;
  facility_type: string;
  region_id: number;
  region_name: string;
  district: string;
  official_email: string;
  official_phone: string;
  contact_person_name: string;
  contact_person_role: string;
  licence_document_path: string;
  terms_accepted: boolean;
  application_status: string;
  review_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
};

function mapStatus(value: string): ApplicationStatus {
  if (value === 'pending' || value === 'approved' || value === 'rejected') {
    return value;
  }

  throw new Error(`Unsupported clinic application status: ${value}`);
}

function mapAccountStatus(row: ClinicOnboardingRow): AccountStatus {
  if (row.clinic_is_active || row.activation_completed_at) {
    return 'Active';
  }

  return row.review_status === 'rejected' ? 'Inactive' : 'Pending Activation';
}

function mapActivationStatus(row: ClinicOnboardingRow): ActivationStatus {
  if (row.activation_completed_at) {
    return 'Activated';
  }

  return row.invitation_sent_at ? 'Link Sent' : 'Not Sent';
}

function getDocumentName(path: string) {
  return path.split('/').filter(Boolean).at(-1) ?? 'Licence document';
}

function mapApplication(
  detail: ClinicApplicationDetailRow,
  onboarding: ClinicOnboardingRow,
): ClinicApplication {
  const status = mapStatus(detail.application_status);

  return {
    id: detail.application_id,
    facilityName: detail.facility_name,
    hefraLicenceNumber: detail.hefra_licence_number,
    facilityType: detail.facility_type,
    regionId: detail.region_id,
    region: detail.region_name,
    district: detail.district,
    officialEmail: detail.official_email,
    phoneNumber: detail.official_phone,
    contactPersonName: detail.contact_person_name,
    contactPersonRole: detail.contact_person_role,
    hefraDocumentName: getDocumentName(detail.licence_document_path),
    licenceDocumentPath: detail.licence_document_path,
    termsAccepted: detail.terms_accepted,
    status,
    submittedAt: detail.submitted_at,
    reviewedAt: detail.reviewed_at ?? undefined,
    reviewNotes: detail.review_notes ?? undefined,
    rejectionReason: status === 'rejected' ? detail.review_notes ?? undefined : undefined,
    invitationSentAt: onboarding.invitation_sent_at ?? undefined,
    activationCompletedAt: onboarding.activation_completed_at ?? undefined,
    accountStatus: mapAccountStatus(onboarding),
    activationStatus: mapActivationStatus(onboarding),
  };
}

export async function listClinicApplications(): Promise<ClinicApplication[]> {
  const { data: onboardingData, error: onboardingError } = await supabase.rpc(
    'list_clinic_onboarding_statuses',
  );

  if (onboardingError) {
    throw onboardingError;
  }

  const onboardingRows = (onboardingData ?? []) as ClinicOnboardingRow[];

  return Promise.all(
    onboardingRows.map(async (onboarding) => {
      const { data: detailData, error: detailError } = await supabase.rpc(
        'get_clinic_application_details',
        { p_application_id: onboarding.application_id },
      );

      if (detailError) {
        throw detailError;
      }

      const detail = (detailData as ClinicApplicationDetailRow[] | null)?.[0];
      if (!detail) {
        throw new Error(`Clinic application ${onboarding.application_id} was not found.`);
      }

      return mapApplication(detail, onboarding);
    }),
  );
}

export function getClinicApplicationsErrorMessage(error: unknown) {
  const message =
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
      ? error.message
      : String(error);
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes('authentication is required') ||
    normalizedMessage.includes('permission denied') ||
    normalizedMessage.includes('only administrators')
  ) {
    return 'Clinic applications could not be loaded securely. This admin login is not authenticated with Supabase or does not have an admin profile.';
  }

  return 'Clinic applications could not be loaded. Check your connection and try again.';
}

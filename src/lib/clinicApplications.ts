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
  licence_document_path: string | null;
  terms_accepted: boolean;
  application_status: string;
  review_notes: string | null;
  reviewed_by: string | null;
  submitted_at: string;
  reviewed_at: string | null;
};

export type ClinicApplicationDecision = {
  applicationId: string;
  status: ApplicationStatus;
  reviewedAt: string;
  reviewedBy: string;
  reviewNotes?: string;
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

function getDocumentName(path: string | null) {
  if (!path?.trim() || path.startsWith('temporary-not-uploaded/')) {
    return 'Licence document';
  }

  return path.split('/').filter(Boolean).at(-1) ?? 'Licence document';
}

function mapApplication(
  detail: ClinicApplicationDetailRow,
  onboarding: ClinicOnboardingRow,
): ClinicApplication {
  const status = mapStatus(detail.application_status);
  const licenceDocumentPath =
    detail.licence_document_path?.startsWith('temporary-not-uploaded/')
      ? undefined
      : detail.licence_document_path ?? undefined;

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
    licenceDocumentPath,
    termsAccepted: detail.terms_accepted,
    status,
    submittedAt: detail.submitted_at,
    reviewedAt: detail.reviewed_at ?? undefined,
    reviewedBy: detail.reviewed_by ?? undefined,
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

type ClinicApplicationDecisionRow = {
  application_id: string;
  application_status: string;
  reviewed_at: string;
  reviewed_by: string;
  review_notes: string | null;
};

function getErrorMessage(error: unknown) {
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return String(error);
}

function getDecisionErrorMessage(error: unknown, action: 'approve' | 'reject') {
  const message = getErrorMessage(error);
  const normalizedMessage = message.toLowerCase();
  const expectedMessages = [
    'authentication is required',
    'only administrators',
    'clinic application not found',
    'only pending clinic applications',
    'a rejection reason is required',
  ];

  if (expectedMessages.some((expectedMessage) => normalizedMessage.includes(expectedMessage))) {
    return message;
  }

  return `Unable to ${action} this clinic application. Please try again.`;
}

function mapDecision(row: ClinicApplicationDecisionRow): ClinicApplicationDecision {
  return {
    applicationId: row.application_id,
    status: mapStatus(row.application_status),
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    reviewNotes: row.review_notes ?? undefined,
  };
}

export type ClinicProvisioningResult = {
  applicationId: string;
  clinicId: string;
  email: string;
  provisioningState:
    | 'provisioned_invitation_sent'
    | 'provisioned_existing_invitation'
    | 'already_provisioned';
  invitationSent: boolean;
  clinicIsActive: boolean;
};

type ClinicProvisioningResponse = {
  success: boolean;
  application_id?: string;
  clinic_id?: string;
  email?: string;
  provisioning_state?: ClinicProvisioningResult['provisioningState'];
  invitation_sent?: boolean;
  clinic_is_active?: boolean;
};

export async function approveClinicApplication(
  applicationId: string,
): Promise<ClinicProvisioningResult> {
  const { data, error } = await supabase.functions.invoke('approve-clinic-application', {
    body: { application_id: applicationId },
  });

  if (error) {
    throw new Error(
      await getFunctionErrorMessage(
        error,
        'Unable to approve and provision this clinic application. Please try again.',
      ),
    );
  }

  const result = data as ClinicProvisioningResponse | null;
  if (
    !result ||
    result.success !== true ||
    typeof result.application_id !== 'string' ||
    typeof result.clinic_id !== 'string' ||
    typeof result.email !== 'string' ||
    (result.provisioning_state !== 'provisioned_invitation_sent' &&
      result.provisioning_state !== 'provisioned_existing_invitation' &&
      result.provisioning_state !== 'already_provisioned') ||
    typeof result.invitation_sent !== 'boolean' ||
    typeof result.clinic_is_active !== 'boolean'
  ) {
    throw new Error('The clinic provisioning service returned an invalid result.');
  }

  return {
    applicationId: result.application_id,
    clinicId: result.clinic_id,
    email: result.email,
    provisioningState: result.provisioning_state,
    invitationSent: result.invitation_sent,
    clinicIsActive: result.clinic_is_active,
  };
}

export async function rejectClinicApplication(
  applicationId: string,
  reason: string,
): Promise<ClinicApplicationDecision> {
  const rejectionReason = reason.trim();
  if (!rejectionReason) {
    throw new Error('A rejection reason is required.');
  }

  const { data, error } = await supabase.rpc('reject_clinic_application', {
    p_application_id: applicationId,
    p_rejection_reason: rejectionReason,
  });

  if (error) {
    throw new Error(getDecisionErrorMessage(error, 'reject'));
  }

  const decision = (data as ClinicApplicationDecisionRow[] | null)?.[0];
  if (!decision) {
    throw new Error('The rejection completed without returning an application decision.');
  }

  return mapDecision(decision);
}

type FunctionErrorResponse = {
  message?: string;
};

async function getFunctionErrorMessage(error: unknown, fallback: string): Promise<string> {
  if (typeof error !== 'object' || error === null) {
    return fallback;
  }

  const context = 'context' in error ? error.context : undefined;
  if (context instanceof Response) {
    try {
      const body = (await context.json()) as FunctionErrorResponse;
      if (typeof body.message === 'string' && body.message.trim()) {
        return body.message;
      }
    } catch {
      return fallback;
    }
  }

  return fallback;
}

export async function submitClinicApplication(formData: FormData): Promise<void> {
  const { data, error } = await supabase.functions.invoke('submit-clinic-application', {
    body: formData,
  });

  if (error) {
    throw new Error(
      await getFunctionErrorMessage(
        error,
        'Unable to submit the application. Please check your connection and try again.',
      ),
    );
  }

  if (!data || data.success !== true) {
    throw new Error('Unable to confirm the clinic application submission.');
  }
}

export async function getClinicLicenseDocumentUrl(applicationId: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke(
    'get-clinic-license-document-url',
    {
      body: { application_id: applicationId },
    },
  );

  if (error) {
    throw new Error(
      await getFunctionErrorMessage(
        error,
        'Unable to open the licence document. Please try again.',
      ),
    );
  }

  if (!data || data.success !== true || typeof data.signed_url !== 'string') {
    throw new Error('Unable to confirm access to the licence document.');
  }

  return data.signed_url;
}

export function getClinicApplicationsErrorMessage(error: unknown) {
  const message = getErrorMessage(error);
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

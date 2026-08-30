export type ClinicAccessClassification =
  | 'unauthorized'
  | 'not_approved'
  | 'active'
  | 'activation_incomplete'
  | 'not_eligible';

export type ClinicAccessContext = {
  officialEmail: string;
  isActive: boolean;
  activatedAt: string | null;
  activationCompletedAt: string | null;
};

export function classifyClinicAccess(input: {
  profileRole: string | null | undefined;
  userEmail: string | null | undefined;
  context: ClinicAccessContext | null;
}): ClinicAccessClassification {
  if (input.profileRole !== 'clinic') {
    return 'unauthorized';
  }

  if (!input.context) {
    return 'not_approved';
  }

  const officialEmail = input.context.officialEmail.trim().toLowerCase();
  const userEmail = input.userEmail?.trim().toLowerCase() ?? '';
  if (!userEmail || userEmail !== officialEmail) {
    return 'unauthorized';
  }

  if (
    input.context.isActive &&
    input.context.activatedAt &&
    input.context.activationCompletedAt
  ) {
    return 'active';
  }

  if (
    !input.context.isActive &&
    !input.context.activatedAt &&
    !input.context.activationCompletedAt
  ) {
    return 'activation_incomplete';
  }

  return 'not_eligible';
}

export function clinicAccessErrorMessage(
  classification: ClinicAccessClassification,
): string {
  if (classification === 'unauthorized') {
    return 'This account is not authorized for clinic access.';
  }

  if (classification === 'activation_incomplete') {
    return 'activation_incomplete';
  }

  if (classification === 'not_approved') {
    return 'This clinic account is not approved for access.';
  }

  return 'This clinic account has not been activated yet.';
}

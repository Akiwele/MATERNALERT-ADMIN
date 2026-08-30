import {
  classifyClinicAccess,
  clinicAccessErrorMessage,
} from './clinicAccess.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const incompleteContext = {
  officialEmail: 'clinic@example.com',
  isActive: false,
  activatedAt: null,
  activationCompletedAt: null,
};

assert(
  classifyClinicAccess({
    profileRole: 'patient',
    userEmail: 'clinic@example.com',
    context: incompleteContext,
  }) === 'unauthorized',
  'Patients must not resume clinic activation.',
);

assert(
  classifyClinicAccess({
    profileRole: 'admin',
    userEmail: 'clinic@example.com',
    context: incompleteContext,
  }) === 'unauthorized',
  'Admins must not resume clinic activation.',
);

assert(
  classifyClinicAccess({
    profileRole: 'clinic',
    userEmail: 'clinic@example.com',
    context: null,
  }) === 'not_approved',
  'Missing approved clinic context must not resume.',
);

assert(
  classifyClinicAccess({
    profileRole: 'clinic',
    userEmail: 'other@example.com',
    context: incompleteContext,
  }) === 'unauthorized',
  'Email mismatch must not resume.',
);

assert(
  classifyClinicAccess({
    profileRole: 'clinic',
    userEmail: 'clinic@example.com',
    context: incompleteContext,
  }) === 'activation_incomplete',
  'Approved inactive clinic with matching email is incomplete.',
);

assert(
  classifyClinicAccess({
    profileRole: 'clinic',
    userEmail: 'clinic@example.com',
    context: {
      officialEmail: 'clinic@example.com',
      isActive: true,
      activatedAt: '2026-07-28T10:48:25.000Z',
      activationCompletedAt: '2026-07-28T10:48:25.000Z',
    },
  }) === 'active',
  'Fully activated clinics must classify as active.',
);

assert(
  classifyClinicAccess({
    profileRole: 'clinic',
    userEmail: 'clinic@example.com',
    context: {
      officialEmail: 'clinic@example.com',
      isActive: true,
      activatedAt: '2026-07-28T10:48:25.000Z',
      activationCompletedAt: null,
    },
  }) === 'not_eligible',
  'Inconsistent activation state must not use the resume path.',
);

assert(
  clinicAccessErrorMessage('unauthorized') ===
    'This account is not authorized for clinic access.',
  'Unauthorized message must stay generic.',
);

console.log('clinicAccess tests passed');

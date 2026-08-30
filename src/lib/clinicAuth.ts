import type { SupabaseClient, User } from '@supabase/supabase-js';

import {
  classifyClinicAccess,
  clinicAccessErrorMessage,
} from './clinicAccess';
import { clinicSupabase, supabase } from './supabase';

export type ClinicActivationContext = {
  clinicId: string;
  clinicName: string;
  officialEmail: string;
  isActive: boolean;
  activatedAt: string | null;
  activationCompletedAt: string | null;
};

export type AuthenticatedClinic = {
  clinicName: string;
};

export type IncompleteClinicActivation = {
  clinicName: string;
  officialEmail: string;
};

export type ClinicSessionInspection =
  | { status: 'none' }
  | { status: 'active'; clinic: AuthenticatedClinic }
  | { status: 'activation_incomplete'; clinic: IncompleteClinicActivation };

export class ClinicInvitationError extends Error {}

export class ClinicActivationRpcError extends Error {
  readonly code = 'activation_rpc_failed' as const;

  constructor(message: string) {
    super(message);
    this.name = 'ClinicActivationRpcError';
  }
}

export function isClinicActivationRpcError(
  error: unknown,
): error is ClinicActivationRpcError {
  return error instanceof ClinicActivationRpcError;
}

type ClinicActivationContextRow = {
  clinic_id: string;
  clinic_name: string;
  official_email: string;
  is_active: boolean;
  activated_at: string | null;
  activation_completed_at: string | null;
};

type InvitationParameters = {
  accessToken: string | null;
  refreshToken: string | null;
  code: string | null;
  tokenHash: string | null;
  type: string | null;
  errorCode: string | null;
  errorDescription: string | null;
};

function lostInvitationSessionError(): ClinicInvitationError {
  return new ClinicInvitationError(
    'Your clinic invitation session was lost. Please reopen a fresh invitation link from your email.',
  );
}

function readInvitationParameters(): InvitationParameters {
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const read = (name: string) => query.get(name) ?? hash.get(name);

  return {
    accessToken: read('access_token'),
    refreshToken: read('refresh_token'),
    code: read('code'),
    tokenHash: read('token_hash'),
    type: read('type'),
    errorCode: read('error_code') ?? read('error'),
    errorDescription: read('error_description'),
  };
}

function clearInvitationParameters(): void {
  window.history.replaceState({}, document.title, window.location.pathname);
}

function invitationErrorMessage(message?: string): string {
  const normalized = message?.toLowerCase() ?? '';

  if (
    normalized.includes('expired') ||
    normalized.includes('otp_expired') ||
    normalized.includes('token has expired')
  ) {
    return 'This clinic invitation has expired. Please ask the MaternAlert administrator to send a new invitation.';
  }

  return 'This clinic invitation link is invalid or has already been used. Please request a new invitation from the MaternAlert administrator.';
}

function toActivationContext(row: ClinicActivationContextRow): ClinicActivationContext {
  return {
    clinicId: row.clinic_id,
    clinicName: row.clinic_name,
    officialEmail: row.official_email,
    isActive: row.is_active,
    activatedAt: row.activated_at,
    activationCompletedAt: row.activation_completed_at,
  };
}

async function loadClinicActivationContext(
  client: SupabaseClient,
  user: User,
): Promise<ClinicActivationContext> {
  const { data, error } = await client.rpc('get_clinic_activation_context');
  const row = (data as ClinicActivationContextRow[] | null)?.[0];

  if (error || !row) {
    throw new ClinicInvitationError(
      'We could not find an approved clinic account for this invitation. Please contact the MaternAlert administrator.',
    );
  }

  if (
    !user.email ||
    row.official_email.trim().toLowerCase() !== user.email.trim().toLowerCase()
  ) {
    throw new ClinicInvitationError(
      'This invitation does not match the approved clinic account. Please contact the MaternAlert administrator.',
    );
  }

  return toActivationContext(row);
}

export async function initializeClinicInvitation(): Promise<ClinicActivationContext> {
  const parameters = readInvitationParameters();

  if (parameters.errorCode || parameters.errorDescription) {
    throw new ClinicInvitationError(
      invitationErrorMessage(parameters.errorDescription ?? parameters.errorCode ?? undefined),
    );
  }

  let sessionError: string | undefined;
  let establishedUserId: string | undefined;

  if (parameters.tokenHash) {
    if (parameters.type !== 'invite') {
      throw new ClinicInvitationError(invitationErrorMessage());
    }

    console.log('Clinic invitation initialization path: verifyOtp');
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: parameters.tokenHash,
      type: 'invite',
    });
    console.log('Clinic invitation verifyOtp returned session', data.session);
    console.log('Clinic invitation verifyOtp returned error', error);

    const { data: immediateSessionData, error: immediateSessionError } =
      await supabase.auth.getSession();
    console.log(
      'Clinic invitation session immediately after verifyOtp',
      {
        exists: Boolean(immediateSessionData.session),
        userId: immediateSessionData.session?.user.id ?? null,
        email: immediateSessionData.session?.user.email ?? null,
        error: immediateSessionError,
      },
    );

    sessionError = error?.message;
    establishedUserId = data.session?.user.id;
  } else if (parameters.code) {
    console.log('Clinic invitation initialization path: exchangeCodeForSession');
    const { data, error } = await supabase.auth.exchangeCodeForSession(parameters.code);
    console.log(
      'Clinic invitation exchangeCodeForSession returned session',
      data.session,
    );
    console.log('Clinic invitation exchangeCodeForSession returned error', error);

    const { data: immediateSessionData, error: immediateSessionError } =
      await supabase.auth.getSession();
    console.log(
      'Clinic invitation session immediately after exchangeCodeForSession',
      {
        exists: Boolean(immediateSessionData.session),
        userId: immediateSessionData.session?.user.id ?? null,
        email: immediateSessionData.session?.user.email ?? null,
        error: immediateSessionError,
      },
    );

    sessionError = error?.message;
    establishedUserId = data.session?.user.id;
  } else if (parameters.accessToken && parameters.refreshToken) {
    if (parameters.type !== 'invite') {
      throw new ClinicInvitationError(invitationErrorMessage());
    }

    console.log('Clinic invitation initialization path: setSession');
    const { data, error } = await supabase.auth.setSession({
      access_token: parameters.accessToken,
      refresh_token: parameters.refreshToken,
    });
    console.log('Clinic invitation setSession returned session', data.session);
    console.log('Clinic invitation setSession returned error', error);

    const { data: immediateSessionData, error: immediateSessionError } =
      await supabase.auth.getSession();
    console.log(
      'Clinic invitation session immediately after setSession',
      {
        exists: Boolean(immediateSessionData.session),
        userId: immediateSessionData.session?.user.id ?? null,
        email: immediateSessionData.session?.user.email ?? null,
        error: immediateSessionError,
      },
    );

    sessionError = error?.message;
    establishedUserId = data.session?.user.id;
  } else {
    console.log('Clinic invitation initialization path: existing session');
    const { data, error } = await supabase.auth.getSession();
    console.log('Clinic invitation existing session', data.session);
    console.log('Clinic invitation existing session error', error);
    sessionError = error?.message;
    establishedUserId = data.session?.user.id;

    if (!data.session && !sessionError) {
      throw new ClinicInvitationError(invitationErrorMessage());
    }
  }

  if (sessionError) {
    throw new ClinicInvitationError(invitationErrorMessage(sessionError));
  }

  if (!establishedUserId) {
    throw lostInvitationSessionError();
  }

  const { data: persistedSessionData, error: persistedSessionError } =
    await supabase.auth.getSession();
  const persistedSession = persistedSessionData.session;

  if (
    persistedSessionError ||
    !persistedSession ||
    persistedSession.user.id !== establishedUserId
  ) {
    throw lostInvitationSessionError();
  }

  console.log('Clinic invitation session immediately before URL cleanup', {
    exists: Boolean(persistedSession),
    userId: persistedSession?.user.id ?? null,
    email: persistedSession?.user.email ?? null,
    error: persistedSessionError,
  });

  clearInvitationParameters();

  const { data: postCleanupSessionData, error: postCleanupSessionError } =
    await supabase.auth.getSession();
  console.log('Clinic invitation session immediately after URL cleanup', {
    exists: Boolean(postCleanupSessionData.session),
    userId: postCleanupSessionData.session?.user.id ?? null,
    email: postCleanupSessionData.session?.user.email ?? null,
    error: postCleanupSessionError,
  });

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new ClinicInvitationError(invitationErrorMessage(error?.message));
  }

  try {
    const context = await loadClinicActivationContext(supabase, data.user);
    const { data: postContextSessionData, error: postContextSessionError } =
      await supabase.auth.getSession();
    console.log('Clinic invitation session after activation context load', {
      exists: Boolean(postContextSessionData.session),
      userId: postContextSessionData.session?.user.id ?? null,
      email: postContextSessionData.session?.user.email ?? null,
      error: postContextSessionError,
    });

    return context;
  } catch (contextError) {
    try {
      await supabase.auth.signOut();
    } catch {
      // Preserve the activation-context error if local session cleanup fails.
    }

    throw contextError;
  }
}

export function validateClinicPassword(password: string): string {
  if (!password) {
    return 'Please enter a password.';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters.';
  }

  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    return 'Password must include uppercase and lowercase letters and a number.';
  }

  return '';
}

async function completeClinicActivationWith(
  client: SupabaseClient,
): Promise<AuthenticatedClinic> {
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('Your clinic session expired. Please sign in again.');
  }

  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (profileError || profile?.role !== 'clinic') {
    throw new Error('This account is not authorized for clinic access.');
  }

  const context = await loadClinicActivationContext(client, userData.user);
  const classification = classifyClinicAccess({
    profileRole: profile.role,
    userEmail: userData.user.email,
    context: {
      officialEmail: context.officialEmail,
      isActive: context.isActive,
      activatedAt: context.activatedAt,
      activationCompletedAt: context.activationCompletedAt,
    },
  });

  if (classification === 'active') {
    return { clinicName: context.clinicName };
  }

  if (classification !== 'activation_incomplete') {
    throw new Error(clinicAccessErrorMessage(classification));
  }

  const { data, error } = await client.rpc('complete_clinic_account_activation');
  const activation = (
    data as
      | Array<{
          clinic_id: string;
          is_active: boolean;
          activated_at: string | null;
        }>
      | null
  )?.[0];

  if (error || !activation?.is_active || !activation.activated_at) {
    throw new ClinicActivationRpcError(
      'Clinic activation could not be completed. Please try again or contact the MaternAlert administrator.',
    );
  }

  return { clinicName: context.clinicName };
}

export async function activateClinicAccount(password: string): Promise<void> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  console.log('Clinic activation: session available', Boolean(sessionData.session));
  console.log('Clinic activation: session check error', sessionError);

  if (sessionError || !sessionData.session) {
    throw lostInvitationSessionError();
  }

  console.log('Clinic activation: updating password');
  const { error: passwordError } = await supabase.auth.updateUser({ password });
  console.log('Clinic activation: password update error', passwordError);

  if (passwordError) {
    throw new Error(passwordError.message);
  }

  console.log('Clinic activation: calling activation RPC');
  try {
    await completeClinicActivationWith(supabase);
  } catch (error) {
    if (isClinicActivationRpcError(error)) {
      throw new ClinicActivationRpcError(
        'Your password was saved, but clinic activation could not be completed. Use Retry Activation to finish without creating another password.',
      );
    }

    throw error;
  }
}

export async function retryClinicAccountActivation(): Promise<void> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session) {
    throw lostInvitationSessionError();
  }

  await completeClinicActivationWith(supabase);
}

export async function resumeClinicAccountActivation(): Promise<AuthenticatedClinic> {
  return completeClinicActivationWith(clinicSupabase);
}

async function inspectAuthenticatedClinic(
  client: SupabaseClient,
  user: User,
): Promise<ClinicSessionInspection> {
  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error('Unable to verify clinic access. Please try again.');
  }

  if (profile?.role !== 'clinic') {
    throw new Error('This account is not authorized for clinic access.');
  }

  let context: ClinicActivationContext | null = null;
  try {
    context = await loadClinicActivationContext(client, user);
  } catch {
    // Missing or ineligible activation context is classified below.
  }

  const classification = classifyClinicAccess({
    profileRole: profile.role,
    userEmail: user.email,
    context: context
      ? {
          officialEmail: context.officialEmail,
          isActive: context.isActive,
          activatedAt: context.activatedAt,
          activationCompletedAt: context.activationCompletedAt,
        }
      : null,
  });

  if (classification === 'active' && context) {
    return {
      status: 'active',
      clinic: { clinicName: context.clinicName },
    };
  }

  if (classification === 'activation_incomplete' && context) {
    return {
      status: 'activation_incomplete',
      clinic: {
        clinicName: context.clinicName,
        officialEmail: context.officialEmail,
      },
    };
  }

  throw new Error(clinicAccessErrorMessage(classification));
}

export async function restoreClinicSession(): Promise<ClinicSessionInspection> {
  const { data: sessionData, error: sessionError } =
    await clinicSupabase.auth.getSession();

  if (sessionError) {
    await clinicSupabase.auth.signOut();
    return { status: 'none' };
  }

  if (!sessionData.session) {
    return { status: 'none' };
  }

  const { data: userData, error: userError } = await clinicSupabase.auth.getUser();
  if (userError || !userData.user) {
    await clinicSupabase.auth.signOut();
    return { status: 'none' };
  }

  try {
    return await inspectAuthenticatedClinic(clinicSupabase, userData.user);
  } catch {
    await clinicSupabase.auth.signOut();
    return { status: 'none' };
  }
}

export async function signInClinic(
  email: string,
  password: string,
): Promise<ClinicSessionInspection> {
  const { data, error } = await clinicSupabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error || !data.user) {
    throw new Error('Invalid email or password.');
  }

  try {
    return await inspectAuthenticatedClinic(clinicSupabase, data.user);
  } catch (validationError) {
    await clinicSupabase.auth.signOut();
    throw validationError;
  }
}

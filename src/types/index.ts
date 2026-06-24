export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export type AccountStatus = 'Pending Activation' | 'Active' | 'Inactive';

export type ActivationStatus = 'Link Sent' | 'Activated' | 'Not Sent';

export type ClinicApplication = {
  id: string;
  facilityName: string;
  hefraLicenceNumber: string;
  facilityType: string;
  region: string;
  district: string;
  officialEmail: string;
  phoneNumber: string;
  contactPersonName: string;
  contactPersonRole: string;
  hefraDocumentName: string;
  status: ApplicationStatus;
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  activationToken?: string;
  accountStatus?: AccountStatus;
  activationStatus?: ActivationStatus;
};

export type SystemLog = {
  id: string;
  action: string;
  details: string;
  timestamp: string;
};

export type ClinicApplicationInput = Omit<
  ClinicApplication,
  | 'id'
  | 'status'
  | 'submittedAt'
  | 'reviewedAt'
  | 'rejectionReason'
  | 'activationToken'
  | 'accountStatus'
  | 'activationStatus'
>;

export type DocumentType = 'hefra';

import { SupportingDocumentsSection } from './SupportingDocumentsSection';
import { brand } from '../theme/brand';
import type { ClinicApplication } from '../types';

// eslint-disable-next-line react-refresh/only-export-components
export function formatDate(value?: string) {  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

type DetailFieldProps = {
  label: string;
  value: string;
};

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: '12px', color: brand.textSecondary, fontWeight: 600 }}>
        {label}
      </p>
      <p style={{ margin: '6px 0 0', fontSize: '14px', color: brand.text }}>{value}</p>
    </div>
  );
}

type PendingApplicationDetailsProps = {
  application: ClinicApplication;
  onViewDocument: () => void;
};

export function PendingApplicationDetails({
  application,
  onViewDocument,
}: PendingApplicationDetailsProps) {
  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}
      >
        <DetailField label="Facility Name" value={application.facilityName} />
        <DetailField label="HeFRA Licence Number" value={application.hefraLicenceNumber} />
        <DetailField label="Facility Type" value={application.facilityType} />
        <DetailField label="Region" value={application.region} />
        <DetailField label="District" value={application.district} />
        <DetailField label="Official Email" value={application.officialEmail} />
        <DetailField label="Official Phone Number" value={application.phoneNumber} />
        <DetailField label="Contact Person Name" value={application.contactPersonName} />
        <DetailField label="Contact Person Role" value={application.contactPersonRole} />
        <DetailField label="Submitted Date" value={formatDate(application.submittedAt)} />
      </div>

      <SupportingDocumentsSection
        onViewDocument={onViewDocument}
        hasDocument={Boolean(application.licenceDocumentPath)}
      />
    </div>
  );
}

type ApprovedClinicDetailsProps = {
  application: ClinicApplication;
};

export function ApprovedClinicDetails({ application }: ApprovedClinicDetailsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
      }}
    >
      <DetailField label="Facility Name" value={application.facilityName} />
      <DetailField label="Facility Type" value={application.facilityType} />
      <DetailField label="HeFRA Licence Number" value={application.hefraLicenceNumber} />
      <DetailField label="Official Email" value={application.officialEmail} />
      <DetailField label="Official Phone Number" value={application.phoneNumber} />
      <DetailField label="Contact Person Name" value={application.contactPersonName} />
      <DetailField label="Contact Person Role" value={application.contactPersonRole} />
      <DetailField label="Region" value={application.region} />
      <DetailField label="District" value={application.district} />
      <DetailField label="Date Approved" value={formatDate(application.reviewedAt)} />
      <DetailField label="Account Status" value={application.accountStatus ?? 'Pending Activation'} />
      <DetailField label="Activation Status" value={application.activationStatus ?? 'Link Sent'} />
      {application.activationToken ? (
        <DetailField label="Activation Token" value={application.activationToken} />
      ) : null}
    </div>
  );
}

type RejectedClinicDetailsProps = {
  application: ClinicApplication;
};

export function RejectedClinicDetails({ application }: RejectedClinicDetailsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
      }}
    >
      <DetailField label="Facility Name" value={application.facilityName} />
      <DetailField label="Facility Type" value={application.facilityType} />
      <DetailField label="HeFRA Licence Number" value={application.hefraLicenceNumber} />
      <DetailField label="Official Email" value={application.officialEmail} />
      <DetailField label="Official Phone Number" value={application.phoneNumber} />
      <DetailField label="Contact Person Name" value={application.contactPersonName} />
      <DetailField label="Contact Person Role" value={application.contactPersonRole} />
      <DetailField label="Region" value={application.region} />
      <DetailField label="District" value={application.district} />
      <DetailField label="Date Rejected" value={formatDate(application.reviewedAt)} />
      <DetailField
        label="Rejection Reason"
        value={application.rejectionReason?.trim() || 'No reason provided.'}
      />
      <DetailField
        label="Email Status"
        value={
          application.rejectionEmailStatus === 'sent'
            ? 'Rejected and email sent'
            : application.rejectionEmailStatus === 'failed'
              ? 'Rejected but email failed'
              : application.rejectionEmailStatus === 'processing'
                ? 'Rejection email is sending'
                : 'Rejection email not sent'
        }
      />
    </div>
  );
}

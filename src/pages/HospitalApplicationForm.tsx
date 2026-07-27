import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from 'react';

import { Button } from '../components/ui/Button';
import { FileUploadField } from '../components/ui/FileUploadField';
import { submitClinicApplication } from '../lib/clinicApplications';
import { APPLICATION_FACILITY_TYPES, GHANA_REGIONS } from '../store/initialData';
import { brand } from '../theme/brand';

const GHANA_PHONE_PATTERN = /^0\d{9}$/;
const GHANA_PHONE_ERROR =
  'Please enter a valid Ghanaian phone number: 10 digits starting with 0.';

type ApplicationFormState = {
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
  declarationAccepted: boolean;
};

const createInitialForm = (): ApplicationFormState => ({
  facilityName: '',
  hefraLicenceNumber: '',
  facilityType: APPLICATION_FACILITY_TYPES[0],
  region: GHANA_REGIONS[0],
  district: '',
  officialEmail: '',
  phoneNumber: '',
  contactPersonName: '',
  contactPersonRole: '',
  hefraDocumentName: '',
  declarationAccepted: false,
});

function getErrorMessage(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return 'Unable to submit the application. Please try again.';
}

function handleAcknowledgeApplicationSuccess() {
  window.close();

  window.setTimeout(() => {
    if (!window.closed) {
      window.history.back();
    }
  }, 100);
}

export function HospitalApplicationForm() {
  const [form, setForm] = useState<ApplicationFormState>(createInitialForm);
  const [formKey, setFormKey] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [licenceFile, setLicenceFile] = useState<File | null>(null);
  const [licencePreviewUrl, setLicencePreviewUrl] = useState('');
  const submissionInFlight = useRef(false);
  const licencePreviewUrlRef = useRef('');

  useEffect(
    () => () => {
      if (licencePreviewUrlRef.current) {
        URL.revokeObjectURL(licencePreviewUrlRef.current);
      }
    },
    [],
  );

  const updateField = <K extends keyof ApplicationFormState>(
    field: K,
    value: ApplicationFormState[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleFileChange = (file?: File) => {
    if (licencePreviewUrlRef.current) {
      URL.revokeObjectURL(licencePreviewUrlRef.current);
      licencePreviewUrlRef.current = '';
    }

    const previewUrl = file ? URL.createObjectURL(file) : '';
    licencePreviewUrlRef.current = previewUrl;
    setLicencePreviewUrl(previewUrl);
    setLicenceFile(file ?? null);
    updateField('hefraDocumentName', file?.name ?? '');
    setSubmissionError(null);
  };

  const handleClear = () => {
    if (licencePreviewUrlRef.current) {
      URL.revokeObjectURL(licencePreviewUrlRef.current);
      licencePreviewUrlRef.current = '';
    }
    setLicencePreviewUrl('');
    setLicenceFile(null);
    setForm(createInitialForm());
    setFormKey((current) => current + 1);
    setSubmissionError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submissionInFlight.current) {
      return;
    }

    const values = {
      facilityName: form.facilityName.trim(),
      hefraLicenceNumber: form.hefraLicenceNumber.trim(),
      facilityType: form.facilityType.trim(),
      region: form.region.trim(),
      district: form.district.trim(),
      officialEmail: form.officialEmail.trim(),
      phoneNumber: form.phoneNumber.trim(),
      contactPersonName: form.contactPersonName.trim(),
      contactPersonRole: form.contactPersonRole.trim(),
    };

    if (!GHANA_PHONE_PATTERN.test(values.phoneNumber)) {
      setSubmissionError(GHANA_PHONE_ERROR);
      return;
    }

    if (Object.values(values).some((value) => !value)) {
      setSubmissionError('Please complete all required fields before submitting.');
      return;
    }

    if (!form.declarationAccepted) {
      setSubmissionError('Please accept the declaration before submitting.');
      return;
    }

    if (!licenceFile) {
      setSubmissionError('Please select a HEFRA licence image before submitting.');
      return;
    }

    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedImageTypes.includes(licenceFile.type)) {
      setSubmissionError('The HEFRA licence image must be JPEG, PNG, or WEBP.');
      return;
    }

    if (licenceFile.size > 5 * 1024 * 1024) {
      setSubmissionError('The HEFRA licence image must be no larger than 5 MB.');
      return;
    }

    submissionInFlight.current = true;
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const formData = new FormData();
      formData.append('facility_name', values.facilityName);
      formData.append('hefra_licence_number', values.hefraLicenceNumber);
      formData.append('facility_type', values.facilityType);
      formData.append('region', values.region);
      formData.append('district', values.district);
      formData.append('official_email', values.officialEmail);
      formData.append('official_phone', values.phoneNumber);
      formData.append('contact_person_name', values.contactPersonName);
      formData.append('contact_person_role', values.contactPersonRole);
      formData.append('terms_accepted', String(form.declarationAccepted));
      formData.append('licence_image', licenceFile, licenceFile.name);

      await submitClinicApplication(formData);

      setSubmitted(true);
      handleClear();
    } catch (error) {
      setSubmissionError(getErrorMessage(error));
    } finally {
      submissionInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="apply-page">
        <div className="apply-card apply-success-card">
          <img src="/maternalert-logo.png" alt="MaternAlert" className="apply-logo" />
          <h1 style={{ margin: '16px 0 12px', color: brand.text, fontSize: '28px' }}>
            Application Submitted Successfully
          </h1>
          <p style={{ margin: 0, color: brand.textSecondary, lineHeight: 1.7, fontSize: '15px' }}>
            Your facility application has been received and is awaiting review by the MaternAlert
            Administration Team. You will be contacted through the official email provided after
            verification.
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '12px',
              marginTop: '28px',
            }}
          >
            <Button onClick={handleAcknowledgeApplicationSuccess}>Okay</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="apply-page">
      <div className="apply-card">
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img src="/maternalert-logo.png" alt="MaternAlert" className="apply-logo" />
          <h1 style={{ margin: '16px 0 8px', color: brand.text, fontSize: '28px' }}>
            Facility Access Application
          </h1>
        </div>

        <form key={formKey} onSubmit={handleSubmit} style={{ display: 'grid', gap: '28px' }}>
          <FormSection title="Facility Information">
            <FormGrid>
              <Field label="Facility Name" required>
                <input
                  value={form.facilityName}
                  onChange={(event) => updateField('facilityName', event.target.value)}
                  required
                  style={inputStyle}
                  placeholder="Enter facility name"
                />
              </Field>
              <Field label="HeFRA Licence Number" required>
                <input
                  value={form.hefraLicenceNumber}
                  onChange={(event) => updateField('hefraLicenceNumber', event.target.value)}
                  required
                  style={inputStyle}
                  placeholder="e.g. HFR-ACC-2024-1182"
                />
              </Field>
              <Field label="Facility Type" required>
                <select
                  value={form.facilityType}
                  onChange={(event) => updateField('facilityType', event.target.value)}
                  required
                  style={inputStyle}
                >
                  {APPLICATION_FACILITY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Field>
            </FormGrid>
          </FormSection>

          <FormSection title="Location Information">
            <FormGrid>
              <Field label="Region" required>
                <select
                  value={form.region}
                  onChange={(event) => updateField('region', event.target.value)}
                  required
                  style={inputStyle}
                >
                  {GHANA_REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="District" required>
                <input
                  value={form.district}
                  onChange={(event) => updateField('district', event.target.value)}
                  required
                  style={inputStyle}
                  placeholder="Enter district"
                />
              </Field>
            </FormGrid>
          </FormSection>

          <FormSection title="Contact Information">
            <FormGrid>
              <Field label="Official Email Address" required>
                <input
                  type="email"
                  value={form.officialEmail}
                  onChange={(event) => updateField('officialEmail', event.target.value)}
                  required
                  style={inputStyle}
                  placeholder="official@facility.gh"
                />
              </Field>
              <Field label="Official Phone Number" required>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.phoneNumber}
                  onChange={(event) => updateField('phoneNumber', event.target.value)}
                  required
                  style={inputStyle}
                  placeholder="0XXXXXXXXX"
                />
              </Field>
              <Field label="Contact Person Name" required>
                <input
                  value={form.contactPersonName}
                  onChange={(event) => updateField('contactPersonName', event.target.value)}
                  required
                  style={inputStyle}
                  placeholder="Full name"
                />
              </Field>
              <Field label="Contact Person Role" required>
                <input
                  value={form.contactPersonRole}
                  onChange={(event) => updateField('contactPersonRole', event.target.value)}
                  required
                  style={inputStyle}
                  placeholder="e.g. Medical Director"
                />
              </Field>
            </FormGrid>
          </FormSection>

          <FormSection title="Document Upload">
            <Field label="Upload HeFRA Licence" required controlId="hefra-licence-upload">
              <FileUploadField
                id="hefra-licence-upload"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                required
                value={form.hefraDocumentName}
                buttonLabel="Upload Licence"
                onChange={handleFileChange}
              />
              {licencePreviewUrl ? (
                <img
                  src={licencePreviewUrl}
                  alt="Selected HEFRA licence preview"
                  style={{
                    display: 'block',
                    width: '100%',
                    maxWidth: '420px',
                    maxHeight: '300px',
                    marginTop: '12px',
                    borderRadius: '10px',
                    border: `1px solid ${brand.border}`,
                    objectFit: 'contain',
                    backgroundColor: brand.background,
                  }}
                />
              ) : null}
            </Field>
          </FormSection>

          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: brand.primaryMuted,
              border: `1px solid ${brand.primaryLight}`,
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={form.declarationAccepted}
              onChange={(event) => updateField('declarationAccepted', event.target.checked)}
              required
              style={{ marginTop: '3px', width: '16px', height: '16px', accentColor: brand.primary }}
            />
            <span style={{ fontSize: '14px', color: brand.text, lineHeight: 1.6 }}>
              I confirm that I am authorized to register this facility on MaternAlert and that the
              information provided is accurate.
            </span>
          </label>

          {submissionError ? (
            <p role="alert" style={{ margin: 0, color: brand.danger, fontSize: '14px' }}>
              {submissionError}
            </p>
          ) : null}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Submitting application and uploading licence...'
                : 'Submit Application'}
            </Button>
            <Button type="button" variant="secondary" onClick={handleClear} disabled={isSubmitting}>
              Clear Form
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: 'grid', gap: '16px' }}>
      <h2
        style={{
          margin: 0,
          fontSize: '17px',
          color: brand.primaryDark,
          borderBottom: `1px solid ${brand.border}`,
          paddingBottom: '10px',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function FormGrid({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '16px',
      }}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  controlId,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  controlId?: string;
}) {
  return (
    <label
      htmlFor={controlId}
      style={{
        display: 'grid',
        gap: '6px',
        cursor: controlId ? 'pointer' : 'default',
      }}
    >
      <span style={{ fontSize: '14px', fontWeight: 600, color: brand.text }}>
        {label}
      </span>
      {children}
    </label>
  );
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  border: `1px solid ${brand.border}`,
  fontSize: '14px',
  boxSizing: 'border-box',
  backgroundColor: brand.white,
};

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';

import { Button } from '../components/ui/Button';
import { MaternAlertBrand } from '../components/MaternAlertBrand';
import { FileUploadField } from '../components/ui/FileUploadField';
import {
  getDistrictsForRegion,
  GHANA_REGIONS,
  type GhanaRegionValue,
} from '../data/ghanaAdministrativeAreas';
import { submitClinicApplication } from '../lib/clinicApplications';
import {
  APPLICATION_FACILITY_TYPES,
  REPRESENTATIVE_POSITIONS,
} from '../store/initialData';
import { brand } from '../theme/brand';

const GHANA_PHONE_PATTERN = /^0\d{9}$/;
const GHANA_PHONE_ERROR =
  'Please enter a valid Ghanaian phone number: 10 digits starting with 0.';

type ApplicationFormState = {
  facilityName: string;
  hefraLicenceNumber: string;
  facilityType: string;
  region: GhanaRegionValue | '';
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
  region: '',
  district: '',
  officialEmail: '',
  phoneNumber: '',
  contactPersonName: '',
  contactPersonRole: REPRESENTATIVE_POSITIONS[0],
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

  const handleRegionChange = (region: GhanaRegionValue | '') => {
    setForm((current) => ({ ...current, region, district: '' }));
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
          <MaternAlertBrand layout="stacked" size="lg" />
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

  const districtOptions = getDistrictsForRegion(form.region);

  return (
    <div className="apply-page">
      <div className="apply-card">
        <header className="apply-header">
          <MaternAlertBrand layout="stacked" size="lg" />
          <h1 className="apply-title">Facility Access Application</h1>
        </header>

        <form key={formKey} onSubmit={handleSubmit} className="apply-form">
          <FormSection title="Facility Information">
            <FormGrid>
              <Field label="Official Facility Name" required>
                <input
                  value={form.facilityName}
                  onChange={(event) => updateField('facilityName', event.target.value)}
                  required
                  className="apply-input"
                  placeholder="Enter the registered facility name"
                />
              </Field>
              <Field label="HeFRA Licence Number" required>
                <input
                  value={form.hefraLicenceNumber}
                  onChange={(event) => updateField('hefraLicenceNumber', event.target.value)}
                  required
                  className="apply-input"
                  placeholder="e.g. HFR-ACC-2024-1182"
                />
              </Field>
              <Field label="Healthcare Facility Category" required>
                <select
                  value={form.facilityType}
                  onChange={(event) => updateField('facilityType', event.target.value)}
                  required
                  className="apply-input"
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

          <FormSection title="Location">
            <FormGrid>
              <Field label="Region" required>
                <select
                  value={form.region}
                  onChange={(event) =>
                    handleRegionChange(event.target.value as GhanaRegionValue | '')
                  }
                  required
                  className="apply-input"
                >
                  <option value="" disabled>
                    Select region
                  </option>
                  {GHANA_REGIONS.map((region) => (
                    <option key={region.value} value={region.value}>
                      {region.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="District" required>
                <select
                  value={form.district}
                  onChange={(event) => updateField('district', event.target.value)}
                  required
                  disabled={!form.region}
                  className="apply-input"
                >
                  <option value="" disabled>
                    {form.region ? 'Select district' : 'Select a region first'}
                  </option>
                  {districtOptions.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </Field>
            </FormGrid>
          </FormSection>

          <FormSection title="Contact Information">
            <FormGrid>
              <Field label="Official Facility Email" required>
                <input
                  type="email"
                  value={form.officialEmail}
                  onChange={(event) => updateField('officialEmail', event.target.value)}
                  required
                  className="apply-input"
                  placeholder="official@facility.gh"
                />
              </Field>
              <Field label="Official Contact Number" required>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.phoneNumber}
                  onChange={(event) => updateField('phoneNumber', event.target.value)}
                  required
                  className="apply-input"
                  placeholder="0XXXXXXXXX"
                />
              </Field>
              <Field label="Authorized Representative" required>
                <input
                  value={form.contactPersonName}
                  onChange={(event) => updateField('contactPersonName', event.target.value)}
                  required
                  className="apply-input"
                  placeholder="Enter representative's full name"
                />
              </Field>
              <Field label="Representative Position" required>
                <select
                  value={form.contactPersonRole}
                  onChange={(event) => updateField('contactPersonRole', event.target.value)}
                  required
                  className="apply-input"
                >
                  {REPRESENTATIVE_POSITIONS.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
              </Field>
            </FormGrid>
          </FormSection>

          <FormSection title="Verification">
            <Field
              label="Upload HeFRA Licence Certificate"
              required
              controlId="hefra-licence-upload"
            >
              <div className="apply-upload-zone">
                <p className="apply-upload-title">Select your licence document to upload.</p>
                <p className="apply-upload-help">JPG, PNG or WEBP. Maximum 5 MB.</p>
                <FileUploadField
                  id="hefra-licence-upload"
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  required
                  value={form.hefraDocumentName}
                  buttonLabel="Choose File"
                  onChange={handleFileChange}
                />
                {licencePreviewUrl ? (
                  <img
                    src={licencePreviewUrl}
                    alt="Selected HEFRA licence preview"
                    className="apply-upload-preview"
                  />
                ) : null}
              </div>
            </Field>
            <label className="apply-declaration">
              <input
                type="checkbox"
                checked={form.declarationAccepted}
                onChange={(event) => updateField('declarationAccepted', event.target.checked)}
                required
                className="apply-declaration-checkbox"
              />
              <span className="apply-declaration-text">
                I confirm that I am authorized to register this facility on MaternAlert and that the
                information provided is accurate.
              </span>
            </label>

            {submissionError ? (
              <p role="alert" className="apply-error">
                {submissionError}
              </p>
            ) : null}

            <div className="apply-actions">
              <Button type="submit" disabled={isSubmitting} className="apply-action-button">
                {isSubmitting
                  ? 'Submitting application and uploading licence...'
                  : 'Submit Application'}
              </Button>
            </div>
          </FormSection>
        </form>
      </div>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="apply-section">
      <h2 className="apply-section-title">{title}</h2>
      {children}
    </section>
  );
}
function FormGrid({ children }: { children: ReactNode }) {
  return <div className="apply-grid">{children}</div>;
}

function Field({
  label,
  children,
  controlId,
  required = false,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  controlId?: string;
}) {
  return (
    <label htmlFor={controlId} className="apply-field">
      <span className="apply-label">
        {label}{' '}
        {required ? (
          <span className="apply-required" aria-hidden="true">
            *
          </span>
        ) : null}
      </span>
      {children}
    </label>
  );
}

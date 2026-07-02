import { useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';

import { Button } from '../components/ui/Button';
import { FileUploadField } from '../components/ui/FileUploadField';
import { useApp } from '../context/AppContext';
import { APPLICATION_FACILITY_TYPES, GHANA_REGIONS } from '../store/initialData';
import { brand } from '../theme/brand';

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

function handleAcknowledgeApplicationSuccess() {
  window.close();

  window.setTimeout(() => {
    if (!window.closed) {
      window.history.back();
    }
  }, 100);
}

export function HospitalApplicationForm() {
  const { submitApplication } = useApp();
  const [form, setForm] = useState<ApplicationFormState>(createInitialForm);
  const [formKey, setFormKey] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const updateField = <K extends keyof ApplicationFormState>(
    field: K,
    value: ApplicationFormState[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleFileChange = (file?: File) => {
    updateField('hefraDocumentName', file?.name ?? '');
  };

  const handleClear = () => {
    setForm(createInitialForm());
    setFormKey((current) => current + 1);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.declarationAccepted) {
      return;
    }

    const { declarationAccepted: _declaration, ...application } = form;
    // TODO: When backend/Firebase is connected, submitted clinic applications should be saved to
    // the database and appear automatically in the Admin Portal Pending Applications list.
    submitApplication(application);
    setSubmitted(true);
    handleClear();
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
                  value={form.phoneNumber}
                  onChange={(event) => updateField('phoneNumber', event.target.value)}
                  required
                  style={inputStyle}
                  placeholder="+233 XX XXX XXXX"
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
                accept=".pdf,.jpg,.jpeg,.png"
                required
                value={form.hefraDocumentName}
                buttonLabel="Upload Licence"
                onChange={handleFileChange}
              />
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

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <Button type="submit">Submit Application</Button>
            <Button type="button" variant="secondary" onClick={handleClear}>
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

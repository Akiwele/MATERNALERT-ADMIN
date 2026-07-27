import { FileText, ShieldCheck } from 'lucide-react';

import { HEFRA_OFFICIAL_REGISTRY_URL } from '../constants/hefra';

type SupportingDocumentsSectionProps = {
  onViewDocument: () => void;
  hasDocument: boolean;
};

function openHefraRegistry() {
  window.open(HEFRA_OFFICIAL_REGISTRY_URL, '_blank', 'noopener,noreferrer');
}

export function SupportingDocumentsSection({
  onViewDocument,
  hasDocument,
}: SupportingDocumentsSectionProps) {
  return (
    <section className="supporting-documents-section" aria-label="Supporting Documents">
      <div className="supporting-documents-grid">
        {hasDocument ? (
          <button type="button" className="supporting-doc-action-card" onClick={onViewDocument}>
            <span className="supporting-doc-action-card__icon" aria-hidden="true">
              <FileText size={17} strokeWidth={2} />
            </span>
            <span className="supporting-doc-action-card__content">
              <span className="supporting-doc-action-card__title">View Uploaded HEFRA Licence</span>
              <span className="supporting-doc-action-card__description">
                Open the uploaded licence document.
              </span>
            </span>
          </button>
        ) : (
          <div className="supporting-doc-action-card">
            <span className="supporting-doc-action-card__icon" aria-hidden="true">
              <FileText size={17} strokeWidth={2} />
            </span>
            <span className="supporting-doc-action-card__content">
              <span className="supporting-doc-action-card__title">HEFRA Licence Document</span>
              <span className="supporting-doc-action-card__description">
                No licence document was uploaded with this application.
              </span>
            </span>
          </div>
        )}

        <button type="button" className="supporting-doc-action-card" onClick={openHefraRegistry}>
          <span className="supporting-doc-action-card__icon" aria-hidden="true">
            <ShieldCheck size={17} strokeWidth={2} />
          </span>
          <span className="supporting-doc-action-card__content">
            <span className="supporting-doc-action-card__title">Verify on HEFRA Registry</span>
            <span className="supporting-doc-action-card__description">
              Open the official HEFRA verification website.
            </span>
          </span>
        </button>
      </div>
    </section>
  );
}

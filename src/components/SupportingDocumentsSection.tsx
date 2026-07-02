import { FileText, ShieldCheck } from 'lucide-react';

import { HEFRA_OFFICIAL_REGISTRY_URL } from '../constants/hefra';

type SupportingDocumentsSectionProps = {
  onViewDocument: () => void;
};

function openHefraRegistry() {
  window.open(HEFRA_OFFICIAL_REGISTRY_URL, '_blank', 'noopener,noreferrer');
}

export function SupportingDocumentsSection({ onViewDocument }: SupportingDocumentsSectionProps) {
  return (
    <section className="supporting-documents-section" aria-label="Supporting Documents">
      <div className="supporting-documents-grid">
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

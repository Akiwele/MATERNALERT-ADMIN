import { useId, useRef, type ChangeEvent } from 'react';

type FileUploadFieldProps = {
  accept?: string;
  required?: boolean;
  value?: string;
  buttonLabel?: string;
  id?: string;
  onChange: (file?: File) => void;
};

function UploadIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function FileUploadField({
  accept,
  required,
  value = '',
  buttonLabel = 'Upload Licence',
  id,
  onChange,
}: FileUploadFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.files?.[0]);
  };

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  return (
    <div className="file-upload">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        className="file-upload-input"
        accept={accept}
        required={required}
        onChange={handleInputChange}
        tabIndex={-1}
      />

      <button type="button" className="file-upload-button" onClick={openFilePicker}>
        <UploadIcon />
        <span>{buttonLabel}</span>
      </button>

      {value ? (
        <div className="file-upload-selected" aria-live="polite">
          <span className="file-upload-selected-label">Selected:</span>
          <span className="file-upload-selected-file">
            <span className="file-upload-filename">{value}</span>
            <span className="file-upload-check" aria-label="File selected">
              <CheckIcon />
            </span>
          </span>
        </div>
      ) : null}
    </div>
  );
}

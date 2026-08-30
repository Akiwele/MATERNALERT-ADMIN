import { useId, useRef, type ChangeEvent } from 'react';

type FileUploadFieldProps = {
  accept?: string;
  required?: boolean;
  value?: string;
  buttonLabel?: string;
  id?: string;
  onChange: (file?: File) => void;
};

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
        <span>{buttonLabel}</span>
      </button>

      {value ? (
        <div className="file-upload-selected" aria-live="polite">
          <span className="file-upload-selected-label">Selected:</span>
          <span className="file-upload-selected-file">
            <span className="file-upload-filename">{value}</span>
          </span>
        </div>
      ) : null}
    </div>
  );
}

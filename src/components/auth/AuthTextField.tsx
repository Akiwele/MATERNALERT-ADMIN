import { useState, type InputHTMLAttributes } from 'react';

type AuthTextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  isPassword?: boolean;
  error?: string;
};

function EyeIcon({ hidden }: { hidden: boolean }) {
  if (hidden) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-6.09"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1 1l22 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.12 14.12a3 3 0 1 1-4.24-4.24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AuthTextField({
  label,
  isPassword = false,
  error,
  className,
  ...inputProps
}: AuthTextFieldProps) {
  const [visible, setVisible] = useState(false);
  const inputType = isPassword ? (visible ? 'text' : 'password') : inputProps.type;

  return (
    <label className={`auth-field ${className ?? ''}`.trim()}>
      <span className="auth-field-label">{label}</span>
      <div className="auth-input-wrap">
        <input
          {...inputProps}
          type={inputType}
          className={`auth-input ${isPassword ? 'auth-input-password' : ''}`.trim()}
        />
        {isPassword ? (
          <button
            type="button"
            className="auth-password-toggle"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            <EyeIcon hidden={!visible} />
          </button>
        ) : null}
      </div>
      {error ? <span className="auth-field-error">{error}</span> : null}
    </label>
  );
}

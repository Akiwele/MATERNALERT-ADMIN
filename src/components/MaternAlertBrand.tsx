type MaternAlertBrandProps = {
  layout?: 'stacked' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  badge?: string;
  tone?: 'default' | 'light';
  logoClassName?: string;
  className?: string;
};

export function MaternAlertBrand({
  layout = 'stacked',
  size = 'md',
  badge,
  tone = 'default',
  logoClassName,
  className,
}: MaternAlertBrandProps) {
  const classes = [
    'maternalert-brand',
    `maternalert-brand-${layout}`,
    `maternalert-brand-${size}`,
    tone === 'light' ? 'maternalert-brand-light' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} aria-label="MaternAlert">
      <img
        src="/maternalert-logo.png"
        alt=""
        className={['maternalert-brand-logo', logoClassName].filter(Boolean).join(' ')}
      />
      <div className="maternalert-brand-wordmark">
        <span className="maternalert-brand-matern">Matern</span>
        <span className="maternalert-brand-alert">Alert</span>
        {badge ? <span className="maternalert-brand-badge">{badge}</span> : null}
      </div>
    </div>
  );
}

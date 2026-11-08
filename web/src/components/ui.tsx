import { useState, type ReactNode } from 'react';
import { plateFor } from '../hooks';
import { useI18n } from '../i18n';

export function Plate({ id, size = 190 }: { id: number; size?: number }) {
  const c = plateFor(id);
  return (
    <svg viewBox="0 0 200 140" width={size} height={size * 0.7} aria-hidden="true" focusable="false">
      <circle cx="100" cy="70" r="58" fill="#fff" stroke="#12301F" strokeWidth="2" />
      <circle cx="100" cy="70" r="44" fill={c.a} />
      <circle cx="84" cy="62" r="9" fill={c.b} />
      <circle cx="112" cy="58" r="9" fill={c.b} />
      <circle cx="104" cy="82" r="9" fill={c.b} />
    </svg>
  );
}

/** Photo or a generated plate when there is no (working) photo. */
export function Cover({ id, image, className }: { id: number; image?: string | null; className?: string }) {
  const [broken, setBroken] = useState(false);
  const c = plateFor(id);
  return (
    <div className={`cover ${className ?? ''}`} style={{ background: c.bg }}>
      {image && !broken ? <img src={image} alt="" onError={() => setBroken(true)} /> : <Plate id={id} />}
    </div>
  );
}

export function Loading() {
  const { t } = useI18n();
  return (
    <p className="loading" role="status">
      {t('loading')}
    </p>
  );
}

export function StateBox({
  tone = 'empty',
  title,
  body,
  detail,
  action,
}: {
  tone?: 'empty' | 'error';
  title: string;
  body: string;
  detail?: string;
  action?: ReactNode;
}) {
  return (
    <div className={`statebox ${tone}`} role={tone === 'error' ? 'alert' : undefined}>
      <svg width="72" height="72" viewBox="0 0 96 96" aria-hidden="true">
        {tone === 'error' ? (
          <>
            <rect x="14" y="14" width="68" height="68" rx="4" fill="#F6DAD4" />
            <path d="M48 32v22" stroke="#A52E1C" strokeWidth="6" strokeLinecap="round" />
            <circle cx="48" cy="66" r="4" fill="#A52E1C" />
          </>
        ) : (
          <>
            <circle cx="48" cy="52" r="34" fill="#fff" stroke="#12301F" strokeWidth="3" />
            <circle cx="48" cy="52" r="22" fill="#D3E8DA" />
            <path d="M20 20l8 8M76 20l-8 8M48 10v10" stroke="#12301F" strokeWidth="3" strokeLinecap="round" />
          </>
        )}
      </svg>
      <div>
        <h2>{title}</h2>
        <p>
          {body} {detail && <code>{detail}</code>}
        </p>
        {action}
      </div>
    </div>
  );
}

export function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <span className="hint">{hint}</span>}
      {error && (
        <span className="error-text" id={`${id}-err`}>
          {error}
        </span>
      )}
    </div>
  );
}

export function TagChip({ children }: { children: ReactNode }) {
  return <span className="tag">{children}</span>;
}

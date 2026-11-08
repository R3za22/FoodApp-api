import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../api/mock';
import { useAuth } from '../auth';
import { Field } from '../components/ui';
import { fieldMessage } from '../hooks';
import { useI18n } from '../i18n';

export default function AuthPage() {
  const { t } = useI18n();
  const { signIn } = useAuth();
  const nav = useNavigate();
  const [su, setSu] = useState({ name: '', email: '', password: '' });
  const [suErr, setSuErr] = useState<unknown>(null);
  const [suOk, setSuOk] = useState(false);
  const [li, setLi] = useState({ email: '', password: '' });
  const [liFailed, setLiFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSignUp(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setSuErr(null);
    setSuOk(false);
    try {
      await api.signUp(su);
      setSuOk(true);
      setLi({ email: su.email, password: '' });
    } catch (err) {
      setSuErr(err);
    } finally {
      setBusy(false);
    }
  }

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setLiFailed(false);
    try {
      signIn(await api.login(li.email, li.password));
      nav('/', { replace: true });
    } catch {
      setLiFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-grid wrap">
      <section className="hero">
        <h1>{t('heroTitle')}</h1>
        <p>{t('heroBody')}</p>
        {api.mode === 'mock' && (
          <p className="mono-note">
            {t('demoAccount')}{' '}
            <button
              type="button"
              className="link-btn"
              onClick={() => setLi({ email: DEMO_EMAIL, password: DEMO_PASSWORD })}
            >
              ↵
            </button>
          </p>
        )}
      </section>

      <form className="card form" onSubmit={onSignUp} noValidate aria-labelledby="su-h">
        <h2 id="su-h">{t('signUpTitle')}</h2>
        <Field id="su-name" label={t('name')} error={fieldMessage(suErr, 'name')}>
          <input id="su-name" autoComplete="name" required value={su.name} onChange={(e) => setSu({ ...su, name: e.target.value })} />
        </Field>
        <Field id="su-email" label={t('email')} error={fieldMessage(suErr, 'email')}>
          <input id="su-email" type="email" autoComplete="email" required value={su.email} onChange={(e) => setSu({ ...su, email: e.target.value })} />
        </Field>
        <Field id="su-pass" label={t('password')} error={fieldMessage(suErr, 'password')}>
          <input id="su-pass" type="password" autoComplete="new-password" required value={su.password} onChange={(e) => setSu({ ...su, password: e.target.value })} aria-invalid={!!fieldMessage(suErr, 'password')} />
        </Field>
        {suOk && (
          <p className="success" role="status">
            {t('signedUp')}
          </p>
        )}
        <button className="btn dark" type="submit" disabled={busy}>
          {t('signUp')}
        </button>
        <p className="note">{t('signUpNote')}</p>
      </form>

      <form className="card form" onSubmit={onLogin} aria-labelledby="li-h">
        <h2 id="li-h">{t('logInTitle')}</h2>
        {liFailed && (
          <div className="alert" role="alert">
            <strong>{t('loginFailedTitle')}</strong> {t('loginFailedBody')}
          </div>
        )}
        <Field id="li-email" label={t('email')}>
          <input id="li-email" type="email" autoComplete="username" required value={li.email} onChange={(e) => setLi({ ...li, email: e.target.value })} />
        </Field>
        <Field id="li-pass" label={t('password')}>
          <input id="li-pass" type="password" autoComplete="current-password" required value={li.password} onChange={(e) => setLi({ ...li, password: e.target.value })} />
        </Field>
        <button className="btn dark" type="submit" disabled={busy}>
          {t('logIn')}
        </button>
        <p className="note">{t('logInNote')}</p>
      </form>
    </div>
  );
}

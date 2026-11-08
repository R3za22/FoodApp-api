import { useState, type FormEvent } from 'react';
import { api, isDemo } from '../api';
import { DEMO_TOKEN } from '../api/constants';
import { useAuth } from '../auth';
import { Field, Loading, StateBox } from '../components/ui';
import { fieldMessage, useLoad } from '../hooks';
import { useI18n } from '../i18n';

export default function ProfilePage() {
  const { t, lang } = useI18n();
  const { token, signOut, signIn } = useAuth();
  const me = useLoad((tk) => api.me(tk), []);
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<unknown>(null);
  const [saved, setSaved] = useState(false);
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);

  if (me.loading) return <div className="wrap"><Loading /></div>;
  if (me.error || !me.data)
    return <div className="wrap"><StateBox tone="error" title={t('errorTitle')} body={t('errorBody')} action={<button className="btn danger" onClick={me.reload}>{t('retry')}</button>} /></div>;

  const user = me.data;
  const curName = name ?? user.name;
  const curEmail = email ?? user.email;
  const tok = token ?? '';
  const masked = tok.length > 4 ? '•'.repeat(28) + ' ' + tok.slice(-4) : '••••';
  const shownToken = shown ? tok : masked;

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setErr(null);
    setSaved(false);
    try {
      await api.updateMe(token, { name: curName, email: curEmail, ...(password ? { password } : {}) });
      setPassword('');
      setSaved(true);
      me.reload();
    } catch (e2) {
      setErr(e2);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(tok);
      setCopied(true);
    } catch {
      setShown(true); // clipboard blocked: reveal so it can be selected by hand
    }
  }

  return (
    <div className="wrap">
      <h1>{t('navProfile')}</h1>
      <div className="two-col">
        <form className="card form" onSubmit={onSave} noValidate>
          <h2>{t('profileTitle')}</h2>
          <div className="row"><div className="avatar" aria-hidden="true">{curName.trim().charAt(0).toUpperCase()}</div><p className="note">{t('avatarNote')}</p></div>
          <Field id="p-name" label={t('name')} error={fieldMessage(err, 'name')}><input id="p-name" value={curName} onChange={(e) => setName(e.target.value)} /></Field>
          <Field id="p-email" label={t('email')} error={fieldMessage(err, 'email')}><input id="p-email" type="email" value={curEmail} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Field id="p-pass" label={t('newPassword')} error={fieldMessage(err, 'password')}><input id="p-pass" type="password" autoComplete="new-password" placeholder={t('passwordPlaceholder')} value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
          <div className="row"><button className="btn dark" type="submit">{t('saveChanges')}</button>{saved && <span role="status" className="success">{t('saved')}</span>}</div>
        </form>
        <section className="stack">
          <div className="card">
            <h2>{t('tokenTitle')}</h2>
            <p>{t('tokenBody')}</p>
            <div className="token-row">
              <code className="token" data-testid="token" dir="ltr">{shownToken}</code>
              <button className="btn ghost small" onClick={() => setShown(!shown)} aria-pressed={shown}>{shown ? t('hide') : t('reveal')}</button>
              <button className="btn ghost small" onClick={copy}>{copied ? t('copied') : t('copy')}</button>
            </div>
            <pre className="curl" dir="ltr">{`curl ${api.mode === 'live' ? '<API_BASE>' : 'https://<your-api>'}/api/recipe/recipes/ \\\n  -H "Authorization: Token ${shown ? tok : '<YOUR-TOKEN>'}"`}</pre>
            {api.mode === 'mock' && <p className="note">{t('mockTokenNote')}</p>}
          </div>
          <div className="card">
            <h2>{t('sessionTitle')}</h2>
            <p>{t('sessionBody')}</p>
            <button className="btn ghost" onClick={signOut}>{t('logOut')}</button>
          </div>
          {api.mode === 'mock' && (
            <div className="card">
              <h2>{t('resetDemo')}</h2>
              <p>{t('resetDemoBody')}</p>
              <button className="btn ghost" onClick={() => { api.resetDemo?.(lang); if (isDemo) signIn(DEMO_TOKEN); else signOut(); me.reload(); }}>{t('resetDemo')}</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

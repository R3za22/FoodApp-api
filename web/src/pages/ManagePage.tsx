import { useState, type FormEvent } from 'react';
import { api, type AttrKind, type Ingredient, type Tag } from '../api';
import { useAuth } from '../auth';
import { Field, Loading, StateBox } from '../components/ui';
import { fieldMessage, useLoad } from '../hooks';
import { useI18n } from '../i18n';

type Item = Tag | Ingredient;

function Section({ kind }: { kind: AttrKind }) {
  const { t, num } = useI18n();
  const { token } = useAuth();
  const list = useLoad((tk) => api.listAttrs(tk, kind), [kind]);
  const [name, setName] = useState('');
  const [err, setErr] = useState<unknown>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const [confirm, setConfirm] = useState<Item | null>(null);
  const [failed, setFailed] = useState(false);
  const label = kind === 'tags' ? t('newTag') : t('newIngredient');
  const path = kind === 'tags' ? '/api/recipe/tags/' : '/api/recipe/ingredient/';

  async function run(fn: () => Promise<unknown>): Promise<boolean> {
    setFailed(false);
    try {
      await fn();
      list.reload();
      return true;
    } catch (e) {
      setErr(e);
      setFailed(true);
      return false;
    }
  }

  async function add(e: FormEvent) {
    e.preventDefault();
    if (!token || !name.trim()) return;
    setErr(null);
    if (await run(() => api.createAttr(token, kind, name))) setName('');
  }
  async function rename(item: Item) {
    if (!token || !draft.trim()) return;
    setErr(null);
    if (await run(() => api.renameAttr(token, kind, item.id, draft))) setEditing(null);
  }
  const uses = (n: number) => (n === 0 ? t('notUsed') : n === 1 ? t('usedInOne') : t('usedIn', { n: num(n) }));
  const items: Item[] = list.data ?? [];

  return (
    <section className="card manage-sec" aria-labelledby={`h-${kind}`}>
      <div className="row between">
        <h2 id={`h-${kind}`}>{kind === 'tags' ? t('tags') : t('ingredients')}</h2>
        <code>{path}</code>
      </div>
      <form className="inline-add" onSubmit={add}>
        <Field id={`new-${kind}`} label={label} error={fieldMessage(err, 'name')}>
          <input id={`new-${kind}`} placeholder={kind === 'tags' ? t('tagPlaceholder') : t('ingredientPlaceholder')} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <button className="btn dark" type="submit">{kind === 'tags' ? t('addTag') : t('addIngredient')}</button>
      </form>
      {failed && !fieldMessage(err, 'name') && <div className="alert" role="alert">{t('genericError')}</div>}
      {list.loading && <Loading />}
      {list.error && <StateBox tone="error" title={t('errorTitle')} body={t('errorBody')} action={<button className="btn danger" onClick={list.reload}>{t('retry')}</button>} />}
      {list.data && items.length === 0 && <p className="note">{t('emptyList')}</p>}
      <ul className="rows">
        {items.map((it) => (
          <li key={it.id}>
            {editing === it.id ? (
              <form className="inline-add grow" onSubmit={(e) => { e.preventDefault(); void rename(it); }}>
                <Field id={`ren-${kind}-${it.id}`} label={t('ingredientName')}>
                  <input id={`ren-${kind}-${it.id}`} autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} />
                </Field>
                <button className="btn dark small" type="submit">{t('save')}</button>
                <button className="btn ghost small" type="button" onClick={() => setEditing(null)}>{t('cancel')}</button>
              </form>
            ) : (
              <>
                <span className="name">{it.name}</span>
                <span className="uses">{uses(it.recipe_count ?? 0)}</span>
                <button className="link-btn" onClick={() => { setEditing(it.id); setDraft(it.name); }}>{t('rename')}</button>
                <button className="icon-btn" aria-label={t('deleteAttr', { name: it.name })} onClick={() => setConfirm(it)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
      {confirm && (
        <div className="alert" role="alertdialog" aria-label={t('deleteAttrTitle', { name: confirm.name })}>
          <strong>{t('deleteAttrTitle', { name: confirm.name })}</strong> {t('deleteAttrBody', { n: num(confirm.recipe_count ?? 0) })}
          <div className="row">
            <button className="btn danger small" onClick={async () => { if (token && (await run(() => api.deleteAttr(token, kind, confirm.id)))) setConfirm(null); }}>{t('delete')}</button>
            <button className="btn ghost small" onClick={() => setConfirm(null)}>{t('keepIt')}</button>
          </div>
        </div>
      )}
    </section>
  );
}

export default function ManagePage() {
  const { t } = useI18n();
  return (
    <div className="wrap">
      <div className="page-head"><div><h1>{t('manageTitle')}</h1><p className="note">{t('manageIntro')}</p></div></div>
      <div className="two-col even">
        <Section kind="tags" />
        <Section kind="ingredients" />
      </div>
    </div>
  );
}

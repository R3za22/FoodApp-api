import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, type Ingredient, type RecipeDetail, type Tag } from '../api';
import { useAuth } from '../auth';
import { Cover, Field, Loading, StateBox } from '../components/ui';
import { fieldMessage, useLoad, validateRecipeForm } from '../hooks';
import { useI18n } from '../i18n';

export default function EditPage() {
  const { id } = useParams();
  const editing = id !== undefined;
  const rid = editing ? Number(id) : null;
  const { t } = useI18n();
  const { token } = useAuth();
  const nav = useNavigate();

  const existing = useLoad<RecipeDetail | null>((tk) => (rid ? api.getRecipe(tk, rid) : Promise.resolve(null)), [rid]);
  const allTags = useLoad((tk) => api.listAttrs(tk, 'tags') as Promise<Tag[]>, []);
  const allIngs = useLoad((tk) => api.listAttrs(tk, 'ingredients') as Promise<Ingredient[]>, []);

  const [f, setF] = useState({ title: '', description: '', time: '', price: '', link: '' });
  const [tags, setTags] = useState<string[]>([]);
  const [ings, setIngs] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [newIng, setNewIng] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saveErr, setSaveErr] = useState<unknown>(null);
  const [busy, setBusy] = useState<'save' | 'upload' | null>(null);

  useEffect(() => {
    const r = existing.data;
    if (!r) return;
    setF({ title: r.title, description: r.description ?? '', time: String(r.time_minutes), price: r.price, link: r.link ?? '' });
    setTags((r.tags ?? []).map((x) => x.name));
    setIngs((r.ingredients ?? []).map((x) => x.name));
    setPreview(r.image ?? null);
  }, [existing.data]);


  const errors = validateRecipeForm(f);
  const msg = (k: keyof typeof errors, field: string) =>
    (submitted && errors[k] ? t(errors[k]!) : undefined) ?? fieldMessage(saveErr, field);

  function addName(list: string[], set: (v: string[]) => void, value: string, clear: () => void) {
    const v = value.trim();
    if (v && !list.some((x) => x.toLowerCase() === v.toLowerCase())) set([...list, v]);
    clear();
  }
  const toggleIng = (name: string) => setIngs(ings.includes(name) ? ings.filter((x) => x !== name) : [...ings, name]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setSaveErr(null);
    if (Object.keys(errors).length || !token) return;
    setBusy('save');
    try {
      const saved = await api.saveRecipe(token, rid, {
        title: f.title.trim(), description: f.description, time_minutes: Number(f.time),
        price: f.price.trim(), link: f.link.trim(), tags, ingredients: ings,
      });
      if (file) {
        setBusy('upload');
        await api.setImage(token, saved.id, file);
      } else if (removePhoto && existing.data?.image) {
        await api.setImage(token, saved.id, null);
      }
      nav(`/recipes/${saved.id}`, { replace: true });
    } catch (err) {
      setSaveErr(err);
      setBusy(null);
    }
  }

  if (editing && existing.loading) return <div className="wrap"><Loading /></div>;
  if (editing && existing.error)
    return (
      <div className="wrap">
        {existing.error.status === 404 ? (
          <StateBox title={t('notFoundTitle')} body={t('notFoundBody')} action={<Link className="btn ghost" to="/">{t('backHome')}</Link>} />
        ) : (
          <StateBox tone="error" title={t('errorTitle')} body={t('errorBody')} action={<button className="btn danger" onClick={existing.reload}>{t('retry')}</button>} />
        )}
      </div>
    );

  const suggestedTags = (allTags.data ?? []).filter((x) => !tags.includes(x.name));
  const ingChoices = Array.from(new Set([...(allIngs.data ?? []).map((x) => x.name), ...ings]));

  return (
    <form className="wrap edit" onSubmit={onSubmit} noValidate>
      <div className="page-head">
        <div>
          <Link to={editing ? `/recipes/${rid}` : '/'} className="back">← {editing ? t('backToRecipe') : t('allRecipes')}</Link>
          <h1>{editing ? t('editTitle') : t('newTitle')}</h1>
        </div>
        <div className="row">
          <Link className="btn ghost" to={editing ? `/recipes/${rid}` : '/'}>{t('cancel')}</Link>
          <button className="btn primary" type="submit" disabled={busy !== null}>
            {busy === 'save' ? t('saving') : busy === 'upload' ? t('uploading') : t('saveRecipe')}
          </button>
        </div>
      </div>
      {saveErr != null && !Object.keys((saveErr as { fields?: object }).fields ?? {}).length && (
        <div className="alert" role="alert">{t('genericError')}</div>
      )}

      <div className="two-col">
        <div className="stack">
          <fieldset className="card">
            <legend>{t('basics')}</legend>
            <Field id="r-title" label={t('titleLabel')} error={msg('title', 'title')}>
              <input id="r-title" required value={f.title} aria-invalid={!!msg('title', 'title')} aria-describedby="r-title-err" onChange={(e) => setF({ ...f, title: e.target.value })} />
            </Field>
            <Field id="r-desc" label={t('descLabel')}>
              <textarea id="r-desc" rows={6} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
            </Field>
            <div className="split">
              <Field id="r-time" label={t('timeLabel')} error={msg('time', 'time_minutes')}>
                <input id="r-time" inputMode="numeric" value={f.time} aria-invalid={!!msg('time', 'time_minutes')} aria-describedby="r-time-err" onChange={(e) => setF({ ...f, time: e.target.value })} />
              </Field>
              <Field id="r-price" label={t('priceLabel')} error={msg('price', 'price')}>
                <input id="r-price" inputMode="decimal" value={f.price} aria-invalid={!!msg('price', 'price')} aria-describedby="r-price-err" onChange={(e) => setF({ ...f, price: e.target.value })} />
              </Field>
            </div>
            <Field id="r-link" label={t('linkLabel')} error={msg('link', 'link')}>
              <input id="r-link" type="url" placeholder="https://" value={f.link} aria-invalid={!!msg('link', 'link')} aria-describedby="r-link-err" onChange={(e) => setF({ ...f, link: e.target.value })} />
            </Field>
          </fieldset>

          <fieldset className="card">
            <legend>{t('tags')}</legend>
            <div className="chips">
              {tags.map((n) => (
                <span key={n} className="tag removable">
                  {n}
                  <button type="button" aria-label={t('removeTag', { name: n })} onClick={() => setTags(tags.filter((x) => x !== n))}>×</button>
                </span>
              ))}
            </div>
            <div className="inline-add">
              <Field id="r-newtag" label={t('addTagLabel')} hint={t('addTagHelp')}>
                <input id="r-newtag" value={newTag} onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addName(tags, setTags, newTag, () => setNewTag('')); } }} />
              </Field>
              <button type="button" className="btn ghost" onClick={() => addName(tags, setTags, newTag, () => setNewTag(''))}>{t('addTag')}</button>
            </div>
            {suggestedTags.length > 0 && (
              <div className="chips">
                {suggestedTags.map((x) => (
                  <button key={x.id} type="button" className="chip-btn tag" onClick={() => setTags([...tags, x.name])}>+ {x.name}</button>
                ))}
              </div>
            )}
          </fieldset>

          <fieldset className="card">
            <legend>{t('ingredients')}</legend>
            <div className="check-grid">
              {ingChoices.map((n, i) => (
                <div key={n} className="check">
                  <input id={`ig${i}`} type="checkbox" checked={ings.includes(n)} onChange={() => toggleIng(n)} />
                  <label htmlFor={`ig${i}`}>{n}</label>
                </div>
              ))}
            </div>
            <div className="inline-add">
              <Field id="r-newing" label={t('addIngredientLabel')}>
                <input id="r-newing" value={newIng} onChange={(e) => setNewIng(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addName(ings, setIngs, newIng, () => setNewIng('')); } }} />
              </Field>
              <button type="button" className="btn ghost" onClick={() => addName(ings, setIngs, newIng, () => setNewIng(''))}>{t('addIngredient')}</button>
            </div>
          </fieldset>
        </div>

        <div className="stack">
          <fieldset className="card">
            <legend>{t('photo')}</legend>
            <Cover id={rid ?? 0} image={removePhoto ? null : preview} />
            <Field id="r-img" label={t('choosePhoto')} hint={t('photoHelp')} error={fieldMessage(saveErr, 'image')}>
              <input id="r-img" type="file" accept="image/*" onChange={(e) => {
                const picked = e.target.files?.[0] ?? null;
                setFile(picked);
                setRemovePhoto(false);
                if (picked) setPreview(URL.createObjectURL(picked));
              }} />
            </Field>
            {(preview || file) && !removePhoto && (
              <button type="button" className="link-btn danger" onClick={() => { setRemovePhoto(true); setFile(null); }}>{t('removePhoto')}</button>
            )}
          </fieldset>
        </div>
      </div>
    </form>
  );
}

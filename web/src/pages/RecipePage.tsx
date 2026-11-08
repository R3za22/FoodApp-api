import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import { Cover, Loading, StateBox, TagChip } from '../components/ui';
import { useLoad } from '../hooks';
import { useI18n } from '../i18n';

function hostOf(link: string): string {
  try {
    return new URL(link).hostname;
  } catch {
    return link;
  }
}

export default function RecipePage() {
  const { id } = useParams();
  const rid = Number(id);
  const { t, num, price } = useI18n();
  const { token } = useAuth();
  const nav = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [failed, setFailed] = useState(false);
  const r = useLoad((tk) => api.getRecipe(tk, rid), [rid]);

  if (r.loading) return <div className="wrap"><Loading /></div>;
  if (r.error?.status === 404 || !Number.isInteger(rid))
    return (
      <div className="wrap">
        <StateBox title={t('notFoundTitle')} body={t('notFoundBody')} action={<Link className="btn ghost" to="/">{t('backHome')}</Link>} />
      </div>
    );
  if (r.error || !r.data)
    return (
      <div className="wrap">
        <StateBox tone="error" title={t('errorTitle')} body={t('errorBody')} detail={`GET /api/recipe/recipes/${rid}/`} action={<button className="btn danger" onClick={r.reload}>{t('retry')}</button>} />
      </div>
    );
  const rec = r.data;

  async function remove() {
    if (!token) return;
    try {
      await api.deleteRecipe(token, rid);
      nav('/', { replace: true });
    } catch {
      setFailed(true);
    }
  }

  return (
    <div className="wrap">
      <Link to="/" className="back">← {t('allRecipes')}</Link>
      <article>
        <div className="detail-top">
          <Cover id={rec.id} image={rec.image} className="big" />
          <div className="detail-main">
            <div className="tags">{(rec.tags ?? []).map((tg) => <TagChip key={tg.id}>{tg.name}</TagChip>)}</div>
            <h1 className="display">{rec.title}</h1>
            <dl className="facts">
              <div><dt>{t('time')}</dt><dd>{t('minutes', { n: num(rec.time_minutes) })}</dd></div>
              <div><dt>{t('price')}</dt><dd>{price(rec.price)}</dd></div>
              {rec.link && (
                <div><dt>{t('source')}</dt><dd><a href={rec.link} rel="noopener noreferrer" target="_blank">{hostOf(rec.link)}</a></dd></div>
              )}
            </dl>
            <div className="row">
              <Link className="btn primary" to={`/recipes/${rec.id}/edit`}>{t('editRecipe')}</Link>
              <button className="link-btn danger" onClick={() => setConfirming(true)}>{t('delete')}</button>
            </div>
            {confirming && (
              <div className="alert" role="alertdialog" aria-label={t('deleteConfirm')}>
                <strong>{t('deleteConfirm')}</strong> {t('deleteConfirmBody')}
                {failed && <p className="error-text">{t('genericError')}</p>}
                <div className="row">
                  <button className="btn danger" onClick={remove}>{t('delete')}</button>
                  <button className="btn ghost" onClick={() => setConfirming(false)}>{t('keepIt')}</button>
                </div>
              </div>
            )}
          </div>
        </div>
        <section className="detail-body">
          <div>
            <h2>{t('ingredients')}</h2>
            {(rec.ingredients ?? []).length === 0 ? (
              <p className="note">{t('noIngredients')}</p>
            ) : (
              <ul className="ing-list">
                {(rec.ingredients ?? []).map((i) => <li key={i.id}>{i.name}</li>)}
              </ul>
            )}
          </div>
          <div>
            <h2>{t('method')}</h2>
            <p className="method">{rec.description || '—'}</p>
          </div>
        </section>
      </article>
    </div>
  );
}

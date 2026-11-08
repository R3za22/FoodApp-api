import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, type Ingredient, type RecipeSummary, type Tag } from '../api';
import { Cover, Loading, StateBox, TagChip } from '../components/ui';
import { filterByTitle, parseIds, useLoad } from '../hooks';
import { useI18n } from '../i18n';

function Toggle({ on, onClick, children, variant }: { on: boolean; onClick(): void; children: string; variant: 'tag' | 'ing' }) {
  return (
    <button type="button" className={`chip-btn ${variant} ${on ? 'on' : ''}`} aria-pressed={on} onClick={onClick}>
      {children}
    </button>
  );
}

export default function RecipesPage() {
  const { t, num, price } = useI18n();
  const [params, setParams] = useSearchParams();
  const tagIds = useMemo(() => parseIds(params.get('tags')), [params]);
  const ingIds = useMemo(() => parseIds(params.get('ingredients')), [params]);
  const q = params.get('q') ?? '';

  const tags = useLoad((tk) => api.listAttrs(tk, 'tags') as Promise<Tag[]>, []);
  const ings = useLoad((tk) => api.listAttrs(tk, 'ingredients') as Promise<Ingredient[]>, []);
  const recipes = useLoad(
    (tk) => api.listRecipes(tk, { tags: tagIds, ingredients: ingIds }),
    [tagIds.join(','), ingIds.join(',')],
  );

  function update(next: { tags?: number[]; ingredients?: number[]; q?: string }) {
    const p = new URLSearchParams(params);
    const set = (k: string, v: string) => (v ? p.set(k, v) : p.delete(k));
    set('tags', (next.tags ?? tagIds).join(','));
    set('ingredients', (next.ingredients ?? ingIds).join(','));
    set('q', next.q ?? q);
    setParams(p, { replace: true });
  }
  const toggle = (list: number[], id: number) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const filtered = !!(tagIds.length || ingIds.length || q);
  const clear = () => setParams({}, { replace: true });

  const items: RecipeSummary[] = filterByTitle(recipes.data ?? [], q);
  const names = (list: Tag[] | Ingredient[] | null, ids: number[]) =>
    (list ?? []).filter((x) => ids.includes(x.id)).map((x) => x.name);

  return (
    <div className="wrap">
      <div className="page-head">
        <div>
          <h1>{t('navRecipes')}</h1>
          <div className="count" role="status">
            {recipes.data && (items.length === 1 ? t('recipesCountOne') : t('recipesCount', { n: num(items.length) }))}
          </div>
        </div>
        <div className="field search">
          <label htmlFor="q">{t('searchLabel')}</label>
          <input id="q" type="search" placeholder={t('searchPlaceholder')} value={q} onChange={(e) => update({ q: e.target.value })} />
        </div>
      </div>

      <div className="with-aside">
        <aside className="filters" aria-label={t('filters')}>
          <div className="row between">
            <h2 className="label">{t('filters')}</h2>
            <button type="button" className="link-btn" onClick={clear} disabled={!filtered}>
              {t('clear')}
            </button>
          </div>
          <h3 className="label">{t('tags')}</h3>
          <div className="chips">
            {(tags.data ?? []).map((x) => (
              <Toggle key={x.id} variant="tag" on={tagIds.includes(x.id)} onClick={() => update({ tags: toggle(tagIds, x.id) })}>
                {x.name}
              </Toggle>
            ))}
          </div>
          <h3 className="label">{t('ingredients')}</h3>
          <div className="chips">
            {(ings.data ?? []).map((x) => (
              <Toggle key={x.id} variant="ing" on={ingIds.includes(x.id)} onClick={() => update({ ingredients: toggle(ingIds, x.id) })}>
                {x.name}
              </Toggle>
            ))}
          </div>
        </aside>

        <section aria-live="polite">
          {filtered && recipes.data && (tagIds.length > 0 || ingIds.length > 0) && (
            <p className="active-filters">
              {[...names(tags.data, tagIds), ...names(ings.data, ingIds)].map((n) => (
                <span key={n} className="pill">{n}</span>
              ))}
            </p>
          )}
          {recipes.loading && <Loading />}
          {recipes.error && (
            <StateBox
              tone="error"
              title={t('errorTitle')}
              body={t('errorBody')}
              detail="GET /api/recipe/recipes/"
              action={<button className="btn danger" onClick={recipes.reload}>{t('retry')}</button>}
            />
          )}
          {recipes.data && items.length === 0 && (
            filtered ? (
              <StateBox title={t('noMatchTitle')} body={t('noMatchBody')} action={<button className="btn ghost" onClick={clear}>{t('clearFilters')}</button>} />
            ) : (
              <StateBox title={t('emptyTitle')} body={t('emptyBody')} action={<Link className="btn primary" to="/recipes/new">{t('newRecipe')}</Link>} />
            )
          )}
          {items.length > 0 && (
            <ul className="grid">
              {items.map((r) => (
                <li key={r.id}>
                  <Link to={`/recipes/${r.id}`} className="recipe-card">
                    <Cover id={r.id} />
                    <div className="body">
                      <h2>{r.title}</h2>
                      <div className="tags">{(r.tags ?? []).map((tg) => <TagChip key={tg.id}>{tg.name}</TagChip>)}</div>
                      <div className="meta">
                        <span>{t('minutes', { n: num(r.time_minutes) })}</span>
                        <span>{price(r.price)}</span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

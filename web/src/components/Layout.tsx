import { useState } from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { isDemo } from '../api';
import { useI18n } from '../i18n';

function DemoBanner() {
  const { t } = useI18n();
  const [open, setOpen] = useState(true);
  if (!isDemo || !open) return null;
  return (
    <div className="demo-banner" role="region" aria-label="Demo">
      <span>
        {t('demoBanner')}
        <a href="https://rezaghamar.ir">{t('demoBack')}</a>
      </span>
      <button type="button" onClick={() => setOpen(false)} aria-label={t('dismiss')}>
        ×
      </button>
    </div>
  );
}

export function Logo() {
  return (
    <svg width="30" height="30" viewBox="0 0 52 52" aria-hidden="true">
      <rect width="52" height="52" rx="6" fill="#12301F" />
      <path d="M12 24h28v8a8 8 0 0 1-8 8H20a8 8 0 0 1-8-8z" fill="#F2D544" />
      <path d="M18 18c0-4 6-4 6-8M28 18c0-4 6-4 6-8" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="8" y="22" width="36" height="4" rx="2" fill="#C73A25" />
    </svg>
  );
}

export function LangSwitch() {
  const { lang, setLang, t } = useI18n();
  return (
    <button
      type="button"
      className="link-btn lang-switch"
      lang={lang === 'fa' ? 'en' : 'fa'}
      onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
    >
      {t('switchLang')}
    </button>
  );
}

export function AppShell() {
  const { t } = useI18n();
  return (
    <>
      <a className="skip" href="#main">
        {t('skip')}
      </a>
      <DemoBanner />
      <header className="site-header">
        <div className="bar">
          <Link to="/" className="brand" dir="ltr">
            <Logo /> FoodApp
          </Link>
          <nav aria-label="Main" className="main-nav">
            <NavLink to="/" end>
              {t('navRecipes')}
            </NavLink>
            <NavLink to="/manage">{t('navManage')}</NavLink>
            <NavLink to="/profile">{t('navProfile')}</NavLink>
          </nav>
          <Link to="/recipes/new" className="btn primary small new-btn">
            {t('newRecipe')}
          </Link>
          <LangSwitch />
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <Link to="/about">{t('aboutLink')}</Link>
      </footer>
    </>
  );
}

export function PublicShell() {
  const { t } = useI18n();
  return (
    <>
      <a className="skip" href="#main">
        {t('skip')}
      </a>
      <DemoBanner />
      <header className="site-header">
        <div className="bar">
          <Link to="/login" className="brand" dir="ltr">
            <Logo /> FoodApp
          </Link>
          <span className="spacer" />
          <Link to="/about" className="link-btn">
            {t('aboutLink')}
          </Link>
          <LangSwitch />
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
    </>
  );
}

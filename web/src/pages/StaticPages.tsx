import { Link } from 'react-router-dom';
import { StateBox } from '../components/ui';
import { useI18n } from '../i18n';

export function AboutPage() {
  const { t } = useI18n();
  return (
    <div className="wrap narrow">
      <h1>{t('aboutTitle')}</h1>
      <p>{t('aboutBody1')}</p>
      <p>{t('aboutBody2')}</p>
      <p>{t('aboutBody3')}</p>
      <Link className="btn ghost" to="/">{t('backHome')}</Link>
    </div>
  );
}

export function NotFoundPage() {
  const { t } = useI18n();
  return (
    <div className="wrap">
      <StateBox title={t('notFoundTitle')} body={t('notFoundBody')} action={<Link className="btn ghost" to="/">{t('backHome')}</Link>} />
    </div>
  );
}

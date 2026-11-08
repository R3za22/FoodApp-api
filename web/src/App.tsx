import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth';
import { AppShell, PublicShell } from './components/Layout';
import AuthPage from './pages/AuthPage';
import EditPage from './pages/EditPage';
import ManagePage from './pages/ManagePage';
import ProfilePage from './pages/ProfilePage';
import RecipePage from './pages/RecipePage';
import RecipesPage from './pages/RecipesPage';
import { AboutPage, NotFoundPage } from './pages/StaticPages';

function Private({ children }: { children: React.ReactElement }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { token } = useAuth();
  return (
    <HashRouter>
      <Routes>
        <Route element={<PublicShell />}>
          <Route path="/login" element={token ? <Navigate to="/" replace /> : <AuthPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>
        <Route element={<Private><AppShell /></Private>}>
          <Route index element={<RecipesPage />} />
          <Route path="recipes/new" element={<EditPage />} />
          <Route path="recipes/:id" element={<RecipePage />} />
          <Route path="recipes/:id/edit" element={<EditPage />} />
          <Route path="manage" element={<ManagePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

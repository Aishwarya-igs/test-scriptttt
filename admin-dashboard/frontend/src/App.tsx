import { Routes, Route } from 'react-router-dom';
import { RequireAuth } from './auth/RequireAuth';
import { LoginPage } from './pages/LoginPage';
import { ClientsOverviewPage } from './pages/ClientsOverviewPage';
import { ClientDetailPage } from './pages/ClientDetailPage';
import { ClientLoginPage } from './pages/ClientLoginPage';
import { ClientViewPage } from './pages/ClientViewPage';
import './App.css';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<ClientsOverviewPage />} />
        <Route path="/clients/:clientId" element={<ClientDetailPage />} />
      </Route>

      {/* Client-team login — a completely separate session from the admin's own (see lib/clientSession.js). Not wrapped in RequireAuth: ClientViewPage checks its own client-session auth. */}
      <Route path="/client-login" element={<ClientLoginPage />} />
      <Route path="/client-view" element={<ClientViewPage />} />
    </Routes>
  );
}

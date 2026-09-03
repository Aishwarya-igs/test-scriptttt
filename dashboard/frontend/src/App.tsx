import { useEffect, useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import './App.css';
import { OverviewPage } from './pages/OverviewPage';
import { RunHistoryPage } from './pages/RunHistoryPage';
import { RunDetailPage } from './pages/RunDetailPage';
import { ChatPage } from './pages/ChatPage';
import { PlatformPage } from './pages/PlatformPage';
import { api } from './api/client';
import type { Platform } from './api/types';
import { ConnectionBadge } from './components/ConnectionBadge';
import { AutoUpdateBadge } from './components/AutoUpdateBadge';
import { UpdateBanner } from './components/UpdateBanner';
import { AppliedFixesBanner } from './components/AppliedFixesBanner';
import { useTheme } from './hooks/useTheme';
import igsLogo from './assets/igs-logo.webp';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  // Nav entries and routes are generated from the registry rather than listed
  // here, so a new platform is a config edit and never a code change. Web is
  // listed alongside the others rather than being special-cased into the top
  // section: it is where you start a web run, exactly as Mobile will be once
  // it has a repo, and Run history stays a cross-platform view of the past.
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  useEffect(() => {
    api
      .getPlatforms()
      .then((res) => setPlatforms(res.platforms))
      .catch(() => setPlatforms([]));
  }, []);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to="/" end className="sidebar-brand" aria-label="IGS — go to homepage">
          <span className="sidebar-logo-badge">
            <img src={igsLogo} alt="IGS" className="sidebar-logo-img" />
          </span>
          <span className="sidebar-title">Automation Dashboard</span>
        </NavLink>

        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <span className="sidebar-link-icon">◆</span> Overview
          </NavLink>
          <NavLink to="/runs" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <span className="sidebar-link-icon">☰</span> Run history
          </NavLink>
          <NavLink to="/chat" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <span className="sidebar-link-icon">💬</span> Ask about history
          </NavLink>

          {platforms.length > 0 && (
            <>
              <div className="sidebar-section-label">Platforms</div>
              {platforms.map((platform) => (
                <NavLink
                  key={platform.id}
                  to={`/platforms/${platform.id}`}
                  className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                  // Marked in the nav itself so an unconfigured platform is
                  // obvious before clicking into it.
                  title={platform.configured ? platform.label : `${platform.label} — no repo connected yet`}
                >
                  <span className="sidebar-link-icon">{platform.icon || '◇'}</span> {platform.label}
                  {!platform.configured && <span className="sidebar-link-tag">not set up</span>}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-badges">
            <ConnectionBadge />
            <AutoUpdateBadge />
          </div>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </div>
      </aside>

      <main className="app-main">
        <UpdateBanner />
        <AppliedFixesBanner />
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/runs" element={<RunHistoryPage />} />
          <Route path="/runs/:runId" element={<RunDetailPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/platforms/:platformId" element={<PlatformPage />} />
        </Routes>
      </main>
    </div>
  );
}

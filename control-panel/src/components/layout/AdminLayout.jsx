import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const THEME_KEY = 'autohub_admin_theme';

// Shell layout: fixed sidebar + sticky topbar + routed content via <Outlet/>.
export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem(THEME_KEY) || 'light'
  );

  // Apply theme to the document root so CSS variables switch.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return (
    <div className="ah-layout">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      <div className="ah-main">
        <Topbar
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          theme={theme}
          onToggleTheme={() =>
            setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
          }
        />
        <main className="ah-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

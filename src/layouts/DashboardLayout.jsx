import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Cpu, GitMerge, BarChart2, Settings,
  ChevronLeft, ChevronRight, Bell, User, ChevronDown,
  Wifi, Power
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: Cpu, label: 'Devices', to: '/devices', badge: 3 },
  { icon: GitMerge, label: 'Automations', to: '/automations' },
  { icon: BarChart2, label: 'Analytics', to: '/analytics' },
  { icon: Settings, label: 'Settings', to: '/settings' },
];

const devices = ['ESP32-Kitchen', 'RaspPi-Garage', 'Arduino-Garden', 'ESP8266-Office'];

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(devices[0]);
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Wifi size={16} color="#000" strokeWidth={2.5} />
          </div>
          <span className="sidebar-logo-text">MAAD IoT</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-label">Navigation</div>
          </div>
          {navItems.map(({ icon: Icon, label, to, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={(e) => {
                if (to !== '/dashboard' && to !== '/devices') {
                  e.preventDefault();
                }
              }}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {badge && <span className="nav-badge">{badge}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div
            className="nav-item"
            onClick={() => setCollapsed(!collapsed)}
            style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
          >
            {collapsed
              ? <ChevronRight size={18} />
              : <><ChevronLeft size={18} /><span>Collapse</span></>
            }
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          {/* Device selector */}
          <div
            className="topbar-device-select"
            onClick={() => setShowDeviceMenu(!showDeviceMenu)}
            style={{ position: 'relative' }}
          >
            <div className="pulse-dot green" />
            <span style={{ flex: 1 }}>{selectedDevice}</span>
            <ChevronDown size={14} color="var(--text-secondary)" />
            {showDeviceMenu && (
              <div style={{
                position: 'absolute', top: '110%', left: 0, right: 0,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                zIndex: 200
              }}>
                {devices.map(d => (
                  <div
                    key={d}
                    onClick={() => { setSelectedDevice(d); setShowDeviceMenu(false); }}
                    style={{
                      padding: '10px 14px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      background: d === selectedDevice ? 'var(--clr-cyan-dim)' : 'transparent',
                      color: d === selectedDevice ? 'var(--clr-cyan)' : 'var(--text-primary)',
                      transition: 'background 0.15s'
                    }}
                    onMouseOver={e => { if (d !== selectedDevice) e.currentTarget.style.background = 'var(--bg-surface-2)'; }}
                    onMouseOut={e => { if (d !== selectedDevice) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {d}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Connection status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontFamily: 'var(--font-heading)', color: 'var(--clr-green)', letterSpacing: '0.05em' }}>
            <div className="pulse-dot green" />
            CONNECTED
          </div>

          <div className="topbar-actions">
            <div className="icon-btn">
              <Bell size={16} />
              <div className="notif-badge">3</div>
            </div>
            <div className="icon-btn" title="Power">
              <Power size={15} />
            </div>
            <div className="user-avatar" title="Profile" onClick={() => navigate('/')}>AG</div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content dot-bg">
          {children}
        </main>
      </div>
    </div>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import DeviceManagementPage from './pages/DeviceManagementPage';
import DashboardLayout from './layouts/DashboardLayout';
import './index.css';

function LoadingScreen({ hidden }) {
  return (
    <div className={`loading-screen ${hidden ? 'hidden' : ''}`}>
      {/* Animated ring */}
      <div style={{ position: 'relative', width: 90, height: 90, marginBottom: 28 }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '2px solid rgba(0,229,255,0.1)',
        }} />
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '2px solid transparent',
          borderTopColor: 'var(--clr-cyan)',
          borderRightColor: 'rgba(0,229,255,0.4)',
          animation: 'spin 1.1s linear infinite',
          boxShadow: '0 0 20px rgba(0,229,255,0.3)',
        }} />
        <div style={{
          position: 'absolute', inset: 8, borderRadius: '50%',
          background: 'rgba(0,229,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--clr-cyan)', boxShadow: '0 0 12px var(--clr-cyan)', animation: 'pulse-ring 1.5s ease-out infinite' }} />
        </div>
      </div>

      <div className="loading-logo">MAAD IoT</div>
      <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', marginTop: 10, letterSpacing: '0.2em' }}>
        INITIALIZING PLATFORM · v4.0.0
      </p>
      <div className="loading-bar-wrap">
        <div className="loading-bar" />
      </div>
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <LoadingScreen hidden={!loading} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          } />
          <Route path="/devices" element={
            <DashboardLayout>
              <DeviceManagementPage />
            </DashboardLayout>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

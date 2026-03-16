import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import {
  Line, Bar
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import {
  Thermometer, Droplets, Cpu, ToggleRight, MapPin,
  Activity, Zap, Terminal, AlertTriangle, Database,
  X, Wifi, RefreshCw, Upload
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

/* ---- Helpers ---- */
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randF = (min, max, dec = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(dec));

/* ---- Gauge Widget ---- */
function GaugeWidget({ value }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2, cy = H * 0.72;
    const r = Math.min(W, H) * 0.42;
    const startAngle = Math.PI * 0.8;
    const endAngle = Math.PI * 2.2;
    const pct = Math.min(value / 100, 1);

    // Outer glow ring
    ctx.beginPath();
    ctx.arc(cx, cy, r + 4, startAngle, endAngle);
    ctx.strokeStyle = 'rgba(0,229,255,0.03)';
    ctx.lineWidth = 26;
    ctx.stroke();

    // Background arc
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Value arc
    const valEnd = startAngle + (endAngle - startAngle) * pct;
    let color;
    if (value < 30) color = 'var(--clr-cyan)';
    else if (value < 60) color = 'var(--clr-green)';
    else if (value < 80) color = 'var(--clr-orange)';
    else color = 'var(--clr-red)';

    const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
    grad.addColorStop(0, 'var(--clr-cyan)');
    grad.addColorStop(1, color);

    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, valEnd);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Value text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 2.2rem Orbitron, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(Math.round(value), cx, cy - 5);
    
    ctx.fillStyle = 'var(--text-secondary)';
    ctx.font = '700 0.7rem DM Sans, sans-serif';
    ctx.fillText('°CELSIUS', cx, cy + 22);
  }, [value]);

  return (
    <div className="card card-glow" style={{ gridArea: 'gauge', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, zIndex: 2 }}>
        <Thermometer size={16} color="var(--clr-cyan)" />
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '0.08em', fontWeight: 600 }}>CORE TEMP</span>
      </div>
      <canvas ref={canvasRef} width={220} height={180} style={{ width: '100%', height: 'auto', marginTop: -10 }} />
      <div style={{ position: 'absolute', bottom: 16, width: '100%', left: 0, padding: '0 24px', display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        <span>0°C</span>
        <span>100°C</span>
      </div>
    </div>
  );
}

/* ---- Liquid Fill Widget ---- */
function LiquidFillWidget({ value }) {
  return (
    <div className="card card-glow" style={{ gridArea: 'liquid', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Droplets size={16} color="var(--clr-cyan)" />
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '0.08em', fontWeight: 600 }}>HUMIDITY</span>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        {/* Tube - Premium Glass look */}
        <div style={{ 
          position: 'relative', width: 44, height: 130, 
          borderRadius: '22px', 
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.4)',
          overflow: 'hidden'
        }}>
          {/* Liquid */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: `${value}%`,
            background: 'linear-gradient(to top, #0070f3, #00e5ff)',
            transition: 'height 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: '0 0 20px rgba(0,229,255,0.4)'
          }}>
            {/* Wave effect overlay */}
            <div style={{
              position: 'absolute', top: -10, left: '-50%', width: '200%', height: 20,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '40%',
              animation: 'spin 3s linear infinite'
            }} />
          </div>
        </div>
        {/* Value */}
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{value}%</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--clr-cyan)', marginTop: 6, fontWeight: 600, letterSpacing: '0.05em' }}>
            {value < 40 ? 'DRY' : value < 70 ? 'COMFORT' : 'CRITICAL'}
          </div>
          <div style={{ marginTop: 8, padding: '4px 8px', borderRadius: 4, background: 'rgba(57,255,20,0.1)', color: 'var(--clr-green)', fontSize: '0.62rem', display: 'inline-block', fontWeight: 700 }}>STABLE</div>
        </div>
      </div>
    </div>
  );
}

/* ---- Line Chart Widget ---- */
function LineChartWidget({ data, labels }) {
  const chartData = {
    labels,
    datasets: [{
      label: 'Sensor',
      data,
      borderColor: '#00e5ff',
      backgroundColor: 'rgba(0,229,255,0.08)',
      borderWidth: 3,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#00e5ff',
      pointHoverBorderWidth: 2,
      tension: 0.45,
      fill: true,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 750, easing: 'easeInOutQuart' },
    plugins: { 
      legend: { display: false }, 
      tooltip: {
        backgroundColor: 'rgba(6,13,31,0.95)',
        borderColor: 'rgba(0,229,255,0.4)',
        borderWidth: 1,
        titleColor: '#00e5ff',
        bodyColor: '#fff',
        titleFont: { family: 'Orbitron', size: 12, weight: '700' },
        bodyFont: { family: 'JetBrains Mono', size: 10 },
        padding: 12,
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      x: { 
        grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false }, 
        ticks: { color: 'var(--text-muted)', font: { size: 9, family: 'JetBrains Mono' }, maxTicksLimit: 8 } 
      },
      y: { 
        grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false }, 
        ticks: { color: 'var(--text-muted)', font: { size: 9, family: 'JetBrains Mono' } }, 
        beginAtZero: false 
      },
    }
  };

  return (
    <div className="card card-glow" style={{ gridArea: 'line', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ padding: 6, borderRadius: 8, background: 'rgba(0,229,255,0.1)' }}>
          <Activity size={16} color="var(--clr-cyan)" />
        </div>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '0.08em', fontWeight: 600 }}>REALTIME TELEMETRY</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.65rem', color: 'var(--clr-green)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
          <div className="pulse-dot green" style={{ width: 6, height: 6 }} />
          LIVE STREAM
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 140 }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

/* ---- Bar Chart Widget ---- */
function BarChartWidget({ data }) {
  const labels = ['12a','2a','4a','6a','8a','10a','12p','2p','4p','6p','8p','10p'];
  const chartData = {
    labels,
    datasets: [{
      label: 'kWh',
      data,
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(0,229,255,0.4)');
        gradient.addColorStop(1, 'rgba(0,112,243,0.05)');
        return gradient;
      },
      borderColor: 'var(--clr-cyan)',
      borderWidth: 1,
      borderRadius: 6,
      hoverBackgroundColor: 'var(--clr-cyan)',
    }]
  };

  const options = {
    responsive: true, maintainAspectRatio: false,
    animation: { duration: 1000 },
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: 'var(--text-muted)', font: { size: 9 } } },
      y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: 'var(--text-muted)', font: { size: 9 } }, beginAtZero: true },
    }
  };

  return (
    <div className="card" style={{ gridArea: 'bar' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ padding: 6, borderRadius: 8, background: 'rgba(255,214,10,0.1)' }}>
          <Zap size={16} color="var(--clr-yellow)" />
        </div>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '0.08em', fontWeight: 600 }}>POWER USAGE</span>
      </div>
      <div style={{ height: 140 }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

/* ---- Device Status Widget ---- */
function SignalBars({ strength }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 16 }}>
      {[3, 6, 9, 12, 15].map((h, i) => (
        <div key={i} style={{
          width: 3, height: h,
          borderRadius: 1,
          background: i < strength ? (strength > 3 ? 'var(--clr-green)' : 'var(--clr-yellow)') : 'rgba(255,255,255,0.05)',
          boxShadow: i < strength ? `0 0 8px ${strength > 3 ? 'var(--clr-green)' : 'var(--clr-yellow)'}40` : 'none',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }} />
      ))}
    </div>
  );
}

function DeviceStatusWidget({ statuses, onDeviceClick }) {
  const deviceList = Object.keys(statuses || {}).map(id => ({ id, ...statuses[id] }));
  return (
    <div className="card" style={{ gridArea: 'devices', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ padding: 6, borderRadius: 8, background: 'rgba(0,229,255,0.1)' }}>
          <Cpu size={16} color="var(--clr-cyan)" />
        </div>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '0.08em', fontWeight: 600 }}>CONNECTED NODES</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--text-secondary)', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>
          {deviceList.filter(s => s.online).length}/{deviceList.length}
        </span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', maxHeight: 200, paddingRight: 4 }}>
        {deviceList.length === 0 ? (
          <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No nodes registered</div>
        ) : deviceList.map((dev, i) => (
          <div key={dev.id}
            onClick={() => onDeviceClick(dev, dev)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px', borderBottom: i < deviceList.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
              cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 4
            }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            <div className={`pulse-dot ${dev.online ? 'green' : 'red'}`} style={{ width: 8, height: 8 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: dev.online ? '#fff' : 'var(--text-muted)' }}>{dev.name}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', gap: 6, marginTop: 2 }}>
                <span>{dev.type}</span>
                <span>•</span>
                <span>{dev.online ? 'active' : 'offline'}</span>
              </div>
            </div>
            <SignalBars strength={dev.online ? (dev.data?.sig || 4) : 0} />
          </div>
        ))}
      </div>
    </div>
  );
}

const CONTROLS = [
  { label: 'Primary Relay', icon: '⚡' },
  { label: 'Secondary Node', icon: '🔋' },
  { label: 'External Light', icon: '💡' },
  { label: 'Cooling System', icon: '❄️' },
];

function ToggleControlsWidget({ toggles, setToggles }) {
  return (
    <div className="card" style={{ gridArea: 'toggles', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ padding: 6, borderRadius: 8, background: 'rgba(0,229,255,0.1)' }}>
          <ToggleRight size={16} color="var(--clr-cyan)" />
        </div>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '0.08em', fontWeight: 600 }}>QUICK CONTROLS</span>
      </div>
      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: '1fr', flex: 1 }}>
        {CONTROLS.map((ctrl, i) => (
          <div key={ctrl.label} style={{ 
            display: 'flex', alignItems: 'center', gap: 14, 
            padding: '12px', background: 'rgba(255,255,255,0.02)', 
            borderRadius: 'var(--r-md)', 
            border: '1px solid rgba(255,255,255,0.04)',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ 
              width: 36, height: 36, borderRadius: 8, 
              background: toggles[i] ? 'rgba(0,229,255,0.1)' : 'rgba(255,255,255,0.03)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem', transition: 'all 0.3s ease'
            }}>
              {ctrl.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: toggles[i] ? '#fff' : 'var(--text-secondary)' }}>{ctrl.label}</div>
              <div style={{ fontSize: '0.62rem', color: toggles[i] ? 'var(--clr-cyan)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{toggles[i] ? 'ENABLED' : 'DISABLED'}</div>
            </div>
            <div className="toggle-wrap">
              <div className={`toggle ${toggles[i] ? 'on' : ''}`} onClick={() => setToggles(i, !toggles[i])} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Map Widget ---- */
function MapWidget() {
  const [ping, setPing] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPing(p => (p + 1) % 3), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="card" style={{ gridArea: 'map' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <MapPin size={16} color="var(--clr-cyan)" />
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '0.08em' }}>GPS LOCATION</span>
      </div>
      {/* SVG World Map (simplified) */}
      <div style={{ position: 'relative', width: '100%', paddingBottom: '50%', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
        <svg viewBox="0 0 1000 500" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.4 }} xmlns="http://www.w3.org/2000/svg">
          {/* Simplified continent outlines */}
          <path d="M 180 120 Q 220 80 260 100 L 310 130 Q 380 100 420 130 L 450 180 Q 440 200 400 210 L 350 220 Q 290 230 250 210 L 200 190 Z" fill="rgba(0,229,255,0.15)" stroke="rgba(0,229,255,0.3)" strokeWidth="1" />
          <path d="M 420 80 Q 500 60 580 90 L 640 120 Q 700 140 720 180 L 700 240 Q 660 280 600 270 L 540 250 Q 480 230 450 200 L 420 160 Z" fill="rgba(0,229,255,0.15)" stroke="rgba(0,229,255,0.3)" strokeWidth="1" />
          <path d="M 460 280 Q 500 260 540 280 L 570 320 Q 560 370 530 390 L 490 400 Q 460 380 450 340 Z" fill="rgba(0,229,255,0.15)" stroke="rgba(0,229,255,0.3)" strokeWidth="1" />
          <path d="M 200 260 Q 260 240 310 270 L 350 320 Q 360 380 330 420 L 280 440 Q 230 430 210 390 L 190 340 Z" fill="rgba(0,229,255,0.15)" stroke="rgba(0,229,255,0.3)" strokeWidth="1" />
          <path d="M 800 100 Q 850 80 900 100 L 940 160 Q 960 220 940 280 L 900 320 Q 840 360 800 320 L 770 260 Q 760 190 780 140 Z" fill="rgba(0,229,255,0.15)" stroke="rgba(0,229,255,0.3)" strokeWidth="1" />
          {/* Grid lines */}
          {[100,200,300,400].map(y => <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="rgba(0,229,255,0.06)" strokeWidth="0.5" />)}
          {[200,400,600,800].map(x => <line key={x} x1={x} y1="0" x2={x} y2="500" stroke="rgba(0,229,255,0.06)" strokeWidth="0.5" />)}
        </svg>
        {/* Bangalore location dot — approx 77.6°E, 12.97°N */}
        <div style={{ position: 'absolute', left: '70%', top: '45%', transform: 'translate(-50%,-50%)' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--clr-green)', boxShadow: '0 0 12px var(--clr-green)', animation: 'pulse 2s infinite' }} />
        </div>
      </div>
      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
        <div className="pulse-dot green" style={{ width: 6, height: 6 }} />
        Bangalore, India &nbsp;·&nbsp; 12.97°N, 77.59°E
      </div>
    </div>
  );
}

/* ---- Event Log Widget ---- */
function EventLogWidget({ logs }) {
  const logRef = useRef(null);
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="card" style={{ gridArea: 'log', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Terminal size={16} color="var(--clr-green)" />
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '0.08em' }}>EVENT LOG</span>
        <div style={{ marginLeft: 'auto' }}>
          <div className="pulse-dot green" style={{ width: 6, height: 6 }} />
        </div>
      </div>
      <div ref={logRef} style={{ flex: 1, overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', maxHeight: 180 }}>
        {logs.map((log, i) => (
          <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid var(--border-subtle)', color: i === logs.length - 1 ? 'var(--clr-green)' : 'var(--text-secondary)', animation: i === logs.length - 1 ? 'fadeIn 0.4s ease' : 'none', display: 'flex', gap: 8 }}>
            <span style={{ color: 'var(--clr-cyan)', flexShrink: 0 }}>{log.time}</span>
            <span>{log.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Device Detail Panel ---- */
function DevicePanel({ device, status, onClose }) {
  if (!device) return null;
  return (
    <div className={`slide-panel ${device ? 'open' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <Cpu size={20} color="var(--clr-cyan)" />
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', flex: 1 }}>{device.name}</h3>
        <button className="icon-btn" onClick={onClose}><X size={16} /></button>
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div className={`pulse-dot ${status?.online ? 'green' : 'red'}`} />
          <span className={`badge ${status?.online ? 'badge-online' : 'badge-offline'}`}>{status?.online ? 'Online' : 'Offline'}</span>
        </div>
        {[
          ['Type', device.type],
          ['Firmware', `v${device.fw}`],
          ['Ping', `${device.ping}ms`],
          ['Signal', `${(status?.signal || 0) * 20}%`],
          ['IP', `192.168.1.${rand(10,254)}`],
          ['Uptime', `${rand(1,72)}h ${rand(0,59)}m`],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--clr-cyan)' }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn btn-ghost btn-sm"><RefreshCw size={12} /> Restart</button>
        <button className="btn btn-outline btn-sm"><Upload size={12} /> OTA Update</button>
        <button className="btn btn-danger btn-sm" style={{ fontSize: '0.7rem' }}><X size={12} /> Remove</button>
      </div>
    </div>
  );
}

/* ---- KPI Card (Pro Max) ---- */
function KpiCard({ icon: Icon, value, label, sub, color = 'var(--clr-cyan)' }) {
  const [display, setDisplay] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t0 = setTimeout(() => setMounted(true), 100);
    let v = 0;
    const end = parseFloat(value);
    const inc = end / 45;
    const t = setInterval(() => {
      v += inc;
      if (v >= end) { setDisplay(end); clearInterval(t); }
      else setDisplay(parseFloat(v.toFixed(1)));
    }, 25);
    return () => { clearInterval(t); clearTimeout(t0); };
  }, [value]);

  return (
    <div className="card card-glow" style={{
      display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px',
      opacity: mounted ? 1 : 0,
      transform: mounted ? 'translateY(0)' : 'translateY(10px)',
      transition: 'opacity 0.4s ease, transform 0.4s ease',
    }}>
      {/* Accent top border */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${color}, transparent)`, borderRadius: '18px 18px 0 0' }} />
      <div style={{
        width: 48, height: 48, borderRadius: 'var(--r-md)',
        background: `${color}12`,
        border: `1px solid ${color}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        boxShadow: `0 0 20px ${color}18`,
      }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 900, color, lineHeight: 1, letterSpacing: '-0.01em' }}>
          {typeof value === 'string' && value.includes('.') ? display.toFixed(1) : Math.round(display)}{typeof value === 'string' && value.includes('M') ? 'M' : ''}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 5, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</div>
        {sub && <div style={{ fontSize: '0.66rem', color: 'var(--clr-green)', marginTop: 3, fontFamily: 'var(--font-mono)' }}>{sub}</div>}
      </div>
    </div>
  );
}

/* ---- Main Dashboard Page ---- */
export default function DashboardPage() {
  const MAX_POINTS = 30;
  const now = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
  };

  const [connected, setConnected] = useState(false);
  const [socketUrl, setSocketUrl] = useState('http://localhost:3001');
  const [socketInstance, setSocketInstance] = useState(null);

  const [temp, setTemp] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [lineData, setLineData] = useState(Array.from({ length: MAX_POINTS }, () => 0));
  const [lineLabels, setLineLabels] = useState(Array.from({ length: MAX_POINTS }, () => now()));
  const [barData, setBarData] = useState(Array.from({ length: 12 }, () => randF(1.5, 9.5)));
  const [deviceStatuses, setDeviceStatuses] = useState({});
  const [toggles, setToggles] = useState([false, false, false, false]);
  const [logs, setLogs] = useState([{ time: now(), msg: 'System initialized. Waiting for connection...' }]);
  
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  useEffect(() => {
    const socket = io(socketUrl);
    setSocketInstance(socket);

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('get_initial_state', (state) => {
        if (state.devices) {
          setDeviceStatuses(state.devices);
          
          // Find the first online device to populate initial dashboard data
          const firstDevice = Object.values(state.devices).find(d => d.online);
          if (firstDevice) {
            if (firstDevice.data?.temp !== undefined) setTemp(firstDevice.data.temp);
            if (firstDevice.data?.humidity !== undefined) setHumidity(firstDevice.data.humidity);
            if (firstDevice.history && firstDevice.history.length > 0) {
              setLineData(firstDevice.history.map(h => h.temp));
              setLineLabels(firstDevice.history.map(h => h.time));
            }
          }
        }
        if (state.toggles) setToggles(state.toggles);
      });
      setLogs(prev => [...prev.slice(-19), { time: now(), msg: 'Secure connection established with Master Server' }]);
    });

    socket.on('disconnect', () => {
      setConnected(false);
      setLogs(prev => [...prev.slice(-19), { time: now(), msg: 'System offline: Connection lost' }]);
    });

    socket.on('device_status_update', (devices) => {
      setDeviceStatuses(devices);
    });

    socket.on('telemetry_update', (data) => {
      // payload: { temp, humidity, sig }
      if (data.payload) {
        if (data.payload.temp !== undefined) setTemp(data.payload.temp);
        if (data.payload.humidity !== undefined) setHumidity(data.payload.humidity);
        
        // Add to graph
        setLineData(prev => [...prev.slice(1), data.payload.temp || 0]);
        setLineLabels(prev => [...prev.slice(1), now()]);
      }
    });

    socket.on('new_log', (log) => {
      setLogs(prev => [...prev.slice(-19), log]);
    });

    socket.on('sync_toggles', (newToggles) => {
      setToggles(newToggles);
    });

    return () => {
      socket.disconnect();
    };
  }, [socketUrl]);

  const handleToggle = (index, value) => {
    if (socketInstance) {
      socketInstance.emit('set_toggle', index, value);
    }
  };

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease both' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.04em', background: 'linear-gradient(135deg,var(--clr-cyan),#fff)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Live Dashboard</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>Realtime metrics · Updates every 3s</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className={`pulse-dot ${connected ? 'green' : 'red'}`} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: connected ? 'var(--clr-green)' : 'var(--clr-red)', letterSpacing: '0.1em' }}>
            {connected ? 'SYSTEMS ONLINE (WS: 3001)' : 'DISCONNECTED'}
          </span>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
        <KpiCard icon={Cpu} value={Object.keys(deviceStatuses).length} label="Total Devices" sub="Cloud Registered" />
        <KpiCard icon={Wifi} value={Object.values(deviceStatuses).filter(s => s.online).length} label="Active Now" color="var(--clr-green)" />
        <KpiCard icon={AlertTriangle} value={3} label="Alerts Today" color="var(--clr-orange)" />
        <KpiCard icon={Database} value="1.2" label="Data Points (M)" color="var(--clr-purple)" />
      </div>

      {/* Bento Widget Grid */}
      <div style={{
        display: 'grid',
        gridTemplateAreas: `
          "gauge   liquid  line    line"
          "devices devices toggles map"
          "log     log     bar     bar"
        `,
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gridTemplateRows: 'auto auto auto',
        gap: 14
      }}>
        <GaugeWidget value={temp} />
        <LiquidFillWidget value={humidity} />
        <LineChartWidget data={lineData} labels={lineLabels} />
        <DeviceStatusWidget statuses={deviceStatuses} onDeviceClick={(dev, status) => { setSelectedDevice(dev); setSelectedStatus(status); }} />
        <ToggleControlsWidget toggles={toggles} setToggles={handleToggle} />
        <MapWidget />
        <EventLogWidget logs={logs} />
        <BarChartWidget data={barData} />
      </div>

      {/* Device Detail Panel */}
      <DevicePanel
        device={selectedDevice}
        status={selectedStatus}
        onClose={() => setSelectedDevice(null)}
      />
      {selectedDevice && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 400 }}
          onClick={() => setSelectedDevice(null)}
        />
      )}
    </div>
  );
}

import { useState, useMemo, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
  Search, Plus, RefreshCw, Upload, Trash2, X, Copy,
  Check, ChevronDown, ChevronUp, Filter, Cpu
} from 'lucide-react';

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const genToken = () => 'maat_' + Array.from({ length: 24 }, () => '0123456789abcdef'[rand(0, 15)]).join('');
const ago = (min) => {
  if (min < 60) return `${min}m ago`;
  if (min < 1440) return `${Math.floor(min / 60)}h ago`;
  return `${Math.floor(min / 1440)}d ago`;
};

const STATUS_TYPES = ['Online', 'Offline', 'Updating'];
const HARDWARE_TYPES = ['ESP32', 'ESP8266', 'Arduino Uno', 'Raspberry Pi 4', 'STM32', 'Particle Photon', 'Nordic nRF52'];
const FW_VERSIONS = ['1.0.0','1.1.2','2.0.0','2.4.1','3.0.0','3.1.2','4.0.0'];

const INITIAL_DEVICES = [
  { id: 1, name: 'ESP32-Kitchen', type: 'ESP32', status: 'Online', lastSeen: 2, fw: '2.4.1', signal: 90, auth: genToken() },
  { id: 2, name: 'RaspPi-Garage', type: 'Raspberry Pi 4', status: 'Online', lastSeen: 8, fw: '1.9.0', signal: 72, auth: genToken() },
  { id: 3, name: 'Arduino-Garden', type: 'Arduino Uno', status: 'Offline', lastSeen: 320, fw: '3.1.2', signal: 0, auth: genToken() },
  { id: 4, name: 'ESP8266-Office', type: 'ESP8266', status: 'Online', lastSeen: 1, fw: '2.3.5', signal: 85, auth: genToken() },
  { id: 5, name: 'STM32-Factory', type: 'STM32', status: 'Updating', lastSeen: 15, fw: '4.0.0', signal: 60, auth: genToken() },
  { id: 6, name: 'Nordic-Sensor01', type: 'Nordic nRF52', status: 'Online', lastSeen: 3, fw: '1.0.0', signal: 95, auth: genToken() },
  { id: 7, name: 'Particle-Farm', type: 'Particle Photon', status: 'Offline', lastSeen: 1440, fw: '3.0.0', signal: 0, auth: genToken() },
  { id: 8, name: 'ESP32-Roof', type: 'ESP32', status: 'Online', lastSeen: 5, fw: '2.4.1', signal: 78, auth: genToken() },
];

function StatusBadge({ status }) {
  const map = {
    Online: 'badge-online',
    Offline: 'badge-offline',
    Updating: 'badge-updating',
  };
  return (
    <span className={`badge ${map[status]}`}>
      {status === 'Updating' && <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#2196f3', animation: 'pulse 1.5s infinite', marginRight: 4 }} />}
      {status}
    </span>
  );
}

function SignalBar({ pct }) {
  const color = pct > 70 ? 'var(--clr-green)' : pct > 40 ? 'var(--clr-yellow)' : 'var(--clr-red)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 60, height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color }}>{pct}%</span>
    </div>
  );
}

/* ---- Add Device Modal ---- */
function AddDeviceModal({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [type, setType] = useState(HARDWARE_TYPES[0]);
  const [token] = useState(genToken());
  const [copied, setCopied] = useState(false);

  const code = `#include <WiFi.h>
#include <MAADIoT.h>

#define AUTH_TOKEN "${token}"
#define SSID "YourWiFi"
#define PASS "YourPassword"

MAADIoT device(AUTH_TOKEN);

void setup() {
  WiFi.begin(SSID, PASS);
  device.begin();
  device.onConnect([]() {
    Serial.println("Connected to MAAD IoT!");
  });
}

void loop() {
  device.run();
  device.send("temperature", 25.4);
  delay(3000);
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), type, auth: token });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <Cpu size={20} color="var(--clr-cyan)" />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', flex: 1 }}>Add New Device</h2>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="form-group">
          <label className="form-label">Device Name</label>
          <input className="form-input" placeholder="e.g. ESP32-Living-Room" value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Hardware Type</label>
          <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
            {HARDWARE_TYPES.map(h => <option key={h}>{h}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Auth Token (auto-generated)</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-input" value={token} readOnly style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--clr-cyan)' }} />
          </div>
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <label className="form-label" style={{ margin: 0 }}>Connection Code Snippet</label>
            <button className="btn btn-ghost btn-sm" onClick={handleCopy}>
              {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>
          <pre className="code-block" style={{ maxHeight: 240, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
            {code}
          </pre>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAdd} disabled={!name.trim()}>
            <Plus size={14} /> Add Device
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- Main Device Management Page ---- */
export default function DeviceManagementPage() {
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState({ col: 'name', dir: 'asc' });

  useEffect(() => {
    const socket = io('http://localhost:3001');
    
    socket.on('connect', () => {
      socket.emit('get_initial_state', (state) => {
        if (state.devices) {
          // Convert map to array for the table
          const arr = Object.keys(state.devices).map(id => ({
            id, ...state.devices[id]
          }));
          setDevices(arr);
        }
      });
    });

    socket.on('device_status_update', (devMap) => {
      const arr = Object.keys(devMap).map(id => ({
        id, ...devMap[id]
      }));
      setDevices(arr);
    });

    return () => socket.disconnect();
  }, []);

  const filtered = useMemo(() => {
    return devices
      .filter(d => {
        const q = search.toLowerCase();
        const statusStr = d.online ? 'Online' : 'Offline';
        return (d.name.toLowerCase().includes(q) || d.type.toLowerCase().includes(q)) &&
          (filterStatus === 'All' || statusStr === filterStatus);
      })
      .sort((a, b) => {
        const v = sortBy.dir === 'asc' ? 1 : -1;
        if (a[sortBy.col] < b[sortBy.col]) return -v;
        if (a[sortBy.col] > b[sortBy.col]) return v;
        return 0;
      });
  }, [devices, search, filterStatus, sortBy]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(d => d.id)));
  };

  const handleDelete = () => {
    setDevices(prev => prev.filter(d => !selectedIds.has(d.id)));
    setSelectedIds(new Set());
  };

  const handleAdd = ({ name, type, auth }) => {
    const newDevice = {
      id: Date.now(), name, type, status: 'Offline',
      lastSeen: 0, fw: FW_VERSIONS[rand(0, FW_VERSIONS.length - 1)],
      signal: 0, auth
    };
    setDevices(prev => [newDevice, ...prev]);
  };

  const sort = (col) => setSortBy(prev => ({
    col, dir: prev.col === col && prev.dir === 'asc' ? 'desc' : 'asc'
  }));

  const SortIcon = ({ col }) => {
    if (sortBy.col !== col) return <ChevronDown size={12} style={{ opacity: 0.3 }} />;
    return sortBy.dir === 'asc' ? <ChevronUp size={12} color="var(--clr-cyan)" /> : <ChevronDown size={12} color="var(--clr-cyan)" />;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, marginBottom: 6 }}>Device Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Manage and monitor all connected devices in your fleet.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add New Device
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Total', val: devices.length, color: 'var(--clr-cyan)' },
          { label: 'Online', val: devices.filter(d => d.online).length, color: 'var(--clr-green)' },
          { label: 'Offline', val: devices.filter(d => !d.online).length, color: 'var(--clr-red)' },
          { label: 'Updating', val: devices.filter(d => d.status === 'Updating').length, color: '#2196f3' },
        ].map(s => (
          <div key={s.label} className="card" style={{ flex: 1, minWidth: 100, padding: '12px 16px', border: `1px solid ${s.color}30` }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{s.label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            placeholder="Search devices..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 6 }}>
          {['All', ...STATUS_TYPES].map(s => (
            <button key={s} className="btn btn-ghost btn-sm"
              style={filterStatus === s ? { borderColor: 'var(--clr-cyan)', color: 'var(--clr-cyan)', background: 'var(--clr-cyan-dim)' } : {}}
              onClick={() => setFilterStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Bulk actions */}
        {selectedIds.size > 0 && (
          <div style={{ display: 'flex', gap: 8, padding: '6px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--clr-cyan)' }}>{selectedIds.size} selected</span>
            <button className="btn btn-ghost btn-sm"><RefreshCw size={12} /> Restart</button>
            <button className="btn btn-ghost btn-sm"><Upload size={12} /> OTA</button>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}><Trash2 size={12} /> Delete</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
                <th style={{ padding: '12px 16px', width: 40 }}>
                  <input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0}
                    onChange={selectAll}
                    style={{ accentColor: 'var(--clr-cyan)', cursor: 'pointer' }}
                  />
                </th>
                {[['name','Device Name'], ['type','Type'], ['status','Status'], ['lastSeen','Last Seen'], ['fw','Firmware'], ['signal','Signal']].map(([col, label]) => (
                  <th key={col} onClick={() => sort(col)} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.08em', color: 'var(--text-secondary)', cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {label} <SortIcon col={col} />
                    </div>
                  </th>
                ))}
                <th style={{ padding: '12px 16px', fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.08em', color: 'var(--text-secondary)', textAlign: 'left' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((device, i) => (
                <tr key={device.id}
                  style={{
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    background: selectedIds.has(device.id) ? 'var(--clr-cyan-dim)' : 'transparent',
                    transition: 'background 0.15s'
                  }}
                  onMouseOver={e => { if (!selectedIds.has(device.id)) e.currentTarget.style.background = 'var(--bg-surface-2)'; }}
                  onMouseOut={e => { if (!selectedIds.has(device.id)) e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <input type="checkbox" checked={selectedIds.has(device.id)}
                      onChange={() => toggleSelect(device.id)}
                      style={{ accentColor: 'var(--clr-cyan)', cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{device.name}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'var(--bg-elevated)', padding: '3px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>{device.type}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <StatusBadge status={device.online ? 'Online' : 'Offline'} />
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {device.online ? 'Just now' : ago(Math.floor((Date.now() - device.lastSeen) / 60000) || 1)}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--clr-cyan)' }}>
                    v{device.fw}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {!device.online ? (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--clr-red)' }}>—</span>
                    ) : (
                      <SignalBar pct={device.data?.sig * 20 || rand(60, 99)} />
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" title="Restart"><RefreshCw size={12} /></button>
                      <button className="btn btn-outline btn-sm" title="OTA Update"><Upload size={12} /></button>
                      <button className="btn btn-danger btn-sm" title="Delete" onClick={() => {
                        setDevices(prev => prev.filter(d => d.id !== device.id));
                        setSelectedIds(prev => { const n = new Set(prev); n.delete(device.id); return n; });
                      }}><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                    No devices found matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {filtered.length} of {devices.length} devices
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-ghost btn-sm">Previous</button>
            <button className="btn btn-primary btn-sm" style={{ pointerEvents: 'none' }}>1</button>
            <button className="btn btn-ghost btn-sm">Next</button>
          </div>
        </div>
      </div>

      {showModal && <AddDeviceModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}
    </div>
  );
}

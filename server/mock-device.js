// CommonJS
const { io } = require('socket.io-client');

const SERVER_URL = 'http://localhost:3001';
const socket = io(SERVER_URL);

// Mock device configuration
const DEVICE_INFO = {
  id: 'dev_esp32_001',
  name: 'ESP32-Garage',
  type: 'ESP32',
  fw: '2.5.0'
};

const LOG_MESSAGES = [
  'Motion detected',
  'Temperature spike',
  'Humidity low',
  'Light level changed',
  'Connection stable'
];

let telemetryInterval;
let logInterval;

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

socket.on('connect', () => {
  console.log(`[Device] Connected to ${SERVER_URL} with socket ID: ${socket.id}`);
  
  // Register with server
  socket.emit('device_auth', DEVICE_INFO);

  // Start sending simulated telemetry
  telemetryInterval = setInterval(() => {
    socket.emit('device_data', {
      id: DEVICE_INFO.id,
      payload: { temp: rand(20, 45), humidity: rand(30, 80), sig: rand(1, 5) }
    });
    console.log('[Device] Sent telemetry data');
  }, 2000);

  // Send random logs occasionally
  logInterval = setInterval(() => {
    const d = new Date();
    const time = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
    const msg = LOG_MESSAGES[rand(0, LOG_MESSAGES.length - 1)];
    socket.emit('device_log', {
      time,
      msg: `${DEVICE_INFO.name}: ${msg}`
    });
    console.log(`[Device] Sent log: ${msg}`);
  }, 5000);
});

// Listen for commands from the dashboard
socket.on('sync_toggles', (toggles) => {
  console.log('[Device] Received relay toggles sync:', toggles);
  // Here, real code would write to GPIO pins based on toggles array
});

socket.on('disconnect', () => {
  console.log('[Device] Disconnected from master server');
  clearInterval(telemetryInterval);
  clearInterval(logInterval);
});

socket.on('connect_error', (err) => {
  console.error('[Device] Connection failed:', err.message);
});

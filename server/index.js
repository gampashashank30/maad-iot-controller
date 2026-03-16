const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = 3001;
const STATE_FILE = path.join(__dirname, 'state.json');

// Store state
let state = {
  devices: {}, // id -> { name, type, online, lastSeen, data: {}, history: [] }
  toggles: [true, false, true, false],
  lastUpdate: Date.now()
};

// Load state from file
try {
  if (fs.existsSync(STATE_FILE)) {
    const savedState = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    state = { ...state, ...savedState };
    // Set all devices to offline initially on restart
    Object.keys(state.devices).forEach(id => {
      state.devices[id].online = false;
    });
    console.log('[System] State loaded from disk');
  }
} catch (err) {
  console.error('[Error] Failed to load state:', err);
}

// Persist state to file
const saveState = () => {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error('[Error] Failed to save state:', err);
  }
};

io.on('connection', (socket) => {
  console.log(`[Socket] Connection: ${socket.id}`);

  // Handle a device authenticating/registering
  socket.on('device_auth', (info) => {
    const { id, name, type, fw } = info;
    socket.deviceId = id;
    
    if (!state.devices[id]) {
      state.devices[id] = { history: [], data: {} };
    }

    state.devices[id] = {
      ...state.devices[id],
      name, type, fw,
      online: true,
      lastSeen: Date.now(),
      socketId: socket.id
    };

    console.log(`[Device] ${name} (${id}) connected`);
    
    io.emit('device_status_update', state.devices);
    socket.emit('sync_toggles', state.toggles);
    saveState();
  });

  // Handle incoming telemetry data from devices
  socket.on('device_data', (data) => {
    const { id, payload } = data;
    if (state.devices[id]) {
        state.devices[id].lastSeen = Date.now();
        state.devices[id].online = true;
        state.devices[id].data = { ...state.devices[id].data, ...payload };
        
        // Maintain history (max 30 points)
        if (!state.devices[id].history) state.devices[id].history = [];
        state.devices[id].history.push({
            time: new Date().toLocaleTimeString(),
            ...payload
        });
        if (state.devices[id].history.length > 30) {
            state.devices[id].history.shift();
        }
    }
    
    io.emit('telemetry_update', { id, payload });
  });

  socket.on('device_log', (log) => {
    io.emit('new_log', log);
  });

  socket.on('get_initial_state', (cb) => {
    if (typeof cb === 'function') {
      cb({ devices: state.devices, toggles: state.toggles });
    }
  });

  socket.on('set_toggle', (index, value) => {
    state.toggles[index] = value;
    io.emit('sync_toggles', state.toggles);
    const cmd = `Relay ${index + 1} turned ${value ? 'ON' : 'OFF'}`;
    console.log(`[Command] ${cmd}`);
    
    const d = new Date();
    const time = d.toLocaleTimeString();
    io.emit('new_log', { time, msg: `User: ${cmd}` });
    saveState();
  });

  socket.on('add_device', (info) => {
    const { id, name, type, fw } = info;
    state.devices[id] = {
      name, type, fw,
      online: false,
      lastSeen: 0,
      data: {},
      history: []
    };
    io.emit('device_status_update', state.devices);
    const d = new Date();
    io.emit('new_log', { time: d.toLocaleTimeString(), msg: `System: New device registered - ${name}` });
    saveState();
  });

  socket.on('delete_device', (id) => {
    if (state.devices[id]) {
      const name = state.devices[id].name;
      delete state.devices[id];
      io.emit('device_status_update', state.devices);
      const d = new Date();
      io.emit('new_log', { time: d.toLocaleTimeString(), msg: `System: Device removed - ${name}` });
      saveState();
    }
  });

  socket.on('disconnect', () => {
    if (socket.deviceId && state.devices[socket.deviceId]) {
      state.devices[socket.deviceId].online = false;
      io.emit('device_status_update', state.devices);
      console.log(`[Device] ${state.devices[socket.deviceId].name} disconnected`);
      saveState();
    }
  });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', devices: Object.keys(state.devices).length }));

server.listen(PORT, () => {
  console.log(`======= MAAD IoT Backend =======`);
  console.log(`Server listening on port ${PORT}`);
  console.log(`State persistence enabled`);
});

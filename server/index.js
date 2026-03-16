// CommonJS
const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = 3001;

// Store state
const state = {
  devices: {}, // id -> { name, type, online, lastSeen, data: {} }
  toggles: [true, false, true, false]
};

io.on('connection', (socket) => {
  console.log(`[Socket] Connection: ${socket.id}`);

  // Handle a device authenticating/registering
  socket.on('device_auth', (info) => {
    /* info = { id, name, type, fw } */
    const { id, name, type, fw } = info;
    socket.deviceId = id;
    
    state.devices[id] = {
      ...(state.devices[id] || {}),
      name, type, fw,
      online: true,
      lastSeen: Date.now(),
      socketId: socket.id
    };

    console.log(`[Device] ${name} (${id}) connected`);
    
    // Broadcast updated device list to web clients
    io.emit('device_status_update', state.devices);
    // Send current toggle state to the device
    socket.emit('sync_toggles', state.toggles);
  });

  // Handle incoming telemetry data from devices
  socket.on('device_data', (data) => {
    // data = { id, key, value }
    const { id } = data;
    if (state.devices[id]) {
        state.devices[id].lastSeen = Date.now();
        state.devices[id].data = { ...state.devices[id].data, ...data.payload };
    }
    
    // Forward to web clients
    io.emit('telemetry_update', { id, ...data });
  });

  // Handle log events from devices
  socket.on('device_log', (log) => {
    io.emit('new_log', log);
  });

  // Handle web client fetching initial state
  socket.on('get_initial_state', (cb) => {
    if (typeof cb === 'function') {
      cb({ devices: state.devices, toggles: state.toggles });
    }
  });

  // Handle web client toggling a relay
  socket.on('set_toggle', (index, value) => {
    state.toggles[index] = value;
    io.emit('sync_toggles', state.toggles);
    const cmd = `Relay ${index + 1} turned ${value ? 'ON' : 'OFF'}`;
    console.log(`[Command] ${cmd}`);
    
    const d = new Date();
    const time = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
    io.emit('new_log', { time, msg: `User Command: ${cmd}` });
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnect: ${socket.id}`);
    if (socket.deviceId && state.devices[socket.deviceId]) {
      state.devices[socket.deviceId].online = false;
      io.emit('device_status_update', state.devices);
      console.log(`[Device] ${state.devices[socket.deviceId].name} disconnected`);
    }
  });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', devices: Object.keys(state.devices).length }));

server.listen(PORT, () => {
  console.log(`======= MAAD IoT Backend =======`);
  console.log(`Server listening on port ${PORT}`);
  console.log(`WebSocket ready for device connections`);
});

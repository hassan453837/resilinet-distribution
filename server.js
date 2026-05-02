const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

let incidents = [];
let nodeHeartbeats = {};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.emit('init', incidents);

  socket.on('add-incident', (incident) => {
    incidents.push(incident);
    io.emit('add-incident', incident);
    console.log('Incident broadcast:', incident.id);
  });

  socket.on('resolve-incident', (id) => {
    incidents = incidents.map(i => i.id === id ? { ...i, status: 'resolved' } : i);
    io.emit('resolve-incident', id);
  });

  socket.on('heartbeat', ({ name }) => {
    nodeHeartbeats[name] = Date.now();
    io.emit('node-online', { name });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

setInterval(() => {
  const now = Date.now();
  Object.keys(nodeHeartbeats).forEach((name) => {
    if (now - nodeHeartbeats[name] > 5000) {
      console.log(`Node offline: ${name}`);
      io.emit('node-offline', { name });
      delete nodeHeartbeats[name];
    }
  });
}, 3000);

server.listen(3001, () => console.log('Hub server running on port 3001'));

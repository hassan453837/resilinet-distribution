const { io } = require('socket.io-client');

const nodeName = process.argv[2] || 'UnknownNode';
const socket = io('http://localhost:3001');

socket.on('connect', () => console.log(`${nodeName} connected to hub`));
socket.on('disconnect', () => console.log(`${nodeName} disconnected`));

setInterval(() => {
  socket.emit('heartbeat', { name: nodeName, time: new Date().toISOString() });
  console.log(`${nodeName} heartbeat sent`);
}, 2000);

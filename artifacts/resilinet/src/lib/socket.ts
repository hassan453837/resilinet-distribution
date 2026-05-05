import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

export const socket: Socket = io('http://localhost:3001');

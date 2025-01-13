import { io } from 'socket.io-client';
export const socket = io('http://localhost:3000', {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity, 
    reconnectionDelay: 1000
});

export const connectSocket = (token) => {
    socket.auth = { token };
    socket.connect();
};
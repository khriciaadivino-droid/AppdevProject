/*
 * Socket.IO Server Module
 * Replaces the previous 'ws' based implementation with Socket.IO.
 * Attaches to the existing HTTP server so WS and REST share the same port.
 * Clients connect to  ws(s)://<host>:<port>/ws (Socket.IO path)
 */

const { Server } = require('socket.io');

let io = null;

/**
 * Initialise the Socket.IO server on an existing http.Server instance.
 * Call this once, right after creating the HTTP server.
 * @param {import('http').Server} server
 */
const initWebSocket = (server) => {
    io = new Server(server, {
        path: '/ws',
        cors: { origin: '*' },
    });

    io.on('connection', (socket) => {
        console.log(`🟢 [WS] Client connected (id=${socket.id})`);

        // Acknowledge connection with a standard message event
        socket.emit('message', { type: 'connected', message: 'Socket.IO connected' });

        socket.on('disconnect', (reason) => {
            console.log(`🟡 [WS] Client disconnected (id=${socket.id}) reason=${reason}`);
        });

        socket.on('error', (err) => {
            console.error('🔴 [WS] Client error:', err && err.message ? err.message : err);
        });
    });

    io.on('error', (err) => {
        console.error('🔴 [WS] Server error:', err && err.message ? err.message : err);
    });

    console.log('🟢 [WS] Socket.IO server ready on path /ws');
    return io;
};

/**
 * Broadcast a JSON event to every connected client.
 * @param {{ type: string, data?: object }} event
 */
const broadcast = (event) => {
    if (!io) return;
    io.emit('message', event);
    console.log(`📡 [WS] Broadcast "${event.type}" to all clients`);
};

module.exports = { initWebSocket, broadcast };

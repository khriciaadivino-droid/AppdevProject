/**
 * WebSocket Server Module
 * Attach to the existing HTTP server so WS and REST share the same port.
 * Clients connect to  ws://<host>:<port>/ws
 */

const { WebSocketServer } = require('ws');

let wss = null;

/**
 * Initialise the WebSocket server on an existing http.Server instance.
 * Call this once, right after creating the HTTP server.
 * @param {import('http').Server} server
 */
const initWebSocket = (server) => {
    wss = new WebSocketServer({ server, path: '/ws' });

    // ── Connection handler ────────────────────────────────────────────────
    wss.on('connection', (ws) => {
        console.log(`🟢 [WS] Client connected  (total: ${wss.clients.size})`);

        ws.isAlive = true;
        ws.on('pong', () => { ws.isAlive = true; });

        // Send an immediate acknowledgement so the client knows the socket is ready
        ws.send(JSON.stringify({ type: 'connected', message: 'WebSocket connected' }));

        ws.on('close', () => {
            console.log(`🟡 [WS] Client disconnected (remaining: ${wss.clients.size - 1})`);
        });

        ws.on('error', (err) => {
            console.error('🔴 [WS] Client error:', err.message);
        });
    });

    // ── Heartbeat (detect stale connections) ─────────────────────────────
    const heartbeatInterval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (!ws.isAlive) {
                ws.terminate();
                return;
            }
            ws.isAlive = false;
            ws.ping();
        });
    }, 30_000);

    wss.on('close', () => {
        clearInterval(heartbeatInterval);
    });

    wss.on('error', (err) => {
        console.error('🔴 [WS] Server error:', err.message);
    });

    console.log('🟢 [WS] WebSocket server ready on path /ws');
    return wss;
};

/**
 * Broadcast a JSON event to every connected client.
 * @param {{ type: string, data?: object }} event
 */
const broadcast = (event) => {
    if (!wss) return;

    const message = JSON.stringify(event);
    let sent = 0;

    wss.clients.forEach((client) => {
        if (client.readyState === 1 /* WebSocket.OPEN */) {
            client.send(message);
            sent++;
        }
    });

    console.log(`📡 [WS] Broadcast "${event.type}" to ${sent} client(s)`);
};

module.exports = { initWebSocket, broadcast };

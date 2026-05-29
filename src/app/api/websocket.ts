/** Client-side Socket.IO service
 *
 * Uses `socket.io-client` to connect to the server Socket.IO endpoint at the
 * path `/ws`. Keeps the same small public API used elsewhere in the app:
 *  - `connect(token, onStatusChange)`
 *  - `disconnect()`
 *  - `subscribe(handler)` -> unsubscribe function
 */

import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from './config';

export interface WsEvent {
    type: string;
    message?: string;
    data?: {
        id?: number;
        action?: string | null;
        username?: string | null;
        target_data?: string | null;
        role?: string | null;
        timestamp?: string | null;
    };
}

type MessageHandler = (event: WsEvent) => void;
type StatusHandler = (connected: boolean) => void;

const WS_PATH = '/ws';
const INITIAL_RECONNECT_DELAY = 3_000;
const MAX_RECONNECT_DELAY = 30_000;

class WebSocketService {
    private socket: Socket | null = null;
    private messageHandlers = new Set<MessageHandler>();
    private statusHandler: StatusHandler | null = null;
    private token: string | null = null;

    private get baseUrl(): string {
        return API_BASE_URL.replace(/\/$/, '');
    }

    connect(token: string, onStatusChange?: StatusHandler): void {
        this.token = token;
        this.statusHandler = onStatusChange ?? null;

        if (this.socket && this.socket.connected) return;

        console.log('🟡 [WS] Connecting to', this.baseUrl + WS_PATH);

        this.socket = io(this.baseUrl, {
            path: WS_PATH,
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: INITIAL_RECONNECT_DELAY,
            reconnectionDelayMax: MAX_RECONNECT_DELAY,
            auth: { token },
        });

        this.socket.on('connect', () => {
            console.log('🟢 [WS] Connected');
            this.statusHandler?.(true);
        });

        this.socket.on('message', (event: WsEvent) => {
            try {
                this.messageHandlers.forEach((h) => h(event));
            } catch {
                // ignore handler errors
            }
        });

        this.socket.on('disconnect', () => {
            console.log('🟡 [WS] Disconnected');
            this.statusHandler?.(false);
        });

        this.socket.on('connect_error', (err) => {
            console.log('🔴 [WS] Connect error', err?.message ?? err);
        });
    }

    disconnect(): void {
        this.socket?.disconnect();
        this.socket = null;
        this.statusHandler?.(false);
    }

    subscribe(handler: MessageHandler): () => void {
        this.messageHandlers.add(handler);
        return () => this.messageHandlers.delete(handler);
    }

    get isConnected(): boolean {
        return !!this.socket?.connected;
    }
}

export const wsService = new WebSocketService();
export default wsService;

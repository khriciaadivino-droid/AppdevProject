/**
 * Client-side WebSocket service
 *
 * Uses the browser-compatible WebSocket global that React Native exposes.
 * Connects to ws(s)://<server>/ws and supports:
 *   - Auto-reconnect with exponential back-off
 *   - Multiple event-type subscribers
 *   - Status change callbacks
 */

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
    private socket: WebSocket | null = null;
    private messageHandlers = new Set<MessageHandler>();
    private statusHandler: StatusHandler | null = null;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private reconnectDelay = INITIAL_RECONNECT_DELAY;
    private shouldReconnect = false;
    private token: string | null = null;

    // ── URL helpers ───────────────────────────────────────────────────────

    private get wsUrl(): string {
        // Convert http(s):// → ws(s)://
        const base = API_BASE_URL.replace(/^http/, 'ws').replace(/\/$/, '');
        return `${base}${WS_PATH}`;
    }

    // ── Public API ────────────────────────────────────────────────────────

    /**
     * Open a WebSocket connection for the given user token.
     * Safe to call multiple times – ignores no-ops when already connected.
     */
    connect(token: string, onStatusChange?: StatusHandler): void {
        this.token = token;
        this.shouldReconnect = true;
        this.statusHandler = onStatusChange ?? null;
        this.reconnectDelay = INITIAL_RECONNECT_DELAY;
        this.openSocket();
    }

    /** Close the connection and stop auto-reconnect. */
    disconnect(): void {
        this.shouldReconnect = false;
        this.clearReconnectTimer();
        this.socket?.close();
        this.socket = null;
        this.notifyStatus(false);
    }

    /**
     * Register a handler that receives every incoming WsEvent.
     * Returns an unsubscribe function.
     */
    subscribe(handler: MessageHandler): () => void {
        this.messageHandlers.add(handler);
        return () => {
            this.messageHandlers.delete(handler);
        };
    }

    get isConnected(): boolean {
        return this.socket?.readyState === WebSocket.OPEN;
    }

    // ── Internal ──────────────────────────────────────────────────────────

    private openSocket(): void {
        if (
            this.socket &&
            (this.socket.readyState === WebSocket.CONNECTING ||
                this.socket.readyState === WebSocket.OPEN)
        ) {
            return; // already open or opening
        }

        try {
            console.log('🟡 [WS] Connecting to', this.wsUrl);
            this.socket = new WebSocket(this.wsUrl);

            this.socket.onopen = () => {
                console.log('🟢 [WS] Connected');
                this.reconnectDelay = INITIAL_RECONNECT_DELAY;
                this.notifyStatus(true);
            };

            this.socket.onmessage = (e: MessageEvent) => {
                try {
                    const parsed: WsEvent = JSON.parse(e.data as string);
                    this.messageHandlers.forEach((h) => h(parsed));
                } catch {
                    // Ignore malformed messages
                }
            };

            this.socket.onclose = () => {
                console.log('🟡 [WS] Disconnected');
                this.socket = null;
                this.notifyStatus(false);
                if (this.shouldReconnect) {
                    this.scheduleReconnect();
                }
            };

            this.socket.onerror = () => {
                // onclose will fire after onerror, so reconnect logic lives there
                console.log('🔴 [WS] Socket error');
                this.socket?.close();
            };
        } catch (err) {
            console.log('🔴 [WS] Failed to create socket:', err);
            if (this.shouldReconnect) {
                this.scheduleReconnect();
            }
        }
    }

    private scheduleReconnect(): void {
        if (this.reconnectTimer !== null) return;
        console.log(`🟡 [WS] Reconnecting in ${this.reconnectDelay / 1000}s…`);
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            if (this.shouldReconnect) {
                this.reconnectDelay = Math.min(
                    this.reconnectDelay * 1.5,
                    MAX_RECONNECT_DELAY,
                );
                this.openSocket();
            }
        }, this.reconnectDelay);
    }

    private clearReconnectTimer(): void {
        if (this.reconnectTimer !== null) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    private notifyStatus(connected: boolean): void {
        this.statusHandler?.(connected);
    }
}

/** Singleton shared across the app */
export const wsService = new WebSocketService();
export default wsService;

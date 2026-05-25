import React, { FC, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import { RootState } from '../app/reducers';
import { extractNotifications, getNotifications, NotificationItem } from '../app/api/notification';
import wsService, { WsEvent } from '../app/api/websocket';

interface NotificationsScreenProps {
    navigation: any;
}

const getNotificationIcon = (action?: string | null): string => {
    switch ((action ?? '').toUpperCase()) {
        case 'CREATE':
            return '✨';
        case 'ORDER_STATUS':
            return '📦';
        case 'UPDATE':
            return '🛠️';
        case 'DELETE':
            return '🗑️';
        case 'LOGIN':
            return '🔐';
        case 'LOGOUT':
            return '👋';
        default:
            return '🔔';
    }
};

const getNotificationTone = (action?: string | null): string => {
    switch ((action ?? '').toUpperCase()) {
        case 'CREATE':
            return '#DCFCE7';
        case 'ORDER_STATUS':
            return '#DBEAFE';
        case 'UPDATE':
            return '#FEF3C7';
        case 'DELETE':
            return '#FEE2E2';
        case 'LOGIN':
        case 'LOGOUT':
            return '#DBEAFE';
        default:
            return '#E5E7EB';
    }
};

const formatNotificationTitle = (item: NotificationItem): string => {
    const actor = item.username || 'Someone';
    const normalizedAction = (item.action || 'ACTIVITY').toUpperCase();
    const action = normalizedAction.toLowerCase();

    if (normalizedAction === 'ORDER_STATUS') {
        if (item.target_data) {
            return `${item.target_data} Updated by ${actor}.`;
        }

        return `${actor} updated your order status.`;
    }

    if (item.target_data) {
        return `${actor} ${action}d ${item.target_data}`;
    }

    if (action === 'login') {
        return `${actor} signed in`;
    }

    if (action === 'logout') {
        return `${actor} signed out`;
    }

    return `${actor} recorded a ${action} event`;
};

const formatActionLabel = (action?: string | null): string => {
    if ((action ?? '').toUpperCase() === 'ORDER_STATUS') {
        return 'ORDER STATUS';
    }

    return action || 'EVENT';
};

const formatTimestamp = (timestamp?: string | null): string => {
    if (!timestamp) {
        return 'Just now';
    }

    const parsed = new Date(timestamp.replace(' ', 'T'));
    if (Number.isNaN(parsed.getTime())) {
        return timestamp;
    }

    return parsed.toLocaleString();
};

const NotificationsScreen: FC<NotificationsScreenProps> = () => {
    const isFocused = useIsFocused();
    const { data: user } = useSelector((state: RootState) => state.auth);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [wsConnected, setWsConnected] = useState(false);

    const loadNotifications = async (): Promise<void> => {
        if (!user?.token) {
            setNotifications([]);
            setError('Please sign in again to load your notifications.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await getNotifications(user.token, { limit: 25 });

            if (response.ok) {
                setNotifications(extractNotifications(response.data));
                return;
            }

            setNotifications([]);
            setError(response.data?.message || 'Unable to load notifications right now.');
        } catch {
            setNotifications([]);
            setError('Unable to load notifications right now.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isFocused || !user?.token) {
            wsService.disconnect();
            return;
        }

        // Initial HTTP fetch so the list is populated before any WS events arrive
        loadNotifications();

        // Open (or re-use) the WebSocket connection
        wsService.connect(user.token, setWsConnected);

        // Prepend new events that arrive over the socket
        const unsubscribe = wsService.subscribe((event: WsEvent) => {
            if (event.type !== 'notification' || !event.data) return;

            const item: NotificationItem = {
                id: event.data.id ?? Date.now(),
                action: event.data.action ?? null,
                username: event.data.username ?? null,
                target_data: event.data.target_data ?? null,
                role: event.data.role ?? null,
                timestamp: event.data.timestamp ?? null,
            };

            setNotifications((prev) => [item, ...prev]);
        });

        return () => {
            unsubscribe();
            wsService.disconnect();
        };
    }, [isFocused, user?.token]);

    return (
        <View style={styles.container}>
            <DashboardHeader onMenuPress={() => setSidebarOpen(true)} />
            <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <View style={styles.heroCard}>
                    <Text style={styles.heroTitle}>Notifications</Text>
                    <Text style={styles.heroSubtitle}>Recent account and activity updates from the backend.</Text>
                </View>

                <View style={styles.panel}>
                    <View style={styles.panelHeader}>
                        <View>
                            <View style={styles.panelTitleRow}>
                                <Text style={styles.panelTitle}>Latest activity</Text>
                                {wsConnected ? (
                                    <View style={styles.liveBadge}>
                                        <Text style={styles.liveBadgeText}>● LIVE</Text>
                                    </View>
                                ) : null}
                            </View>
                            <Text style={styles.panelSubtitle}>Your most recent events are pulled from the server in real time.</Text>
                        </View>

                        <TouchableOpacity style={styles.refreshButton} onPress={loadNotifications} disabled={loading}>
                            <Text style={styles.refreshButtonText}>{loading ? 'Refreshing...' : 'Refresh'}</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingState}>
                            <ActivityIndicator size="large" color="#111827" />
                            <Text style={styles.loadingText}>Loading notifications...</Text>
                        </View>
                    ) : null}

                    {!loading && error ? (
                        <View style={styles.errorCard}>
                            <Text style={styles.errorTitle}>Unable to load notifications</Text>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    {!loading && !error && notifications.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyTitle}>No notifications yet</Text>
                            <Text style={styles.emptyText}>New account, order, and pet activity will appear here once actions are recorded.</Text>
                        </View>
                    ) : null}

                    {!loading && !error && notifications.length > 0 ? (
                        <View style={styles.list}>
                            {notifications.map((item) => (
                                <View key={item.id} style={styles.notificationCard}>
                                    <View style={[styles.iconWrap, { backgroundColor: getNotificationTone(item.action) }]}>
                                        <Text style={styles.iconText}>{getNotificationIcon(item.action)}</Text>
                                    </View>

                                    <View style={styles.notificationBody}>
                                        <View style={styles.notificationMetaRow}>
                                            <Text style={styles.notificationAction}>{formatActionLabel(item.action)}</Text>
                                            <Text style={styles.notificationTime}>{formatTimestamp(item.timestamp)}</Text>
                                        </View>

                                        <Text style={styles.notificationTitle}>{formatNotificationTitle(item)}</Text>

                                        {item.role ? (
                                            <Text style={styles.notificationRole}>{item.role.replace('ROLE_', '').toLowerCase()}</Text>
                                        ) : null}
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : null}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create<{ [key: string]: ViewStyle | TextStyle }>({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    content: { flex: 1 },
    contentContainer: { padding: 16, paddingBottom: 32 },
    heroCard: {
        backgroundColor: '#111827',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
    },
    heroTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF' },
    heroSubtitle: { fontSize: 14, color: '#D1D5DB', marginTop: 6 },
    panel: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    panelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    panelTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    panelTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
    liveBadge: {
        borderRadius: 8,
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    liveBadgeText: { fontSize: 10, fontWeight: '800', color: '#15803D' },
    panelSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 4, maxWidth: 240 },
    refreshButton: {
        borderRadius: 14,
        backgroundColor: '#111827',
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    refreshButtonText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
    loadingState: { paddingVertical: 36, alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
    errorCard: {
        marginTop: 18,
        borderRadius: 18,
        backgroundColor: '#FEF2F2',
        padding: 16,
    },
    errorTitle: { fontSize: 15, fontWeight: '700', color: '#991B1B' },
    errorText: { marginTop: 6, fontSize: 13, lineHeight: 20, color: '#B91C1C' },
    emptyCard: {
        marginTop: 18,
        borderRadius: 18,
        backgroundColor: '#F9FAFB',
        padding: 20,
        alignItems: 'center',
    },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
    emptyText: { marginTop: 8, fontSize: 13, lineHeight: 20, textAlign: 'center', color: '#6B7280' },
    list: { marginTop: 18, gap: 12 },
    notificationCard: {
        flexDirection: 'row',
        gap: 12,
        borderRadius: 18,
        backgroundColor: '#F9FAFB',
        padding: 14,
    },
    iconWrap: {
        width: 46,
        height: 46,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconText: { fontSize: 20 },
    notificationBody: { flex: 1 },
    notificationMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    notificationAction: { fontSize: 11, fontWeight: '800', color: '#2563EB', textTransform: 'uppercase' },
    notificationTime: { fontSize: 11, color: '#9CA3AF' },
    notificationTitle: { marginTop: 6, fontSize: 14, fontWeight: '700', color: '#111827', lineHeight: 20 },
    notificationRole: { marginTop: 8, fontSize: 12, color: '#6B7280', textTransform: 'capitalize' },
});

export default NotificationsScreen;
import React, { FC, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { RootState } from '../app/reducers';
import * as types from '../app/actions';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import { SCREENS } from '../utils/routes';

interface OrderLineItem {
    quantity?: number;
}

interface OrderItem {
    id: number;
    orderNumber?: string;
    customerName?: string;
    status?: string;
    totalAmount?: number;
    createdAt?: string;
    items?: OrderLineItem[];
}

interface SummaryCardProps {
    label: string;
    value: string | number;
    tone: 'blue' | 'amber' | 'green' | 'violet';
}

interface OrderRowProps {
    order: OrderItem;
    onEdit: (order: OrderItem) => void;
    onDelete: (orderId: number) => void;
}

const formatCurrency = (value?: number): string => `PHP ${(Number(value) || 0).toFixed(2)}`;

const formatOrderDate = (value?: string): string => {
    if (!value) {
        return 'No date';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return parsed.toLocaleDateString();
};

const getOrderNumber = (order: OrderItem): string => {
    const raw = (order as any).orderNumber || (order as any).order_number;
    return raw ? String(raw) : `Order #${order.id}`;
};

const getCustomerName = (order: OrderItem): string => {
    const raw =
        (order as any).customerName ||
        (order as any).customer_name ||
        (order as any).customer?.name;

    return raw ? String(raw) : 'Customer';
};

const getTotalAmount = (order: OrderItem): number => {
    return Number((order as any).totalAmount ?? (order as any).total_amount ?? 0);
};

const getCreatedAt = (order: OrderItem): string | undefined => {
    return (
        (order as any).createdAt ||
        (order as any).created_at ||
        (order as any).orderDate ||
        (order as any).order_date
    );
};

const getItemCount = (order: OrderItem): number => {
    const items = (order as any).items;

    if (!Array.isArray(items)) {
        return Number((order as any).quantity || 0);
    }

    return items.reduce(
        (total: number, item: OrderLineItem) => total + (Number(item?.quantity) || 1),
        0
    );
};

const getStatusColor = (status?: string): { bg: string; text: string } => {
    switch ((status || '').toLowerCase()) {
        case 'completed':
        case 'delivered':
            return { bg: '#D1FAE5', text: '#065F46' };
        case 'processing':
        case 'confirmed':
        case 'shipped':
            return { bg: '#DBEAFE', text: '#1E40AF' };
        case 'pending':
            return { bg: '#FEF3C7', text: '#92400E' };
        default:
            return { bg: '#FEE2E2', text: '#991B1B' };
    }
};

const summaryToneStyles = {
    blue: { bg: '#DBEAFE', text: '#1D4ED8' },
    amber: { bg: '#FEF3C7', text: '#B45309' },
    green: { bg: '#DCFCE7', text: '#15803D' },
    violet: { bg: '#EDE9FE', text: '#6D28D9' },
};

const SummaryCard: FC<SummaryCardProps> = ({ label, value, tone }) => {
    const toneStyle = summaryToneStyles[tone];

    return (
        <View style={styles.summaryCard}>
            <View style={[styles.summaryPill, { backgroundColor: toneStyle.bg }]}>
                <Text style={[styles.summaryPillText, { color: toneStyle.text }]}>{label}</Text>
            </View>
            <Text style={styles.summaryValue}>{value}</Text>
        </View>
    );
};

const OrderRow: FC<OrderRowProps> = ({ order, onEdit, onDelete }) => {
    const statusColors = getStatusColor(order.status);
    const fulfillmentType: string = (order as any).fulfillmentType || (order as any).fulfillment_type || '';
    const deliveryAddress: string = (order as any).deliveryAddress || (order as any).delivery_address || '';
    const isDelivery = fulfillmentType.toLowerCase() === 'delivery';

    return (
        <View style={styles.orderRow}>
            <View style={styles.orderRowHeader}>
                <View style={styles.orderRowMain}>
                    <Text style={styles.orderNumber}>{getOrderNumber(order)}</Text>
                    <Text style={styles.orderMeta}>
                        {getCustomerName(order)} | {Math.max(getItemCount(order), 0)} item(s)
                    </Text>
                </View>
                <View style={styles.badgesWrap}>
                    {fulfillmentType ? (
                        <View style={[styles.fulfillmentBadge, isDelivery ? styles.fulfillmentBadgeDelivery : styles.fulfillmentBadgePickup]}>
                            <Text style={[styles.fulfillmentBadgeText, isDelivery ? styles.fulfillmentBadgeTextDelivery : styles.fulfillmentBadgeTextPickup]}>
                                {isDelivery ? '🚚 Delivery' : '🏪 Pickup'}
                            </Text>
                        </View>
                    ) : null}
                    <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                        <Text style={[styles.statusText, { color: statusColors.text }]}>
                            {order.status || 'Unknown'}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.orderDetailRow}>
                <View>
                    <Text style={styles.detailLabel}>Date</Text>
                    <Text style={styles.detailValue}>{formatOrderDate(getCreatedAt(order))}</Text>
                </View>
                <View style={styles.amountWrap}>
                    <Text style={styles.detailLabel}>Total</Text>
                    <Text style={styles.amountValue}>{formatCurrency(getTotalAmount(order))}</Text>
                </View>
            </View>

            {isDelivery && deliveryAddress ? (
                <View style={styles.deliveryAddressRow}>
                    <Text style={styles.deliveryAddressLabel}>Delivery address:</Text>
                    <Text style={styles.deliveryAddressText}>{deliveryAddress}</Text>
                </View>
            ) : null}

            <View style={styles.rowActions}>
                <TouchableOpacity style={styles.editButton} onPress={() => onEdit(order)}>
                    <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(order.id)}>
                    <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const OrdersScreen: FC = () => {
    const navigation = useNavigation<any>();
    const dispatch = useDispatch();
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const { data: user } = useSelector((state: RootState) => state.auth);
    const { list: orders, isLoading, error } = useSelector(
        (state: RootState) => state.order
    );

    const refreshOrders = React.useCallback((): void => {
        if (!user?.token) {
            return;
        }

        dispatch({
            type: types.GET_ORDERS_REQUEST,
            token: user.token,
        } as any);
    }, [dispatch, user?.token]);

    useEffect(() => {
        refreshOrders();
    }, [refreshOrders]);

    useFocusEffect(
        React.useCallback(() => {
            if (user?.token) {
                refreshOrders();
            }
        }, [refreshOrders, user?.token])
    );

    const handleDelete = (orderId: number): void => {
        Alert.alert(
            'Delete Order',
            'Are you sure you want to delete this order?',
            [
                { text: 'Cancel', onPress: () => undefined },
                {
                    text: 'Delete',
                    onPress: () => {
                        dispatch({
                            type: types.DELETE_ORDER_REQUEST,
                            id: orderId,
                            token: user?.token,
                        } as any);
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    const handleEdit = (order: OrderItem): void => {
        navigation.navigate(SCREENS.EDIT_ORDER, { orderId: order.id, order });
    };

    const handleAdd = (): void => {
        navigation.navigate(SCREENS.ADD_ORDER);
    };

    const totalOrders = orders.length;
    const activeOrders = orders.filter((order: OrderItem) =>
        ['pending', 'confirmed', 'processing', 'shipped'].includes((order.status || '').toLowerCase())
    ).length;
    const deliveredOrders = orders.filter((order: OrderItem) =>
        ['completed', 'delivered'].includes((order.status || '').toLowerCase())
    ).length;
    const totalSpent = orders.reduce(
        (total: number, order: OrderItem) => total + getTotalAmount(order),
        0
    );

    if (isLoading && orders.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <DashboardHeader onMenuPress={() => setSidebarOpen(true)} />
            <DashboardSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <View style={styles.heroCard}>
                    <Text style={styles.heroTitle}>Orders</Text>
                    <Text style={styles.heroSubtitle}>
                        View, update, and remove orders backed by your live API.
                    </Text>
                    <View style={styles.heroActions}>
                        <TouchableOpacity style={styles.primaryButton} onPress={handleAdd}>
                            <Text style={styles.primaryButtonText}>New Order</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.secondaryButton} onPress={refreshOrders}>
                            <Text style={styles.secondaryButtonText}>
                                {isLoading ? 'Refreshing...' : 'Refresh'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.summaryGrid}>
                    <SummaryCard label="Total Orders" value={totalOrders} tone="blue" />
                    <SummaryCard label="Active" value={activeOrders} tone="amber" />
                    <SummaryCard label="Delivered" value={deliveredOrders} tone="green" />
                    <SummaryCard label="Total Spent" value={formatCurrency(totalSpent)} tone="violet" />
                </View>

                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Order List</Text>
                        <Text style={styles.sectionSubtitle}>
                            Edit or delete any order without leaving the live list.
                        </Text>
                    </View>

                    {error ? (
                        <View style={styles.errorBanner}>
                            <Text style={styles.errorBannerText}>{error}</Text>
                        </View>
                    ) : null}

                    {orders.length > 0 ? (
                        <View style={styles.ordersList}>
                            {orders.map((order: OrderItem) => (
                                <OrderRow
                                    key={order.id}
                                    order={order}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyStateCard}>
                            <Text style={styles.emptyStateTitle}>No orders yet</Text>
                            <Text style={styles.emptyStateText}>
                                Create your first order and it will appear here automatically.
                            </Text>
                            <TouchableOpacity style={styles.primaryButton} onPress={handleAdd}>
                                <Text style={styles.primaryButtonText}>Create First Order</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create<{ [key: string]: ViewStyle | TextStyle }>({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 28,
    },
    heroCard: {
        backgroundColor: '#111827',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    heroSubtitle: {
        fontSize: 14,
        color: '#D1D5DB',
        marginTop: 6,
        lineHeight: 20,
    },
    heroActions: {
        flexDirection: 'row',
        marginTop: 18,
        gap: 12,
    },
    primaryButton: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    secondaryButton: {
        borderWidth: 1,
        borderColor: '#374151',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1F2937',
    },
    secondaryButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#F9FAFB',
    },
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    summaryCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    summaryPill: {
        alignSelf: 'flex-start',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginBottom: 12,
    },
    summaryPillText: {
        fontSize: 11,
        fontWeight: '700',
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
    },
    sectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 16,
    },
    sectionHeader: {
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 4,
    },
    errorBanner: {
        backgroundColor: '#FEF3C7',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 14,
    },
    errorBannerText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#92400E',
        lineHeight: 18,
    },
    ordersList: {
        gap: 12,
    },
    orderRow: {
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 14,
    },
    orderRowHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
    },
    orderRowMain: {
        flex: 1,
    },
    orderNumber: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    orderMeta: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    orderDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        gap: 16,
    },
    detailLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
        marginTop: 4,
    },
    amountWrap: {
        alignItems: 'flex-end',
    },
    amountValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#047857',
        marginTop: 4,
    },
    rowActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 16,
    },
    badgesWrap: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 6,
    },
    fulfillmentBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    fulfillmentBadgePickup: {
        backgroundColor: '#D1FAE5',
    },
    fulfillmentBadgeDelivery: {
        backgroundColor: '#DBEAFE',
    },
    fulfillmentBadgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    fulfillmentBadgeTextPickup: {
        color: '#065F46',
    },
    fulfillmentBadgeTextDelivery: {
        color: '#1E40AF',
    },
    deliveryAddressRow: {
        marginTop: 10,
        backgroundColor: '#EFF6FF',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    deliveryAddressLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#1E40AF',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        marginBottom: 2,
    },
    deliveryAddressText: {
        fontSize: 13,
        color: '#1E3A8A',
        lineHeight: 18,
    },
    editButton: {
        flex: 1,
        backgroundColor: '#E0E7FF',
        borderRadius: 10,
        paddingVertical: 8,
        alignItems: 'center',
    },
    editButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#3730A3',
    },
    deleteButton: {
        flex: 1,
        backgroundColor: '#FEE2E2',
        borderRadius: 10,
        paddingVertical: 8,
        alignItems: 'center',
    },
    deleteButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#B91C1C',
    },
    emptyStateCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 14,
        padding: 20,
        alignItems: 'center',
    },
    emptyStateTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 6,
    },
    emptyStateText: {
        fontSize: 13,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 16,
    },
});

export default OrdersScreen;

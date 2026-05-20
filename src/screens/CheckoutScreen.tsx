import React, { FC, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/reducers';
import { cartClear, CartItem } from '../app/reducers/cart';
import { createOrder } from '../app/api/order';
import DashboardHeader from '../components/DashboardHeader';
import { SCREENS } from '../utils/routes';

interface CheckoutScreenProps {
    navigation: any;
}

const CheckoutScreen: FC<CheckoutScreenProps> = ({ navigation }) => {
    const dispatch = useDispatch();
    const items = useSelector((state: RootState) => state.cart.items);
    const { data: user } = useSelector((state: RootState) => state.auth);

    const [customerName, setCustomerName] = useState<string>(user?.name || '');
    const [customerEmail, setCustomerEmail] = useState<string>(user?.email || '');
    const [fulfillmentType, setFulfillmentType] = useState<'pickup' | 'delivery'>('pickup');
    const [deliveryAddress, setDeliveryAddress] = useState<string>('');
    const [isPlacing, setIsPlacing] = useState<boolean>(false);

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    if (items.length === 0) {
        return (
            <View style={styles.container}>
                <DashboardHeader onMenuPress={() => navigation.goBack()} />
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>🛒</Text>
                    <Text style={styles.emptyTitle}>Your cart is empty</Text>
                    <TouchableOpacity
                        style={styles.backCartBtn}
                        onPress={() => navigation.navigate(SCREENS.CART)}
                    >
                        <Text style={styles.backCartBtnText}>Go to Cart</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const handlePlaceOrder = async (): Promise<void> => {
        if (!customerName.trim()) {
            Alert.alert('Required', 'Please enter your name.');
            return;
        }

        if (fulfillmentType === 'delivery' && !deliveryAddress.trim()) {
            Alert.alert('Required', 'Please enter a delivery address.');
            return;
        }

        if (!user?.token) {
            Alert.alert('Error', 'You must be signed in to place an order.');
            return;
        }

        setIsPlacing(true);

        try {
            const results = await Promise.all(
                items.map((item: CartItem) =>
                    createOrder(
                        {
                            orderNumber: `ORD-${Date.now()}-${item.productId}`,
                            productId: String(item.productId),
                            customerName: customerName.trim(),
                            customerEmail: customerEmail.trim(),
                            quantity: item.quantity,
                            totalAmount: item.price * item.quantity,
                            fulfillmentType,
                            deliveryAddress: fulfillmentType === 'delivery' ? deliveryAddress.trim() : null,
                        } as any,
                        user.token
                    )
                )
            );

            const failed = results.filter((r) => !r.ok);

            if (failed.length > 0) {
                Alert.alert(
                    'Partial failure',
                    `${failed.length} of ${items.length} item(s) could not be ordered. Please try again.`
                );
                return;
            }

            dispatch(cartClear() as any);

            Alert.alert(
                '🎉 Order Placed!',
                `Your ${items.length} item(s) have been ordered successfully.\n\nFulfillment: ${fulfillmentType === 'delivery' ? 'Delivery' : 'Pickup'}${fulfillmentType === 'delivery' ? `\nAddress: ${deliveryAddress.trim()}` : ''}`,
                [{ text: 'View Orders', onPress: () => navigation.navigate(SCREENS.ORDERS) }]
            );
        } catch (err: any) {
            Alert.alert('Error', err?.message || 'Something went wrong. Please try again.');
        } finally {
            setIsPlacing(false);
        }
    };

    return (
        <View style={styles.container}>
            <DashboardHeader onMenuPress={() => navigation.goBack()} />

            <View style={styles.pageHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>← Cart</Text>
                </TouchableOpacity>
                <Text style={styles.pageTitle}>Checkout</Text>
                <View />
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

                {/* Order Summary */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📦 Order Summary</Text>
                    {items.map((item: CartItem) => (
                        <View key={item.productId} style={styles.summaryRow}>
                            <Text style={styles.summaryItemName} numberOfLines={1}>{item.name}</Text>
                            <Text style={styles.summaryItemMeta}>×{item.quantity}</Text>
                            <Text style={styles.summaryItemTotal}>₱{(item.price * item.quantity).toFixed(2)}</Text>
                        </View>
                    ))}
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryTotalLabel}>Total ({totalItems} item{totalItems !== 1 ? 's' : ''})</Text>
                        <Text style={styles.summaryTotalAmount}>₱{totalAmount.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Contact Details */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>👤 Your Details</Text>

                    <Text style={styles.fieldLabel}>Full Name *</Text>
                    <TextInput
                        style={styles.input}
                        value={customerName}
                        onChangeText={setCustomerName}
                        placeholder="Enter your full name"
                        autoCapitalize="words"
                        editable={!isPlacing}
                    />

                    <Text style={styles.fieldLabel}>Email</Text>
                    <TextInput
                        style={styles.input}
                        value={customerEmail}
                        onChangeText={setCustomerEmail}
                        placeholder="your@email.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!isPlacing}
                    />
                </View>

                {/* Fulfillment */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🚚 Delivery Details</Text>

                    <Text style={styles.fieldLabel}>How do you want to receive your order?</Text>
                    <View style={styles.fulfillmentRow}>
                        {(['pickup', 'delivery'] as const).map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={[
                                    styles.fulfillmentChip,
                                    fulfillmentType === option && styles.fulfillmentChipActive,
                                ]}
                                onPress={() => setFulfillmentType(option)}
                                disabled={isPlacing}
                            >
                                <Text style={[
                                    styles.fulfillmentChipText,
                                    fulfillmentType === option && styles.fulfillmentChipTextActive,
                                ]}>
                                    {option === 'pickup' ? '🏪 Pickup at store' : '🚚 Deliver to me'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {fulfillmentType === 'pickup' ? (
                        <View style={styles.pickupNote}>
                            <Text style={styles.pickupNoteText}>
                                You'll pick up your order at our store. We'll notify you when it's ready.
                            </Text>
                        </View>
                    ) : (
                        <>
                            <Text style={styles.fieldLabel}>Delivery Address *</Text>
                            <TextInput
                                style={[styles.input, styles.addressInput]}
                                value={deliveryAddress}
                                onChangeText={setDeliveryAddress}
                                placeholder="House/unit no., street, barangay, city, province"
                                multiline
                                numberOfLines={3}
                                editable={!isPlacing}
                            />
                        </>
                    )}
                </View>
            </ScrollView>

            {/* Place Order Footer */}
            <View style={styles.footer}>
                <View style={styles.footerTotal}>
                    <Text style={styles.footerTotalLabel}>Total</Text>
                    <Text style={styles.footerTotalAmount}>₱{totalAmount.toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.placeOrderBtn, isPlacing && styles.placeOrderBtnDisabled]}
                    onPress={handlePlaceOrder}
                    disabled={isPlacing}
                >
                    {isPlacing ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.placeOrderBtnText}>
                            {fulfillmentType === 'delivery' ? '🚚 Place Order' : '🏪 Place Order'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create<{ [key: string]: ViewStyle | TextStyle }>({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    emptyIcon: { fontSize: 64, marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 20 },
    backCartBtn: {
        backgroundColor: '#F59E0B',
        paddingHorizontal: 28,
        paddingVertical: 12,
        borderRadius: 12,
    },
    backCartBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
    pageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backBtn: { padding: 4 },
    backBtnText: { fontSize: 14, color: '#3B82F6', fontWeight: '600' },
    pageTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
    scroll: { flex: 1 },
    scrollContent: { padding: 16, gap: 16 },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 14,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryItemName: { flex: 1, fontSize: 13, color: '#374151' },
    summaryItemMeta: { fontSize: 13, color: '#9CA3AF', marginHorizontal: 8 },
    summaryItemTotal: { fontSize: 13, fontWeight: '600', color: '#111827' },
    summaryDivider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 10,
    },
    summaryTotalLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: '#111827' },
    summaryTotalAmount: { fontSize: 18, fontWeight: '800', color: '#047857' },
    fieldLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4B5563',
        marginBottom: 6,
        marginTop: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#1F2937',
        backgroundColor: '#F9FAFB',
    },
    addressInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    fulfillmentRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 4,
    },
    fulfillmentChip: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        alignItems: 'center',
    },
    fulfillmentChipActive: {
        backgroundColor: '#FEF9C3',
        borderColor: '#F59E0B',
    },
    fulfillmentChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
        textAlign: 'center',
    },
    fulfillmentChipTextActive: {
        color: '#92400E',
    },
    pickupNote: {
        marginTop: 12,
        backgroundColor: '#ECFDF5',
        borderRadius: 10,
        padding: 12,
    },
    pickupNoteText: {
        fontSize: 13,
        color: '#065F46',
        lineHeight: 18,
    },
    footer: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        padding: 16,
    },
    footerTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    footerTotalLabel: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
    footerTotalAmount: { fontSize: 22, fontWeight: '800', color: '#047857' },
    placeOrderBtn: {
        backgroundColor: '#F59E0B',
        paddingVertical: 15,
        borderRadius: 14,
        alignItems: 'center',
    },
    placeOrderBtnDisabled: { opacity: 0.6 },
    placeOrderBtnText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
});

export default CheckoutScreen;

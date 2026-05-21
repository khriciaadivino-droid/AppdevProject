import React, { FC, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/reducers';
import { cartClear, CartItem } from '../app/reducers/cart';
import { createOrder } from '../app/api/order';
import { createPayment } from '../app/api/payment';
import {
    formatCardNumber,
    formatExpiry,
    isCvcValid,
    isCardholderNameValid,
    isExpiryValid,
    isPhilippineMobile,
    luhnCheck,
    parseExpiry,
    rawCardNumber,
} from '../utils/cardValidation';
import DashboardHeader from '../components/DashboardHeader';
import { SCREENS } from '../utils/routes';

type PaymentMethod = 'cash' | 'gcash' | 'maya' | 'card';

const PAYMENT_OPTIONS: { value: PaymentMethod; icon: string; label: string; labelPickup?: string }[] = [
    { value: 'cash', icon: '💵', label: 'Cash on Delivery', labelPickup: 'Pay at Store' },
    { value: 'gcash', icon: '📱', label: 'GCash' },
    { value: 'maya', icon: '📲', label: 'Maya' },
    { value: 'card', icon: '💳', label: 'Credit / Debit Card' },
];

interface CheckoutScreenProps {
    navigation: any;
}

const CheckoutScreen: FC<CheckoutScreenProps> = ({ navigation }) => {
    const dispatch = useDispatch();
    const items = useSelector((state: RootState) => state.cart.items);
    const { data: user } = useSelector((state: RootState) => state.auth);

    // ── Basic details ─────────────────────────────────────────────────────
    const [customerName, setCustomerName] = useState<string>(user?.name || '');
    const [customerEmail, setCustomerEmail] = useState<string>(user?.email || '');
    const [customerPhone, setCustomerPhone] = useState<string>('');

    // ── Fulfillment ───────────────────────────────────────────────────────
    const [fulfillmentType, setFulfillmentType] = useState<'pickup' | 'delivery'>('pickup');
    const [deliveryAddress, setDeliveryAddress] = useState<string>('');

    // ── Payment ───────────────────────────────────────────────────────────
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

    // Card-specific
    const [cardHolder, setCardHolder] = useState<string>(user?.name || '');
    const [cardNumber, setCardNumber] = useState<string>('');
    const [cardExpiry, setCardExpiry] = useState<string>('');
    const [cardCvc, setCardCvc] = useState<string>('');

    // E-wallet
    const [ewalletNumber, setEwalletNumber] = useState<string>('');

    // ── UI state ──────────────────────────────────────────────────────────
    const [isPlacing, setIsPlacing] = useState<boolean>(false);

    const cardNumberRef = useRef<TextInput>(null);
    const cardExpiryRef = useRef<TextInput>(null);
    const cardCvcRef = useRef<TextInput>(null);

    // ── Computed ──────────────────────────────────────────────────────────
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    // ── Empty cart guard ──────────────────────────────────────────────────
    if (items.length === 0) {
        return (
            <View style={styles.container}>
                <DashboardHeader onMenuPress={() => navigation.goBack()} />
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>🛒</Text>
                    <Text style={styles.emptyTitle}>Your cart is empty</Text>
                    <TouchableOpacity
                        style={styles.emptyBtn}
                        onPress={() => navigation.navigate(SCREENS.CART)}
                    >
                        <Text style={styles.emptyBtnText}>Go to Cart</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // ── Validation ────────────────────────────────────────────────────────
    const validate = (): string | null => {
        if (!customerName.trim()) return 'Please enter your full name.';

        if (fulfillmentType === 'delivery' && !deliveryAddress.trim()) {
            return 'Please enter a delivery address.';
        }

        if (paymentMethod === 'card') {
            if (!isCardholderNameValid(cardHolder)) {
                return 'Cardholder name must contain letters only.';
            }
            const raw = rawCardNumber(cardNumber);
            if (raw.length !== 16 || !luhnCheck(raw)) {
                return 'Please enter a valid 16-digit card number.';
            }
            if (!isExpiryValid(cardExpiry)) {
                return 'Please enter a valid future expiry date (MM / YY).';
            }
            if (!isCvcValid(cardCvc)) {
                return 'CVC must be 3 or 4 digits.';
            }
        }

        if (paymentMethod === 'gcash' || paymentMethod === 'maya') {
            if (!isPhilippineMobile(ewalletNumber)) {
                return 'Please enter a valid Philippine mobile number (e.g. 0917XXXXXXX).';
            }
        }

        return null;
    };

    // ── Place order ───────────────────────────────────────────────────────
    const handlePlaceOrder = async (): Promise<void> => {
        const validationError = validate();
        if (validationError) {
            Alert.alert('Missing Information', validationError);
            return;
        }

        if (!user?.token) {
            Alert.alert('Error', 'You must be signed in to place an order.');
            return;
        }

        setIsPlacing(true);

        try {
            // 1. Create one order per cart item in the database
            const orderResults = await Promise.all(
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
                            paymentMethod,
                        } as any,
                        user.token
                    )
                )
            );

            const failed = orderResults.filter((r) => !r.ok);
            if (failed.length > 0) {
                Alert.alert(
                    'Order Error',
                    `${failed.length} of ${items.length} item(s) could not be created. Please try again.`
                );
                return;
            }

            // Collect persisted order IDs for payment tagging
            const orderIds: number[] = orderResults
                .map((r) => (r.data as any)?.data?.id)
                .filter(Boolean);

            // 2. Cash → done immediately
            if (paymentMethod === 'cash') {
                dispatch(cartClear() as any);
                Alert.alert(
                    '🎉 Order Placed!',
                    `Your order${items.length > 1 ? 's have' : ' has'} been placed successfully.\n\nFulfillment: ${fulfillmentType === 'delivery' ? 'Delivery' : 'Pickup at Store'}\nPayment: Cash`,
                    [{ text: 'View Orders', onPress: () => navigation.navigate(SCREENS.ORDERS) }]
                );
                return;
            }

            // 3. Online payment → call PayMongo via backend
            const description = `Divino – ${items.length} item${items.length > 1 ? 's' : ''} (${fulfillmentType})`;

            const expiry = parseExpiry(cardExpiry);
            const payload = {
                payment_method: paymentMethod as 'gcash' | 'maya' | 'card',
                total_amount: totalAmount,
                order_ids: orderIds,
                description,
                customer_name: customerName.trim(),
                customer_email: customerEmail.trim(),
                customer_phone: (paymentMethod !== 'card' ? ewalletNumber : customerPhone).trim(),
                ...(paymentMethod === 'card' && {
                    card_holder: cardHolder.trim(),
                    card_number: rawCardNumber(cardNumber),
                    exp_month_year: expiry ? `${String(expiry.month).padStart(2, '0')}/${String(expiry.year).slice(2)}` : '',
                    cvc: cardCvc.trim(),
                }),
            };

            const paymentRes = await createPayment(payload, user.token);

            if (!paymentRes.ok || !paymentRes.data?.success) {
                Alert.alert('Payment Error', paymentRes.data?.message || 'Payment failed. Please try again.');
                return;
            }

            const result = paymentRes.data;

            if (result.type === 'success') {
                // Card charged immediately (no 3DS needed)
                dispatch(cartClear() as any);
                Alert.alert(
                    '✅ Payment Successful!',
                    'Your card was charged successfully. Check "My Orders" to track your order.',
                    [{ text: 'View Orders', onPress: () => navigation.navigate(SCREENS.ORDERS) }]
                );
                return;
            }

            if (result.type === 'redirect' && result.checkout_url) {
                const methodLabel = paymentMethod === 'gcash' ? 'GCash' : paymentMethod === 'maya' ? 'Maya' : '3D Secure';
                dispatch(cartClear() as any);

                Alert.alert(
                    `Opening ${methodLabel}`,
                    `You will be redirected to the secure ${methodLabel} gateway to authorize this payment.\n\nOnce complete, check "My Orders" to confirm your payment status.`,
                    [
                        {
                            text: `Open ${methodLabel}`,
                            onPress: () => {
                                Linking.openURL(result.checkout_url!).catch(() => {
                                    Alert.alert('Error', 'Could not open the payment page. Please try again.');
                                });
                                navigation.navigate(SCREENS.ORDERS);
                            },
                        },
                        { text: 'Cancel', style: 'cancel' },
                    ]
                );
                return;
            }

            Alert.alert('Payment Error', 'Unexpected response from payment provider.');

        } catch (err: any) {
            Alert.alert('Error', err?.message || 'Something went wrong. Please try again.');
        } finally {
            setIsPlacing(false);
        }
    };

    // ── Card field handlers ───────────────────────────────────────────────
    const handleCardNumberChange = (text: string): void => {
        const formatted = formatCardNumber(text);
        setCardNumber(formatted);
        if (rawCardNumber(formatted).length === 16) {
            cardExpiryRef.current?.focus();
        }
    };

    const handleExpiryChange = (text: string): void => {
        const formatted = formatExpiry(text);
        setCardExpiry(formatted);
        if (formatted.length === 7) {
            cardCvcRef.current?.focus();
        }
    };

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <View style={styles.container}>
            <DashboardHeader onMenuPress={() => navigation.goBack()} />

            {/* Processing overlay */}
            <Modal transparent visible={isPlacing} animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.overlayCard}>
                        <ActivityIndicator size="large" color="#F59E0B" />
                        <Text style={styles.overlayTitle}>Processing Payment…</Text>
                        <Text style={styles.overlaySubtitle}>Please do not close this screen.</Text>
                    </View>
                </View>
            </Modal>

            {/* Page header */}
            <View style={styles.pageHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>← Cart</Text>
                </TouchableOpacity>
                <Text style={styles.pageTitle}>Checkout</Text>
                <View />
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

                {/* ── Order Summary ─────────────────────────────────────── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📦 Order Summary</Text>
                    {items.map((item: CartItem) => (
                        <View key={item.productId} style={styles.summaryRow}>
                            <Text style={styles.summaryName} numberOfLines={1}>{item.name}</Text>
                            <Text style={styles.summaryMeta}>×{item.quantity}</Text>
                            <Text style={styles.summaryTotal}>₱{(item.price * item.quantity).toFixed(2)}</Text>
                        </View>
                    ))}
                    <View style={styles.divider} />
                    <View style={styles.summaryRow}>
                        <Text style={styles.grandLabel}>Total ({totalItems} item{totalItems !== 1 ? 's' : ''})</Text>
                        <Text style={styles.grandAmount}>₱{totalAmount.toFixed(2)}</Text>
                    </View>
                </View>

                {/* ── Contact Details ───────────────────────────────────── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>👤 Your Details</Text>

                    <Text style={styles.label}>Full Name *</Text>
                    <TextInput
                        style={styles.input}
                        value={customerName}
                        onChangeText={setCustomerName}
                        placeholder="e.g., Juan Dela Cruz"
                        autoCapitalize="words"
                        returnKeyType="next"
                        editable={!isPlacing}
                    />

                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={styles.input}
                        value={customerEmail}
                        onChangeText={setCustomerEmail}
                        placeholder="juan@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        returnKeyType="next"
                        editable={!isPlacing}
                    />

                    <Text style={styles.label}>Mobile Number</Text>
                    <TextInput
                        style={styles.input}
                        value={customerPhone}
                        onChangeText={setCustomerPhone}
                        placeholder="0917XXXXXXX"
                        keyboardType="phone-pad"
                        editable={!isPlacing}
                    />
                </View>

                {/* ── Delivery Details ──────────────────────────────────── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🚚 Delivery Details</Text>

                    <Text style={styles.label}>How would you like to receive your order?</Text>
                    <View style={styles.row}>
                        {(['pickup', 'delivery'] as const).map((opt) => (
                            <TouchableOpacity
                                key={opt}
                                style={[styles.chip, fulfillmentType === opt && styles.chipActive]}
                                onPress={() => setFulfillmentType(opt)}
                                disabled={isPlacing}
                            >
                                <Text style={[styles.chipText, fulfillmentType === opt && styles.chipTextActive]}>
                                    {opt === 'pickup' ? '🏪 Pickup at Store' : '🚚 Deliver to Me'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {fulfillmentType === 'pickup' ? (
                        <View style={styles.infoBox}>
                            <Text style={styles.infoBoxText}>
                                You'll collect your order at our store. We'll notify you when it's ready.
                            </Text>
                        </View>
                    ) : (
                        <>
                            <Text style={styles.label}>Delivery Address *</Text>
                            <TextInput
                                style={[styles.input, styles.inputMulti]}
                                value={deliveryAddress}
                                onChangeText={setDeliveryAddress}
                                placeholder="House/unit no., street, barangay, city, province"
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                                editable={!isPlacing}
                            />
                        </>
                    )}
                </View>

                {/* ── Payment Method ────────────────────────────────────── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>💳 Payment Method</Text>
                    <Text style={styles.label}>Select how you'd like to pay:</Text>

                    <View style={styles.payGrid}>
                        {PAYMENT_OPTIONS.map((opt) => {
                            const label = (opt.value === 'cash' && fulfillmentType === 'pickup' && opt.labelPickup)
                                ? opt.labelPickup
                                : opt.label;
                            const active = paymentMethod === opt.value;
                            return (
                                <TouchableOpacity
                                    key={opt.value}
                                    style={[styles.payChip, active && styles.payChipActive]}
                                    onPress={() => setPaymentMethod(opt.value)}
                                    disabled={isPlacing}
                                >
                                    <Text style={styles.payChipIcon}>{opt.icon}</Text>
                                    <Text style={[styles.payChipLabel, active && styles.payChipLabelActive]} numberOfLines={2}>
                                        {label}
                                    </Text>
                                    {active && <Text style={styles.payChipCheck}>✓</Text>}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* ── Card form ─────────────────────────────────── */}
                    {paymentMethod === 'card' && (
                        <View style={styles.payForm}>
                            <View style={styles.payFormHeader}>
                                <Text style={styles.payFormTitle}>💳 Card Details</Text>
                                <Text style={styles.payFormNote}>Secured via PayMongo / 3DS</Text>
                            </View>

                            <Text style={styles.label}>Cardholder Name</Text>
                            <TextInput
                                style={styles.input}
                                value={cardHolder}
                                onChangeText={setCardHolder}
                                placeholder="e.g., Juan Dela Cruz"
                                autoCapitalize="words"
                                returnKeyType="next"
                                onSubmitEditing={() => cardNumberRef.current?.focus()}
                                editable={!isPlacing}
                            />

                            <Text style={styles.label}>Card Number</Text>
                            <TextInput
                                ref={cardNumberRef}
                                style={styles.input}
                                value={cardNumber}
                                onChangeText={handleCardNumberChange}
                                placeholder="0000 0000 0000 0000"
                                keyboardType="number-pad"
                                returnKeyType="next"
                                maxLength={19}
                                editable={!isPlacing}
                            />
                            {cardNumber.length > 0 && rawCardNumber(cardNumber).length === 16 && !luhnCheck(rawCardNumber(cardNumber)) && (
                                <Text style={styles.fieldError}>Invalid card number</Text>
                            )}

                            <View style={styles.row}>
                                <View style={styles.flex1}>
                                    <Text style={styles.label}>Expiry Date</Text>
                                    <TextInput
                                        ref={cardExpiryRef}
                                        style={styles.input}
                                        value={cardExpiry}
                                        onChangeText={handleExpiryChange}
                                        placeholder="MM / YY"
                                        keyboardType="number-pad"
                                        maxLength={7}
                                        onSubmitEditing={() => cardCvcRef.current?.focus()}
                                        editable={!isPlacing}
                                    />
                                    {cardExpiry.length === 7 && !isExpiryValid(cardExpiry) && (
                                        <Text style={styles.fieldError}>Expired or invalid</Text>
                                    )}
                                </View>

                                <View style={[styles.flex1, styles.ml10]}>
                                    <Text style={styles.label}>CVC / CVV</Text>
                                    <TextInput
                                        ref={cardCvcRef}
                                        style={styles.input}
                                        value={cardCvc}
                                        onChangeText={setCardCvc}
                                        placeholder="123"
                                        keyboardType="number-pad"
                                        secureTextEntry
                                        maxLength={4}
                                        editable={!isPlacing}
                                    />
                                </View>
                            </View>
                        </View>
                    )}

                    {/* ── GCash / Maya form ─────────────────────────── */}
                    {(paymentMethod === 'gcash' || paymentMethod === 'maya') && (
                        <View style={styles.payForm}>
                            <Text style={styles.label}>
                                {paymentMethod === 'gcash' ? 'GCash' : 'Maya'} Mobile Number
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={ewalletNumber}
                                onChangeText={setEwalletNumber}
                                placeholder="0917XXXXXXX"
                                keyboardType="phone-pad"
                                editable={!isPlacing}
                            />
                            {ewalletNumber.length > 0 && !isPhilippineMobile(ewalletNumber) && (
                                <Text style={styles.fieldError}>Must start with 09 or +63 and be 11 digits</Text>
                            )}

                            <View style={styles.ewalletNote}>
                                <Text style={styles.ewalletNoteIcon}>🔒</Text>
                                <Text style={styles.ewalletNoteText}>
                                    You will be redirected to the secure {paymentMethod === 'gcash' ? 'GCash' : 'Maya'} gateway to authorize this transaction with your MPIN.
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

            </ScrollView>

            {/* ── Footer ───────────────────────────────────────────────── */}
            <View style={styles.footer}>
                <View style={styles.footerRow}>
                    <Text style={styles.footerLabel}>Total</Text>
                    <Text style={styles.footerAmount}>₱{totalAmount.toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.placeBtn, isPlacing && styles.placeBtnDisabled]}
                    onPress={handlePlaceOrder}
                    disabled={isPlacing}
                >
                    <Text style={styles.placeBtnText}>
                        {paymentMethod === 'cash'
                            ? (fulfillmentType === 'pickup' ? '🏪 Place Order' : '🚚 Place Order')
                            : paymentMethod === 'gcash'
                                ? '📱 Pay with GCash'
                                : paymentMethod === 'maya'
                                    ? '📲 Pay with Maya'
                                    : '💳 Pay with Card'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

// ── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create<{ [key: string]: ViewStyle | TextStyle }>({
    container: { flex: 1, backgroundColor: '#F3F4F6' },

    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
    emptyIcon: { fontSize: 64, marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 20 },
    emptyBtn: { backgroundColor: '#F59E0B', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 },
    emptyBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },

    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' },
    overlayCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 36, alignItems: 'center', minWidth: 240 },
    overlayTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 16 },
    overlaySubtitle: { fontSize: 13, color: '#6B7280', marginTop: 6, textAlign: 'center' },

    pageHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    backBtn: { padding: 4 },
    backBtnText: { fontSize: 14, color: '#3B82F6', fontWeight: '600' },
    pageTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },

    scroll: { flex: 1 },
    scrollContent: { padding: 16, gap: 14 },

    card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
    cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 14 },

    summaryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    summaryName: { flex: 1, fontSize: 13, color: '#374151' },
    summaryMeta: { fontSize: 13, color: '#9CA3AF', marginHorizontal: 8 },
    summaryTotal: { fontSize: 13, fontWeight: '600', color: '#111827' },
    divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 10 },
    grandLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: '#111827' },
    grandAmount: { fontSize: 18, fontWeight: '800', color: '#047857' },

    label: { fontSize: 13, fontWeight: '600', color: '#4B5563', marginBottom: 6, marginTop: 12 },
    input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1F2937', backgroundColor: '#F9FAFB' },
    inputMulti: { minHeight: 80, textAlignVertical: 'top' },
    fieldError: { fontSize: 11, color: '#DC2626', marginTop: 4 },
    row: { flexDirection: 'row', gap: 10, marginTop: 4 },
    flex1: { flex: 1 },
    ml10: { marginLeft: 10 },

    chip: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#F3F4F6', borderWidth: 2, borderColor: '#E5E7EB', alignItems: 'center' },
    chipActive: { backgroundColor: '#FEF9C3', borderColor: '#F59E0B' },
    chipText: { fontSize: 12, fontWeight: '600', color: '#6B7280', textAlign: 'center' },
    chipTextActive: { color: '#92400E' },

    infoBox: { marginTop: 12, backgroundColor: '#ECFDF5', borderRadius: 10, padding: 12 },
    infoBoxText: { fontSize: 13, color: '#065F46', lineHeight: 18 },

    payGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
    payChip: { width: '47%', flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 10, borderRadius: 12, backgroundColor: '#F3F4F6', borderWidth: 2, borderColor: '#E5E7EB', gap: 8 },
    payChipActive: { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' },
    payChipIcon: { fontSize: 22 },
    payChipLabel: { flex: 1, fontSize: 11, fontWeight: '600', color: '#6B7280' },
    payChipLabelActive: { color: '#1D4ED8' },
    payChipCheck: { fontSize: 14, color: '#2563EB', fontWeight: '700' },

    payForm: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
    payFormHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    payFormTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
    payFormNote: { fontSize: 11, color: '#6B7280' },

    ewalletNote: { flexDirection: 'row', marginTop: 14, backgroundColor: '#EFF6FF', borderRadius: 10, padding: 12, gap: 10, alignItems: 'flex-start' },
    ewalletNoteIcon: { fontSize: 18 },
    ewalletNoteText: { flex: 1, fontSize: 12, color: '#1D4ED8', lineHeight: 18 },

    footer: { backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', padding: 16 },
    footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    footerLabel: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
    footerAmount: { fontSize: 22, fontWeight: '800', color: '#047857' },
    placeBtn: { backgroundColor: '#F59E0B', paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
    placeBtnDisabled: { opacity: 0.5 },
    placeBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});

export default CheckoutScreen;

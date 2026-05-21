import React, { FC, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/reducers';
import * as types from '../app/actions';
import DashboardHeader from '../components/DashboardHeader';
import { getProducts, ProductApiItem } from '../app/api/product';

interface EditOrderScreenProps {
    route: {
        params?: {
            orderId?: number;
            order?: any;
        };
    };
    navigation: any;
}

interface ProductOption {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

const getProductCollection = (payload: any): ProductApiItem[] => {
    if (Array.isArray(payload)) {
        return payload as ProductApiItem[];
    }

    if (Array.isArray(payload?.products)) {
        return payload.products as ProductApiItem[];
    }

    if (Array.isArray(payload?.data)) {
        return payload.data as ProductApiItem[];
    }

    return [];
};

const normalizeProducts = (payload: any): ProductOption[] => {
    return getProductCollection(payload).map((product) => ({
        id: Number(product.id),
        name: product.name || 'Unnamed product',
        price: Number(product.price) || 0,
        quantity: Number(product.quantity) || 0,
    }));
};

const isLockedOrderStatus = (status?: string): boolean => {
    return ['completed', 'delivered'].includes((status || '').toLowerCase());
};

const EditOrderScreen: FC<EditOrderScreenProps> = ({ route, navigation }) => {
    const { orderId } = route.params || {};
    const dispatch = useDispatch();
    const { data: user } = useSelector((state: RootState) => state.auth);
    const { isLoading, error } = useSelector((state: RootState) => state.order);
    const canEditStatus = Boolean(user?.roles?.includes('ROLE_ADMIN'));
    const originalOrder = route.params?.order;
    const isLockedOrder = isLockedOrderStatus(originalOrder?.status);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderNumber, setOrderNumber] = useState<string>('');
    const [productId, setProductId] = useState<string>('');
    const [customerName, setCustomerName] = useState<string>('');
    const [customerEmail, setCustomerEmail] = useState<string>('');
    const [quantity, setQuantity] = useState<string>('');
    const [totalAmount, setTotalAmount] = useState<string>('');
    const [status, setStatus] = useState<string>('Pending');
    const [fulfillmentType, setFulfillmentType] = useState<string>('');
    const [deliveryAddress, setDeliveryAddress] = useState<string>('');
    const [products, setProducts] = useState<ProductOption[]>([]);
    const [productsLoading, setProductsLoading] = useState<boolean>(false);
    const [productLookupError, setProductLookupError] = useState<string | null>(null);
    const statusOptions = ['Pending', 'Processing', 'Completed', 'Cancelled'];
    const selectedProduct = products.find((item) => String(item.id) === productId.trim()) || null;
    const requestedQuantity = Number.parseInt(quantity, 10) || 0;
    const originalProductId = Number(
        originalOrder?.productId ?? originalOrder?.product_id ?? originalOrder?.product?.id ?? 0
    );
    const originalQuantity = Number(originalOrder?.quantity ?? 0) || 0;
    const availableStock = selectedProduct
        ? selectedProduct.id === originalProductId
            ? selectedProduct.quantity + originalQuantity
            : selectedProduct.quantity
        : 0;
    const computedTotalAmount =
        selectedProduct && requestedQuantity > 0
            ? (selectedProduct.price * requestedQuantity).toFixed(2)
            : totalAmount;

    useEffect(() => {
        let isActive = true;

        const loadProducts = async (): Promise<void> => {
            if (!user?.token) {
                return;
            }

            setProductsLoading(true);
            setProductLookupError(null);

            try {
                const response = await getProducts(user.token);

                if (!isActive) {
                    return;
                }

                if (response.ok) {
                    setProducts(normalizeProducts(response.data));
                    return;
                }

                setProductLookupError(response.data?.message || 'Unable to load live stock right now.');
            } catch {
                if (isActive) {
                    setProductLookupError('Unable to load live stock right now.');
                }
            } finally {
                if (isActive) {
                    setProductsLoading(false);
                }
            }
        };

        loadProducts();

        return () => {
            isActive = false;
        };
    }, [user?.token]);

    useEffect(() => {
        if (route.params?.order) {
            const order = route.params.order;
            setOrderNumber(order.orderNumber || order.order_number || '');
            setProductId(String(order.productId || order.product_id || order.product?.id || ''));
            setCustomerName(order.customerName || order.customer_name || '');
            setCustomerEmail(order.customerEmail || order.customer_email || '');
            setQuantity(String(order.quantity ?? ''));
            setTotalAmount(String(order.totalAmount ?? order.total_amount ?? ''));
            setStatus(order.status || 'Pending');
            setFulfillmentType(order.fulfillmentType || order.fulfillment_type || '');
            setDeliveryAddress(order.deliveryAddress || order.delivery_address || '');
        }
    }, [route.params]);

    useEffect(() => {
        if (!isSubmitting || isLoading) {
            return;
        }

        if (error) {
            setIsSubmitting(false);
            Alert.alert('Unable to update order', error);
            return;
        }

        setIsSubmitting(false);
        navigation.goBack();
    }, [error, isLoading, isSubmitting, navigation]);

    const handleUpdateOrder = (): void => {
        if (isLockedOrder) {
            Alert.alert('Order locked', 'Completed orders can no longer be edited.');
            navigation.goBack();
            return;
        }

        if (!selectedProduct) {
            Alert.alert('Validation', 'Please choose a valid product with available stock.');
            return;
        }

        if (requestedQuantity <= 0) {
            Alert.alert('Validation', 'Quantity must be at least 1.');
            return;
        }

        if (requestedQuantity > availableStock) {
            Alert.alert(
                'Not enough stock',
                `You can only set this order to ${availableStock} item(s) with the current stock.`
            );
            return;
        }

        if (
            !productId.trim() ||
            !customerName.trim() ||
            !quantity.trim() ||
            !computedTotalAmount
        ) {
            Alert.alert('Validation', 'Please fill in all required fields');
            return;
        }

        dispatch({
            type: types.UPDATE_ORDER_REQUEST,
            id: orderId,
            payload: {
                orderNumber,
                productId: productId.trim(),
                customerName: customerName.trim(),
                customerEmail: customerEmail.trim(),
                quantity: requestedQuantity,
                totalAmount: parseFloat(computedTotalAmount),
                ...(canEditStatus ? { status } : {}),
            },
            token: user?.token,
        } as any);

        setIsSubmitting(true);
    };

    return (
        <View style={styles.container}>
            <DashboardHeader onMenuPress={() => { }} />
            <ScrollView style={styles.content}>
                {isLockedOrder ? (
                    <View style={styles.lockedCard}>
                        <Text style={styles.lockedTitle}>Order Locked</Text>
                        <Text style={styles.lockedText}>
                            Completed orders can no longer be edited.
                        </Text>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
                            <Text style={styles.cancelBtnText}>Back</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.formCard}>
                        <Text style={styles.formTitle}>✏️ Edit Order</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Order Number</Text>
                            <TextInput
                                style={styles.readOnlyInput}
                                value={orderNumber}
                                editable={false}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Product ID *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter product ID"
                                value={productId}
                                onChangeText={setProductId}
                                editable={!isLoading}
                            />
                            {productsLoading ? (
                                <Text style={styles.helperText}>Loading live stock...</Text>
                            ) : selectedProduct ? (
                                <View style={styles.stockInfoCard}>
                                    <Text style={styles.stockInfoTitle}>{selectedProduct.name}</Text>
                                    <Text style={styles.stockInfoText}>Available for this order: {availableStock}</Text>
                                    <Text style={styles.stockInfoText}>Unit price: ₱{selectedProduct.price.toFixed(2)}</Text>
                                </View>
                            ) : productId.trim() ? (
                                <Text style={styles.errorText}>No matching product found for this ID.</Text>
                            ) : null}
                            {productLookupError ? (
                                <Text style={styles.errorText}>{productLookupError}</Text>
                            ) : null}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Customer Name *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter customer name"
                                value={customerName}
                                onChangeText={setCustomerName}
                                editable={!isLoading}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Customer Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="customer@email.com"
                                value={customerEmail}
                                onChangeText={setCustomerEmail}
                                keyboardType="email-address"
                                editable={!isLoading}
                            />
                        </View>

                        {fulfillmentType ? (
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Fulfillment Type</Text>
                                <View style={[
                                    styles.fulfillmentInfoCard,
                                    fulfillmentType.toLowerCase() === 'delivery'
                                        ? styles.fulfillmentInfoCardDelivery
                                        : styles.fulfillmentInfoCardPickup,
                                ]}>
                                    <Text style={[
                                        styles.fulfillmentInfoText,
                                        fulfillmentType.toLowerCase() === 'delivery'
                                            ? styles.fulfillmentInfoTextDelivery
                                            : styles.fulfillmentInfoTextPickup,
                                    ]}>
                                        {fulfillmentType.toLowerCase() === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}
                                    </Text>
                                </View>
                                {fulfillmentType.toLowerCase() === 'delivery' && deliveryAddress ? (
                                    <View style={styles.deliveryAddressCard}>
                                        <Text style={styles.deliveryAddressLabel}>Delivery Address</Text>
                                        <Text style={styles.deliveryAddressText}>{deliveryAddress}</Text>
                                    </View>
                                ) : null}
                            </View>
                        ) : null}

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Quantity *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="1"
                                value={quantity}
                                onChangeText={setQuantity}
                                keyboardType="number-pad"
                                editable={!isLoading}
                            />
                            {selectedProduct ? (
                                <Text style={styles.helperText}>
                                    Maximum allowed right now: {availableStock} item(s).
                                </Text>
                            ) : null}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Total Amount (₱)</Text>
                            <TextInput
                                style={styles.readOnlyInput}
                                placeholder="0.00"
                                value={computedTotalAmount}
                                keyboardType="decimal-pad"
                                editable={false}
                            />
                        </View>

                        {canEditStatus ? (
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Status</Text>
                                <View style={styles.statusOptionsContainer}>
                                    {statusOptions.map((option) => (
                                        <TouchableOpacity
                                            key={option}
                                            style={[
                                                styles.statusChip,
                                                status === option && styles.statusChipActive,
                                            ]}
                                            onPress={() => setStatus(option)}
                                            disabled={isLoading}
                                        >
                                            <Text
                                                style={[
                                                    styles.statusChipText,
                                                    status === option && styles.statusChipTextActive,
                                                ]}
                                            >
                                                {option}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ) : null}

                        <TouchableOpacity
                            style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
                            onPress={handleUpdateOrder}
                            disabled={isLoading}
                        >
                            <Text style={styles.submitBtnText}>
                                {isLoading ? '⏳ Updating...' : '✅ Update Order'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={() => navigation.goBack()}
                            disabled={isLoading}
                        >
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create<{ [key: string]: ViewStyle | TextStyle }>({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    content: { flex: 1, padding: 16 },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    lockedCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    lockedTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1F2937',
    },
    lockedText: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 22,
        textAlign: 'center',
        marginTop: 12,
    },
    formTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 24,
        textAlign: 'center',
    },
    formGroup: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', color: '#4B5563', marginBottom: 8 },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#1F2937',
        backgroundColor: '#F9FAFB',
    },
    readOnlyInput: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#888',
        backgroundColor: '#F9FAFB',
    },
    helperText: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 8,
        lineHeight: 18,
    },
    errorText: {
        fontSize: 12,
        color: '#B91C1C',
        marginTop: 8,
        lineHeight: 18,
    },
    stockInfoCard: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        padding: 12,
        marginTop: 10,
    },
    stockInfoTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
    },
    stockInfoText: {
        fontSize: 12,
        color: '#4B5563',
        marginTop: 4,
    },
    statusOptionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statusChip: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    statusChipActive: {
        backgroundColor: '#DBEAFE',
        borderColor: '#93C5FD',
    },
    statusChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },
    statusChipTextActive: {
        color: '#1D4ED8',
    },
    fulfillmentInfoCard: {
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    fulfillmentInfoCardPickup: {
        backgroundColor: '#D1FAE5',
    },
    fulfillmentInfoCardDelivery: {
        backgroundColor: '#DBEAFE',
    },
    fulfillmentInfoText: {
        fontSize: 14,
        fontWeight: '700',
    },
    fulfillmentInfoTextPickup: {
        color: '#065F46',
    },
    fulfillmentInfoTextDelivery: {
        color: '#1E40AF',
    },
    deliveryAddressCard: {
        backgroundColor: '#EFF6FF',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    deliveryAddressLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#1E40AF',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        marginBottom: 4,
    },
    deliveryAddressText: {
        fontSize: 13,
        color: '#1E3A8A',
        lineHeight: 18,
    },
    submitBtn: {
        backgroundColor: '#3B82F6',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 24,
    },
    submitBtnDisabled: { opacity: 0.5 },
    submitBtnText: { fontSize: 16, fontWeight: '600', color: 'white' },
    cancelBtn: {
        backgroundColor: '#EF4444',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 8,
    },
    cancelBtnText: { fontSize: 16, fontWeight: '600', color: 'white' },
});

export default EditOrderScreen;

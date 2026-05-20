import React, { FC, useEffect, useState } from 'react';
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
import { useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/reducers';
import * as types from '../app/actions';
import DashboardHeader from '../components/DashboardHeader';
import { getProducts, ProductApiItem } from '../app/api/product';

interface AddOrderScreenProps {
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

const AddOrderScreen: FC<AddOrderScreenProps> = ({ navigation }) => {
    const dispatch = useDispatch();
    const route = useRoute<any>();
    const { data: user } = useSelector((state: RootState) => state.auth);
    const { isLoading, error } = useSelector((state: RootState) => state.order);
    const canEditStatus = Boolean(user?.roles?.includes('ROLE_ADMIN'));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
    const [orderNumber] = useState<string>('ORD-' + Date.now());
    const [productId, setProductId] = useState<string>(route.params?.productId ? String(route.params.productId) : '');
    const [customerName, setCustomerName] = useState<string>('');
    const [customerEmail, setCustomerEmail] = useState<string>('');
    const [quantity, setQuantity] = useState<string>('1');
    const [status, setStatus] = useState<string>('Pending');
    const [fulfillmentType, setFulfillmentType] = useState<'pickup' | 'delivery'>('pickup');
    const [deliveryAddress, setDeliveryAddress] = useState<string>('');
    const [products, setProducts] = useState<ProductOption[]>([]);
    const [productsLoading, setProductsLoading] = useState<boolean>(false);
    const [productLookupError, setProductLookupError] = useState<string | null>(null);
    const statusOptions = ['Pending', 'Processing', 'Completed', 'Cancelled'];
    const selectedProduct = products.find((item) => String(item.id) === productId.trim()) || null;
    const selectedProductName = selectedProduct?.name ?? route.params?.productName ?? '';
    const requestedQuantity = Number.parseInt(quantity, 10) || 0;
    const fallbackUnitPrice = Number(route.params?.unitPrice ?? route.params?.totalAmount ?? 0);
    const unitPrice = selectedProduct?.price ?? fallbackUnitPrice;
    const availableStock = selectedProduct?.quantity ?? Number(route.params?.availableStock ?? 0);
    const computedTotalAmount =
        unitPrice > 0 && requestedQuantity > 0 ? (unitPrice * requestedQuantity).toFixed(2) : '';

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
        if (user?.name && !customerName) {
            setCustomerName(user.name);
        }
        if (user?.email && !customerEmail) {
            setCustomerEmail(user.email);
        }
        if (route.params?.productId) {
            setProductId(String(route.params.productId));
        }
        if (route.params?.productName && !customerName) {
            // keep the selected product visible above the form
        }
    }, [user?.name, user?.email, route.params, customerName, customerEmail]);

    useEffect(() => {
        if (!isSubmitting || isLoading) {
            return;
        }

        if (error) {
            setIsSubmitting(false);
            Alert.alert('Unable to add order', error);
            return;
        }

        setIsSubmitting(false);
        navigation.goBack();
    }, [error, isLoading, isSubmitting, navigation]);

    const handleAddOrder = (): void => {
        if (!selectedProduct) {
            Alert.alert('Validation', 'Please choose a valid product with available stock.');
            return;
        }

        if (requestedQuantity <= 0) {
            Alert.alert('Validation', 'Quantity must be at least 1.');
            return;
        }

        if (availableStock <= 0) {
            Alert.alert('Out of stock', 'This product is currently out of stock.');
            return;
        }

        if (requestedQuantity > availableStock) {
            Alert.alert(
                'Not enough stock',
                `You can only order up to ${availableStock} item(s) for this product right now.`
            );
            return;
        }

        if (
            !customerName.trim() ||
            !quantity.trim() ||
            !computedTotalAmount
        ) {
            Alert.alert('Validation', 'Please fill in all required fields');
            return;
        }

        if (fulfillmentType === 'delivery' && !deliveryAddress.trim()) {
            Alert.alert('Validation', 'Please enter a delivery address.');
            return;
        }

        dispatch({
            type: types.CREATE_ORDER_REQUEST,
            payload: {
                orderNumber,
                productId: String(selectedProduct.id),
                customerName: customerName.trim(),
                customerEmail: customerEmail.trim(),
                quantity: requestedQuantity,
                totalAmount: parseFloat(computedTotalAmount),
                fulfillmentType,
                deliveryAddress: fulfillmentType === 'delivery' ? deliveryAddress.trim() : null,
                ...(canEditStatus ? { status } : {}),
            },
            token: user?.token,
        } as any);

        setIsSubmitting(true);
    };

    const handleSelectProduct = (nextProductId: string): void => {
        setProductId(nextProductId);
        setIsProductDropdownOpen(false);
    };

    return (
        <View style={styles.container}>
            <DashboardHeader onMenuPress={() => { }} />
            <ScrollView style={styles.content}>
                <View style={styles.formCard}>
                    <Text style={styles.formTitle}>➕ Add New Order</Text>
                    {selectedProductName ? (
                        <View style={styles.selectedProductCard}>
                            <Text style={styles.selectedProductLabel}>Selected Product</Text>
                            <Text style={styles.selectedProductName}>{selectedProductName}</Text>
                            <Text style={styles.selectedProductMeta}>
                                {availableStock > 0 ? `${availableStock} in stock` : 'Out of stock'}
                            </Text>
                        </View>
                    ) : null}

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Order Number</Text>
                        <TextInput
                            style={styles.readOnlyInput}
                            value={orderNumber}
                            editable={false}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Product *</Text>
                        {productsLoading ? (
                            <Text style={styles.helperText}>Loading live stock...</Text>
                        ) : products.length > 0 ? (
                            <View style={styles.dropdownContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.dropdownTrigger,
                                        isProductDropdownOpen && styles.dropdownTriggerOpen,
                                    ]}
                                    onPress={() => setIsProductDropdownOpen((current) => !current)}
                                    disabled={isLoading}
                                >
                                    <View style={styles.dropdownTriggerContent}>
                                        <Text
                                            style={[
                                                styles.dropdownTriggerLabel,
                                                !selectedProduct && styles.dropdownPlaceholder,
                                            ]}
                                        >
                                            {selectedProduct
                                                ? selectedProduct.name
                                                : 'Select a product'}
                                        </Text>
                                        {selectedProduct ? (
                                            <Text style={styles.dropdownTriggerMeta}>
                                                {availableStock} in stock • ₱{unitPrice.toFixed(2)}
                                            </Text>
                                        ) : null}
                                    </View>
                                    <Text style={styles.dropdownChevron}>
                                        {isProductDropdownOpen ? '▲' : '▼'}
                                    </Text>
                                </TouchableOpacity>

                                {isProductDropdownOpen ? (
                                    <View style={styles.dropdownMenu}>
                                        <ScrollView
                                            nestedScrollEnabled
                                            style={styles.dropdownMenuScroll}
                                        >
                                            {products.map((product) => {
                                                const isSelected = String(product.id) === productId;
                                                const isDisabled = product.quantity <= 0;

                                                return (
                                                    <TouchableOpacity
                                                        key={product.id}
                                                        style={[
                                                            styles.dropdownOption,
                                                            isSelected && styles.dropdownOptionSelected,
                                                            isDisabled && styles.dropdownOptionDisabled,
                                                        ]}
                                                        onPress={() => handleSelectProduct(String(product.id))}
                                                        disabled={isLoading || isDisabled}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.dropdownOptionLabel,
                                                                isSelected && styles.dropdownOptionLabelSelected,
                                                            ]}
                                                        >
                                                            {product.name}
                                                        </Text>
                                                        <Text
                                                            style={[
                                                                styles.dropdownOptionMeta,
                                                                isSelected && styles.dropdownOptionMetaSelected,
                                                            ]}
                                                        >
                                                            {product.quantity > 0
                                                                ? `${product.quantity} in stock • ₱${product.price.toFixed(2)}`
                                                                : 'Out of stock'}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </ScrollView>
                                    </View>
                                ) : null}
                            </View>
                        ) : (
                            <Text style={styles.helperText}>No products are available right now.</Text>
                        )}
                        {selectedProduct ? (
                            <View style={styles.stockInfoCard}>
                                <Text style={styles.stockInfoTitle}>{selectedProduct.name}</Text>
                                <Text style={styles.stockInfoText}>Available stock: {availableStock}</Text>
                                <Text style={styles.stockInfoText}>Unit price: ₱{unitPrice.toFixed(2)}</Text>
                            </View>
                        ) : (
                            <Text style={styles.helperText}>Choose a product above to continue with this order.</Text>
                        )}
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

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Fulfillment Type *</Text>
                        <View style={styles.fulfillmentRow}>
                            {(['pickup', 'delivery'] as const).map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[
                                        styles.fulfillmentChip,
                                        fulfillmentType === option && styles.fulfillmentChipActive,
                                    ]}
                                    onPress={() => setFulfillmentType(option)}
                                    disabled={isLoading}
                                >
                                    <Text style={[
                                        styles.fulfillmentChipText,
                                        fulfillmentType === option && styles.fulfillmentChipTextActive,
                                    ]}>
                                        {option === 'pickup' ? '🏪 Pickup' : '🚚 Delivery'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {fulfillmentType === 'delivery' ? (
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Delivery Address *</Text>
                            <TextInput
                                style={[styles.input, styles.addressInput]}
                                placeholder="Enter full delivery address"
                                value={deliveryAddress}
                                onChangeText={setDeliveryAddress}
                                multiline
                                numberOfLines={3}
                                editable={!isLoading}
                            />
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
                                You can order up to {availableStock} item(s) right now.
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
                                {statusOptions.map(option => (
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
                        onPress={handleAddOrder}
                        disabled={isLoading}
                    >
                        <Text style={styles.submitBtnText}>
                            {isLoading ? '⏳ Adding...' : '✅ Add Order'}
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
    formTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 24,
        textAlign: 'center',
    },
    selectedProductCard: {
        backgroundColor: '#EFF6FF',
        borderRadius: 12,
        padding: 14,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    selectedProductLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1D4ED8',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    selectedProductName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E3A8A',
    },
    selectedProductMeta: {
        fontSize: 12,
        color: '#2563EB',
        marginTop: 6,
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
    dropdownContainer: {
        position: 'relative',
    },
    dropdownTrigger: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 12,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dropdownTriggerOpen: {
        borderColor: '#93C5FD',
        backgroundColor: '#EFF6FF',
    },
    dropdownTriggerContent: {
        flex: 1,
        paddingRight: 12,
    },
    dropdownTriggerLabel: {
        fontSize: 14,
        color: '#1F2937',
    },
    dropdownPlaceholder: {
        color: '#6B7280',
    },
    dropdownTriggerMeta: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    dropdownChevron: {
        fontSize: 12,
        color: '#4B5563',
        fontWeight: '700',
    },
    dropdownMenu: {
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
    },
    dropdownMenuScroll: {
        maxHeight: 240,
    },
    dropdownOption: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    dropdownOptionSelected: {
        backgroundColor: '#EFF6FF',
    },
    dropdownOptionDisabled: {
        opacity: 0.5,
    },
    dropdownOptionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    dropdownOptionLabelSelected: {
        color: '#1D4ED8',
    },
    dropdownOptionMeta: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    dropdownOptionMetaSelected: {
        color: '#2563EB',
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
    fulfillmentRow: {
        flexDirection: 'row',
        gap: 10,
    },
    fulfillmentChip: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
    },
    fulfillmentChipActive: {
        backgroundColor: '#FEF3C7',
        borderColor: '#F59E0B',
    },
    fulfillmentChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    fulfillmentChipTextActive: {
        color: '#92400E',
    },
    addressInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    submitBtn: {
        backgroundColor: '#10B981',
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

export default AddOrderScreen;

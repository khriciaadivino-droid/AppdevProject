import React, { FC } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    ViewStyle,
    TextStyle,
    ImageStyle,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/reducers';
import { cartRemoveItem, cartUpdateQuantity, cartClear, CartItem } from '../app/reducers/cart';
import DashboardHeader from '../components/DashboardHeader';
import { SCREENS } from '../utils/routes';
import { API_BASE_URL } from '../app/api/config';

interface CartScreenProps {
    navigation: any;
}

const CartScreen: FC<CartScreenProps> = ({ navigation }) => {
    const dispatch = useDispatch();
    const items = useSelector((state: RootState) => state.cart.items);

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    const handleRemove = (productId: number): void => {
        dispatch(cartRemoveItem(productId) as any);
    };

    const handleQtyChange = (productId: number, delta: number, current: number, max: number): void => {
        const next = current + delta;
        if (next < 1) {
            dispatch(cartRemoveItem(productId) as any);
        } else {
            dispatch(cartUpdateQuantity(productId, Math.min(next, max)) as any);
        }
    };

    const handleClearCart = (): void => {
        dispatch(cartClear() as any);
    };

    if (items.length === 0) {
        return (
            <View style={styles.container}>
                <DashboardHeader onMenuPress={() => navigation.goBack()} />
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>🛒</Text>
                    <Text style={styles.emptyTitle}>Your cart is empty</Text>
                    <Text style={styles.emptySubtitle}>Browse products and add items to your cart.</Text>
                    <TouchableOpacity
                        style={styles.browseBtn}
                        onPress={() => navigation.navigate(SCREENS.PRODUCTS)}
                    >
                        <Text style={styles.browseBtnText}>Browse Products</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <DashboardHeader onMenuPress={() => navigation.goBack()} />

            <View style={styles.pageHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.pageTitle}>My Cart ({totalItems} item{totalItems !== 1 ? 's' : ''})</Text>
                <TouchableOpacity onPress={handleClearCart}>
                    <Text style={styles.clearText}>Clear all</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
                {items.map((item: CartItem) => {
                    const imageUrl = item.image
                        ? item.image.startsWith('http')
                            ? item.image
                            : `${API_BASE_URL}/uploads/products/${item.image}`
                        : null;

                    return (
                        <View key={item.productId} style={styles.cartCard}>
                            {imageUrl ? (
                                <Image source={{ uri: imageUrl }} style={styles.productThumb as ImageStyle} resizeMode="cover" />
                            ) : (
                                <View style={styles.productThumbFallback}>
                                    <Text style={styles.productThumbEmoji}>📦</Text>
                                </View>
                            )}

                            <View style={styles.cardBody}>
                                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                                <Text style={styles.productPrice}>₱{item.price.toFixed(2)} each</Text>
                                <Text style={styles.itemSubtotal}>
                                    Subtotal: ₱{(item.price * item.quantity).toFixed(2)}
                                </Text>

                                <View style={styles.qtyRow}>
                                    <TouchableOpacity
                                        style={styles.qtyBtn}
                                        onPress={() => handleQtyChange(item.productId, -1, item.quantity, item.maxStock)}
                                    >
                                        <Text style={styles.qtyBtnText}>−</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.qtyValue}>{item.quantity}</Text>
                                    <TouchableOpacity
                                        style={[styles.qtyBtn, item.quantity >= item.maxStock && styles.qtyBtnDisabled]}
                                        onPress={() => handleQtyChange(item.productId, 1, item.quantity, item.maxStock)}
                                        disabled={item.quantity >= item.maxStock}
                                    >
                                        <Text style={styles.qtyBtnText}>+</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.stockHint}>of {item.maxStock} in stock</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.removeBtn}
                                onPress={() => handleRemove(item.productId)}
                            >
                                <Text style={styles.removeBtnText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total ({totalItems} item{totalItems !== 1 ? 's' : ''})</Text>
                    <Text style={styles.totalAmount}>₱{totalAmount.toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                    style={styles.checkoutBtn}
                    onPress={() => navigation.navigate(SCREENS.CHECKOUT)}
                >
                    <Text style={styles.checkoutBtnText}>Proceed to Checkout →</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create<{ [key: string]: ViewStyle | TextStyle | ImageStyle }>({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    emptyIcon: { fontSize: 64, marginBottom: 16 },
    emptyTitle: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24 },
    browseBtn: {
        backgroundColor: '#F59E0B',
        paddingHorizontal: 28,
        paddingVertical: 12,
        borderRadius: 12,
    },
    browseBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
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
    pageTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
    clearText: { fontSize: 13, color: '#EF4444', fontWeight: '600' },
    list: { flex: 1 },
    listContent: { padding: 16, gap: 12 },
    cartCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    productThumb: {
        width: 72,
        height: 72,
        borderRadius: 10,
        marginRight: 12,
    },
    productThumbFallback: {
        width: 72,
        height: 72,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    productThumbEmoji: { fontSize: 28 },
    cardBody: { flex: 1 },
    productName: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
    productPrice: { fontSize: 13, color: '#6B7280', marginBottom: 2 },
    itemSubtotal: { fontSize: 13, fontWeight: '600', color: '#047857', marginBottom: 10 },
    qtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    qtyBtn: {
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    qtyBtnDisabled: { opacity: 0.4 },
    qtyBtnText: { fontSize: 18, fontWeight: '700', color: '#374151' },
    qtyValue: { fontSize: 16, fontWeight: '700', color: '#111827', minWidth: 24, textAlign: 'center' },
    stockHint: { fontSize: 11, color: '#9CA3AF' },
    removeBtn: {
        padding: 6,
        marginLeft: 8,
    },
    removeBtnText: { fontSize: 16, color: '#9CA3AF' },
    footer: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        padding: 16,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    totalLabel: { fontSize: 15, fontWeight: '600', color: '#374151' },
    totalAmount: { fontSize: 22, fontWeight: '800', color: '#047857' },
    checkoutBtn: {
        backgroundColor: '#F59E0B',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    checkoutBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});

export default CartScreen;

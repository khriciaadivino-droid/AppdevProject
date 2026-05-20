import React, { FC, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Image,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/reducers/index';
import { userLogout } from '../app/reducers/auth';
import { cartAddItem } from '../app/reducers/cart';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import { getProducts, ProductApiItem } from '../app/api/product';
import { getOrders } from '../app/api/order';
import { getPets } from '../app/api/pet';
import { API_BASE_URL } from '../app/api/config';
import { SCREENS } from '../utils/routes';

interface DashboardSummary {
    totalPetProfiles: number;
    totalOrders: number;
    totalProducts: number;
    totalStocks: number;
}

interface DashboardProduct {
    id: number;
    name: string;
    description: string;
    price: number;
    quantity: number;
    category: string;
    image: string | null;
}

interface SummaryCardProps {
    icon: string;
    label: string;
    value: number;
    accent: string;
}

interface QuickActionProps {
    icon: string;
    label: string;
    hint: string;
    onPress: () => void;
}

interface ProductRowProps {
    product: DashboardProduct;
    onAddToCart: (product: DashboardProduct) => void;
}

const EMPTY_SUMMARY: DashboardSummary = {
    totalPetProfiles: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalStocks: 0,
};

const getCollection = <T,>(payload: any, key: string): T[] => {
    if (Array.isArray(payload)) {
        return payload as T[];
    }

    if (Array.isArray(payload?.[key])) {
        return payload[key] as T[];
    }

    if (Array.isArray(payload?.data)) {
        return payload.data as T[];
    }

    return [];
};

const normalizeProducts = (payload: any): DashboardProduct[] => {
    const rawItems = getCollection<ProductApiItem>(payload, 'products');

    return rawItems.map((item) => ({
        id: Number(item.id),
        name: item.name || 'Unnamed product',
        description: item.description || 'No description available.',
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 0,
        category:
            typeof item.category === 'string'
                ? item.category
                : item.category?.name || 'Uncategorized',
        image: item.imagefilename || item.image || null,
    }));
};

const getFirstName = (name?: string, email?: string): string => {
    if (name && name.trim()) {
        return name.trim().split(' ')[0];
    }

    if (email) {
        return email.split('@')[0];
    }

    return 'there';
};

const SummaryCard: FC<SummaryCardProps> = ({ icon, label, value, accent }) => (
    <View style={styles.summaryCard}>
        <View style={[styles.summaryIconWrap, { backgroundColor: accent }]}>
            <Text style={styles.summaryIcon}>{icon}</Text>
        </View>
        <Text style={styles.summaryValue}>{value}</Text>
        <Text style={styles.summaryLabel}>{label}</Text>
    </View>
);

const QuickAction: FC<QuickActionProps> = ({ icon, label, hint, onPress }) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress} activeOpacity={0.88}>
        <Text style={styles.quickActionIcon}>{icon}</Text>
        <Text style={styles.quickActionLabel}>{label}</Text>
        <Text style={styles.quickActionHint}>{hint}</Text>
    </TouchableOpacity>
);

const ProductRow: FC<ProductRowProps> = ({ product, onAddToCart }) => {
    const imageUrl = product.image
        ? product.image.startsWith('http')
            ? product.image
            : `${API_BASE_URL}/uploads/products/${product.image}`
        : null;

    return (
        <View style={styles.productRow}>
            {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.productThumb} resizeMode="cover" />
            ) : (
                <View style={styles.productThumbFallback}>
                    <Text style={styles.productThumbEmoji}>📦</Text>
                </View>
            )}

            <View style={styles.productInfo}>
                <Text style={styles.productCategory}>{product.category}</Text>
                <Text style={styles.productName} numberOfLines={1}>
                    {product.name}
                </Text>
                <Text style={styles.productMeta} numberOfLines={1}>
                    ₱{product.price.toFixed(2)} · {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                </Text>
            </View>

            <TouchableOpacity
                style={[
                    styles.orderButton,
                    product.quantity <= 0 && styles.orderButtonDisabled,
                ]}
                onPress={() => onAddToCart(product)}
                disabled={product.quantity <= 0}
            >
                <Text style={styles.orderButtonText}>
                    {product.quantity > 0 ? '🛒 Add to Cart' : 'Sold Out'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

type DashboardUserContentProps = {
    navigation: any;
};

const DashboardUserContent: FC<DashboardUserContentProps> = ({ navigation }) => {
    const dispatch = useDispatch();
    const isFocused = useIsFocused();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [summary, setSummary] = useState<DashboardSummary>(EMPTY_SUMMARY);
    const [products, setProducts] = useState<DashboardProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshNonce, setRefreshNonce] = useState(0);
    const { data: user, isLoading: authLoading } = useSelector((state: RootState) => state.auth);
    const canSeeStockTotals = Boolean(
        user?.roles?.some((role) => role === 'ROLE_ADMIN' || role === 'ROLE_STAFF')
    );

    useEffect(() => {
        if (!isFocused) {
            return undefined;
        }

        let isActive = true;

        const loadDashboard = async (): Promise<void> => {
            if (!user?.token) {
                if (isActive) {
                    setSummary(EMPTY_SUMMARY);
                    setProducts([]);
                    setError('Please sign in again to load your dashboard.');
                    setLoading(false);
                }
                return;
            }

            if (isActive) {
                setLoading(true);
                setError(null);
            }

            try {
                const [productResponse, orderResponse, petResponse] = await Promise.all([
                    getProducts(user.token),
                    getOrders(user.token),
                    getPets(user.token),
                ]);

                if (!isActive) {
                    return;
                }

                const normalizedProducts = productResponse.ok
                    ? normalizeProducts(productResponse.data)
                    : [];
                const orderItems = orderResponse.ok ? getCollection(orderResponse.data, 'orders') : [];
                const petItems = petResponse.ok ? getCollection(petResponse.data, 'pets') : [];
                const failedSections = [
                    !productResponse.ok ? 'products' : null,
                    !orderResponse.ok ? 'orders' : null,
                    !petResponse.ok ? 'pets' : null,
                ].filter(Boolean) as string[];

                setSummary({
                    totalPetProfiles: petItems.length,
                    totalOrders: orderItems.length,
                    totalProducts: normalizedProducts.length,
                    totalStocks: normalizedProducts.reduce(
                        (total, product) => total + (Number(product.quantity) || 0),
                        0
                    ),
                });
                setProducts(normalizedProducts.slice(0, 4));

                if (failedSections.length > 0) {
                    setError(`Some sections could not refresh: ${failedSections.join(', ')}.`);
                }
            } catch {
                if (isActive) {
                    setSummary(EMPTY_SUMMARY);
                    setProducts([]);
                    setError('Unable to reach your backend right now.');
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        loadDashboard();

        return () => {
            isActive = false;
        };
    }, [isFocused, user?.token, refreshNonce]);

    const triggerRefresh = (): void => {
        setRefreshNonce((current) => current + 1);
    };

    const handleLogout = (): void => {
        setSidebarOpen(false);
        dispatch(userLogout());
    };

    const handleAddToCart = (product: DashboardProduct): void => {
        dispatch(cartAddItem({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            maxStock: product.quantity,
            image: product.image,
        }) as any);
        navigation.navigate(SCREENS.CART as never);
    };

    const quickActions = [
        {
            icon: '➕',
            label: 'Add Pet',
            hint: 'Create a new pet profile',
            onPress: () => navigation.navigate(SCREENS.ADD_PET),
        },
        {
            icon: '📋',
            label: 'Orders',
            hint: 'Review your submitted orders',
            onPress: () => navigation.navigate(SCREENS.ORDERS),
        },
        {
            icon: '🐾',
            label: 'My Pets',
            hint: 'See and edit pet profiles',
            onPress: () => navigation.navigate(SCREENS.PET_PROFILES),
        },
        {
            icon: '👤',
            label: 'Profile',
            hint: 'Open account settings',
            onPress: () => navigation.navigate(SCREENS.PROFILE),
        },
    ];

    const backendStatus = loading
        ? 'Syncing with backend...'
        : error
            ? 'Backend needs attention'
            : 'Live backend connected';

    return (
        <View style={styles.container}>
            <DashboardHeader onMenuPress={() => setSidebarOpen(true)} />
            <DashboardSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                stats={summary}
            />

            <ScrollView style={styles.mainContent} contentContainerStyle={styles.contentContainer}>
                <View style={styles.heroCard}>
                    <View style={styles.heroHeader}>
                        <View>
                            <Text style={styles.heroTitle}>
                                Hello, {getFirstName(user?.name, user?.email)}
                            </Text>
                            <Text style={styles.heroSubtitle}>
                                Your dashboard is now focused on live backend data.
                            </Text>
                        </View>
                        <View style={[styles.statusBadge, error ? styles.statusBadgeWarning : styles.statusBadgeLive]}>
                            <Text style={[styles.statusBadgeText, error ? styles.statusBadgeTextWarning : styles.statusBadgeTextLive]}>
                                {backendStatus}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.heroEmail}>{user?.email}</Text>
                </View>

                <View style={styles.summaryGrid}>
                    <SummaryCard icon="🐾" label="Pet Profiles" value={summary.totalPetProfiles} accent="#DBEAFE" />
                    <SummaryCard icon="📋" label="Orders" value={summary.totalOrders} accent="#EDE9FE" />
                    <SummaryCard icon="📦" label="Products" value={summary.totalProducts} accent="#DCFCE7" />
                    {canSeeStockTotals ? (
                        <SummaryCard icon="📊" label="Stock" value={summary.totalStocks} accent="#FEF3C7" />
                    ) : null}
                </View>

                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={styles.sectionTitle}>Quick Actions</Text>
                            <Text style={styles.sectionSubtitle}>Everything here routes to working backend-connected screens.</Text>
                        </View>
                    </View>

                    <View style={styles.quickActionsGrid}>
                        {quickActions.map((action) => (
                            <QuickAction
                                key={action.label}
                                icon={action.icon}
                                label={action.label}
                                hint={action.hint}
                                onPress={action.onPress}
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={styles.sectionTitle}>Available Products</Text>
                            <Text style={styles.sectionSubtitle}>Fresh from your backend catalog.</Text>
                        </View>

                        <TouchableOpacity style={styles.secondaryButton} onPress={triggerRefresh}>
                            <Text style={styles.secondaryButtonText}>Refresh</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingState}>
                            <ActivityIndicator size="large" color="#2563EB" />
                            <Text style={styles.loadingText}>Refreshing dashboard...</Text>
                        </View>
                    ) : products.length > 0 ? (
                        <View style={styles.productList}>
                            {products.map((product) => (
                                <ProductRow key={product.id} product={product} onAddToCart={handleAddToCart} />
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyStateCard}>
                            <Text style={styles.emptyStateTitle}>No products available yet</Text>
                            <Text style={styles.emptyStateText}>
                                Once products are added on the backend, they will appear here automatically.
                            </Text>
                        </View>
                    )}

                    {error && (
                        <View style={styles.errorBanner}>
                            <Text style={styles.errorBannerText}>{error}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.accountCard}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <View style={styles.accountRow}>
                        <Text style={styles.accountLabel}>Name</Text>
                        <Text style={styles.accountValue}>{user?.name || 'Not set'}</Text>
                    </View>
                    <View style={styles.accountRow}>
                        <Text style={styles.accountLabel}>Email</Text>
                        <Text style={styles.accountValue}>{user?.email || 'Not available'}</Text>
                    </View>

                    <View style={styles.accountActions}>
                        <TouchableOpacity
                            style={styles.secondaryAction}
                            onPress={() => navigation.navigate(SCREENS.PROFILE)}
                        >
                            <Text style={styles.secondaryActionText}>Open Profile</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.logoutButton}
                            onPress={handleLogout}
                            disabled={authLoading}
                        >
                            <Text style={styles.logoutText}>
                                {authLoading ? 'Signing out...' : 'Logout'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const DashboardUserScreen: FC<any> = ({ navigation }) => {
    return <DashboardUserContent navigation={navigation} />;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    mainContent: {
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
    heroHeader: {
        gap: 12,
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
    heroEmail: {
        fontSize: 13,
        color: '#9CA3AF',
        marginTop: 14,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginTop: 16,
    },
    statusBadgeLive: {
        backgroundColor: '#DCFCE7',
    },
    statusBadgeWarning: {
        backgroundColor: '#FEF3C7',
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    statusBadgeTextLive: {
        color: '#166534',
    },
    statusBadgeTextWarning: {
        color: '#92400E',
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
    summaryIconWrap: {
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
    },
    summaryIcon: {
        fontSize: 20,
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
    },
    summaryLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 4,
    },
    sectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 16,
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
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
        lineHeight: 18,
    },
    secondaryButton: {
        backgroundColor: '#EEF2FF',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 9,
    },
    secondaryButtonText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4338CA',
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    quickActionCard: {
        width: '48%',
        backgroundColor: '#F9FAFB',
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
    },
    quickActionIcon: {
        fontSize: 24,
        marginBottom: 10,
    },
    quickActionLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
    },
    quickActionHint: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
        lineHeight: 17,
    },
    loadingState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 24,
    },
    loadingText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 12,
    },
    productList: {
        gap: 12,
    },
    productRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 14,
        backgroundColor: '#F9FAFB',
    },
    productThumb: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: '#E5E7EB',
        marginRight: 12,
    },
    productThumbFallback: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    productThumbEmoji: {
        fontSize: 24,
    },
    productInfo: {
        flex: 1,
    },
    productCategory: {
        fontSize: 10,
        fontWeight: '700',
        color: '#4F46E5',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    productName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
    },
    productMeta: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    orderButton: {
        backgroundColor: '#111827',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginLeft: 12,
    },
    orderButtonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    orderButtonText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#FFFFFF',
        textTransform: 'uppercase',
    },
    emptyStateCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 14,
        padding: 18,
        alignItems: 'center',
    },
    emptyStateTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
    },
    emptyStateText: {
        fontSize: 13,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 19,
        marginTop: 6,
    },
    errorBanner: {
        backgroundColor: '#FEF3C7',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginTop: 14,
    },
    errorBannerText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#92400E',
        lineHeight: 18,
    },
    accountCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 16,
    },
    accountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    accountLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#374151',
    },
    accountValue: {
        fontSize: 13,
        color: '#6B7280',
        flex: 1,
        textAlign: 'right',
        marginLeft: 16,
    },
    accountActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 16,
    },
    secondaryAction: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        paddingVertical: 13,
        alignItems: 'center',
    },
    secondaryActionText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#374151',
    },
    logoutButton: {
        flex: 1,
        backgroundColor: '#DC2626',
        borderRadius: 12,
        paddingVertical: 13,
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#FFFFFF',
    },
});

export default DashboardUserScreen;

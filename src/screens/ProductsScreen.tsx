import React, { FC, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import { getProducts, ProductApiItem } from '../app/api/product';
import { API_BASE_URL } from '../app/api/config';
import { RootState } from '../app/reducers';
import { cartAddItem } from '../app/reducers/cart';
import { SCREENS } from '../utils/routes';

interface ProductsScreenProps {
    navigation: any;
}

interface ProductCardItem {
    id: number;
    name: string;
    description: string;
    price: number;
    quantity: number;
    category: string;
    image: string | null;
}

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

const normalizeProducts = (payload: any): ProductCardItem[] => {
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
        image: item.imageUrl || item.imagefilename || item.image || null,
    }));
};

const ProductsScreen: FC<ProductsScreenProps> = ({ navigation }) => {
    const dispatch = useDispatch();
    const isFocused = useIsFocused();
    const { data: user } = useSelector((state: RootState) => state.auth);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [products, setProducts] = useState<ProductCardItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshNonce, setRefreshNonce] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

    const categoryOptions = [
        'All Categories',
        ...Array.from(
            new Set(
                products
                    .map((product) => product.category?.trim() || 'Uncategorized')
                    .filter(Boolean)
            )
        ).sort((left, right) => left.localeCompare(right)),
    ];
    const activeCategory = categoryOptions.includes(selectedCategory)
        ? selectedCategory
        : 'All Categories';
    const filteredProducts = activeCategory === 'All Categories'
        ? products
        : products.filter((product) => product.category === activeCategory);

    useEffect(() => {
        if (!isFocused) {
            return undefined;
        }

        let isActive = true;

        const loadProducts = async (): Promise<void> => {
            if (!user?.token) {
                if (isActive) {
                    setProducts([]);
                    setError('Please sign in again to load products.');
                    setLoading(false);
                }
                return;
            }

            if (isActive) {
                setLoading(true);
                setError(null);
            }

            try {
                const response = await getProducts(user.token);

                if (!isActive) {
                    return;
                }

                if (!response.ok) {
                    setProducts([]);
                    setError('Unable to load products from the backend.');
                    return;
                }

                const availableProducts = normalizeProducts(response.data)
                    .filter((product) => product.quantity > 0)
                    .sort((left, right) => left.name.localeCompare(right.name));

                setProducts(availableProducts);
            } catch {
                if (isActive) {
                    setProducts([]);
                    setError('Unable to reach your backend right now.');
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        loadProducts();

        return () => {
            isActive = false;
        };
    }, [isFocused, refreshNonce, user?.token]);

    useEffect(() => {
        if (!categoryOptions.includes(selectedCategory)) {
            setSelectedCategory('All Categories');
        }
    }, [categoryOptions, selectedCategory]);

    const handleAddToCart = (product: ProductCardItem): void => {
        dispatch(cartAddItem({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            maxStock: product.quantity,
            image: product.image,
        }) as any);
        navigation.navigate(SCREENS.CART);
    };

    return (
        <View style={styles.container}>
            <DashboardHeader onMenuPress={() => setSidebarOpen(true)} />
            <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <View style={styles.pageHeader}>
                <View style={styles.pageHeaderTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                        <Text style={styles.headerButtonText}>← Back</Text>
                    </TouchableOpacity>

                    <View style={styles.pageTitleWrap}>
                        <Text style={styles.pageTitle}>Available Products</Text>
                        <Text style={styles.pageSubtitle}>
                            {filteredProducts.length} item{filteredProducts.length === 1 ? '' : 's'} in stock
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => {
                            setRefreshNonce((current) => current + 1);
                            setIsCategoryMenuOpen(false);
                        }}
                        style={styles.headerButton}
                    >
                        <Text style={styles.headerButtonText}>Refresh</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.filterRow}>
                    <Text style={styles.filterLabel}>Category</Text>
                    <TouchableOpacity
                        style={styles.categoryTrigger}
                        onPress={() => setIsCategoryMenuOpen((current) => !current)}
                        activeOpacity={0.88}
                    >
                        <View>
                            <Text style={styles.categoryTriggerCaption}>Filter products</Text>
                            <Text style={styles.categoryTriggerText}>{activeCategory}</Text>
                        </View>
                        <Text style={styles.categoryTriggerChevron}>
                            {isCategoryMenuOpen ? '▲' : '▼'}
                        </Text>
                    </TouchableOpacity>

                    {isCategoryMenuOpen ? (
                        <View style={styles.categoryMenu}>
                            {categoryOptions.map((category, index) => {
                                const isSelected = category === activeCategory;

                                return (
                                    <TouchableOpacity
                                        key={category}
                                        style={[
                                            styles.categoryOption,
                                            index === categoryOptions.length - 1 && styles.categoryOptionLast,
                                            isSelected && styles.categoryOptionSelected,
                                        ]}
                                        onPress={() => {
                                            setSelectedCategory(category);
                                            setIsCategoryMenuOpen(false);
                                        }}
                                        activeOpacity={0.88}
                                    >
                                        <Text
                                            style={[
                                                styles.categoryOptionText,
                                                isSelected && styles.categoryOptionTextSelected,
                                            ]}
                                        >
                                            {category}
                                        </Text>
                                        {isSelected ? (
                                            <Text style={styles.categoryOptionCheck}>✓</Text>
                                        ) : null}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ) : null}
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingState}>
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text style={styles.loadingText}>Loading products...</Text>
                </View>
            ) : (
                <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
                    {filteredProducts.map((product) => {
                        const imageUrl = product.image
                            ? product.image.startsWith('http')
                                ? product.image
                                : `${API_BASE_URL}/uploads/products/${product.image}`
                            : null;

                        return (
                            <View key={product.id} style={styles.card}>
                                {imageUrl ? (
                                    <Image source={{ uri: imageUrl }} style={styles.cardImage} resizeMode="cover" />
                                ) : (
                                    <View style={styles.cardImageFallback}>
                                        <Text style={styles.cardImageEmoji}>📦</Text>
                                    </View>
                                )}

                                <View style={styles.cardBody}>
                                    <Text style={styles.category}>{product.category}</Text>
                                    <Text style={styles.name}>{product.name}</Text>
                                    <Text style={styles.description} numberOfLines={3}>
                                        {product.description}
                                    </Text>

                                    <View style={styles.metaRow}>
                                        <Text style={styles.price}>₱{product.price.toFixed(2)}</Text>
                                        <Text style={styles.stock}>{product.quantity} in stock</Text>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.addButton}
                                        onPress={() => handleAddToCart(product)}
                                    >
                                        <Text style={styles.addButtonText}>Add to Cart</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}

                    {!loading && filteredProducts.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyTitle}>No products found in this category</Text>
                            <Text style={styles.emptyText}>
                                Try another category or add new stock in the backend to make products appear here.
                            </Text>
                        </View>
                    ) : null}

                    {error ? (
                        <View style={styles.errorBanner}>
                            <Text style={styles.errorBannerText}>{error}</Text>
                        </View>
                    ) : null}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    pageHeader: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    pageHeaderTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    pageTitleWrap: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    pageTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
    },
    pageSubtitle: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    headerButton: {
        minWidth: 78,
        minHeight: 40,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerButtonText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4338CA',
    },
    filterRow: {
        marginTop: 12,
    },
    filterLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6B7280',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    categoryTrigger: {
        minHeight: 54,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    categoryTriggerCaption: {
        fontSize: 11,
        fontWeight: '700',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    categoryTriggerText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
        marginTop: 4,
    },
    categoryTriggerChevron: {
        fontSize: 14,
        fontWeight: '800',
        color: '#4338CA',
    },
    categoryMenu: {
        marginTop: 8,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
    },
    categoryOption: {
        minHeight: 48,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    categoryOptionLast: {
        borderBottomWidth: 0,
    },
    categoryOptionSelected: {
        backgroundColor: '#EEF2FF',
    },
    categoryOptionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        flex: 1,
    },
    categoryOptionTextSelected: {
        color: '#4338CA',
    },
    categoryOptionCheck: {
        fontSize: 14,
        fontWeight: '800',
        color: '#4338CA',
    },
    loadingState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: '#6B7280',
    },
    list: {
        flex: 1,
    },
    listContent: {
        padding: 16,
        gap: 14,
        paddingBottom: 28,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    cardImage: {
        width: '100%',
        aspectRatio: 1.5,
        backgroundColor: '#E5E7EB',
    },
    cardImageFallback: {
        width: '100%',
        aspectRatio: 1.5,
        backgroundColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardImageEmoji: {
        fontSize: 44,
    },
    cardBody: {
        padding: 16,
    },
    category: {
        fontSize: 11,
        fontWeight: '700',
        color: '#2563EB',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    name: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
    },
    description: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 18,
        marginTop: 8,
        minHeight: 54,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 14,
        gap: 10,
    },
    price: {
        fontSize: 20,
        fontWeight: '800',
        color: '#047857',
    },
    stock: {
        fontSize: 12,
        fontWeight: '700',
        color: '#374151',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        minWidth: 96,
        textAlign: 'center',
    },
    addButton: {
        marginTop: 16,
        backgroundColor: '#F59E0B',
        borderRadius: 12,
        minHeight: 46,
        paddingVertical: 13,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    emptyState: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 20,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
    },
    emptyText: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 18,
        marginTop: 8,
        textAlign: 'center',
    },
    errorBanner: {
        backgroundColor: '#FEF2F2',
        borderRadius: 14,
        padding: 14,
    },
    errorBannerText: {
        fontSize: 13,
        color: '#B91C1C',
        fontWeight: '600',
    },
});

export default ProductsScreen;
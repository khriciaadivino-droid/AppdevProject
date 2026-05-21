import React, { FC, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../app/reducers';
import { extractNotifications, getNotifications } from '../app/api/notification';
import { SCREENS } from '../utils/routes';

// Type definitions
interface SearchItem {
    name: string;
    icon: string;
    route: string;
}

interface DashboardHeaderProps {
    onMenuPress: () => void;
}

// Component
const DashboardHeader: FC<DashboardHeaderProps> = ({ onMenuPress }) => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showSearch, setShowSearch] = useState<boolean>(false);
    const [notificationCount, setNotificationCount] = useState<number>(0);
    const navigation = useNavigation<any>();
    const isFocused = useIsFocused();
    const { data: user } = useSelector((state: RootState) => state.auth);
    const cartItems = useSelector((state: RootState) => state.cart.items);
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const searchItems: SearchItem[] = [
        { name: 'Pet Profiles', icon: '🐾', route: 'PetProfiles' },
        { name: 'My Pets', icon: '👤', route: 'PetProfiles' },
        { name: 'Products', icon: '📦', route: SCREENS.PRODUCTS },
        { name: 'Orders', icon: '🛒', route: 'Orders' },
        { name: 'Notifications', icon: '🔔', route: SCREENS.NOTIFICATIONS },
        { name: 'Dashboard', icon: '📊', route: 'DashboardUser' },
        { name: 'Profile', icon: '⚙️', route: 'Profile' },
    ];

    const filteredItems: SearchItem[] = searchItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSearch = (item: SearchItem): void => {
        setSearchQuery('');
        setShowSearch(false);
        navigation.navigate(item.route as never, { search: searchQuery } as never);
    };

    const handleClearSearch = (): void => {
        setSearchQuery('');
        setShowSearch(false);
    };

    useEffect(() => {
        let isActive = true;

        const loadNotifications = async (): Promise<void> => {
            if (!user?.token) {
                if (isActive) {
                    setNotificationCount(0);
                }
                return;
            }

            try {
                const response = await getNotifications(user.token, { limit: 9 });
                if (!isActive) {
                    return;
                }

                if (response.ok) {
                    setNotificationCount(extractNotifications(response.data).length);
                } else {
                    setNotificationCount(0);
                }
            } catch {
                if (isActive) {
                    setNotificationCount(0);
                }
            }
        };

        if (isFocused) {
            loadNotifications();
        }

        return () => {
            isActive = false;
        };
    }, [isFocused, user?.token]);

    return (
        <View style={styles.container}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
                    <Text style={styles.menuIcon}>☰</Text>
                </TouchableOpacity>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search..."
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onFocus={() => setShowSearch(true)}
                    />
                    {searchQuery && (
                        <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
                            <Text style={styles.clearIcon}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Cart Button */}
                <TouchableOpacity
                    style={styles.notificationButton}
                    onPress={() => navigation.navigate(SCREENS.CART as never)}
                >
                    <Text style={styles.notificationIcon}>🛒</Text>
                    {cartCount > 0 ? (
                        <View style={styles.notificationBadge}>
                            <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
                        </View>
                    ) : null}
                </TouchableOpacity>

                {/* Notifications Bell */}
                <TouchableOpacity
                    style={styles.notificationButton}
                    onPress={() => navigation.navigate(SCREENS.NOTIFICATIONS as never)}
                >
                    <Text style={styles.notificationIcon}>🔔</Text>
                    {notificationCount > 0 ? (
                        <View style={styles.notificationBadge}>
                            <Text style={styles.badgeText}>{notificationCount > 99 ? '99+' : notificationCount}</Text>
                        </View>
                    ) : null}
                </TouchableOpacity>
            </View>

            {/* Search Results Dropdown */}
            {showSearch && filteredItems.length > 0 && (
                <View style={styles.searchResults}>
                    {filteredItems.map((item: SearchItem, index: number) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.searchResultItem}
                            onPress={() => handleSearch(item)}
                        >
                            <Text style={styles.resultIcon}>{item.icon}</Text>
                            <Text style={styles.resultName}>{item.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Empty Results Message */}
            {showSearch && searchQuery && filteredItems.length === 0 && (
                <View style={styles.noResults}>
                    <Text style={styles.noResultsText}>No results found</Text>
                </View>
            )}
        </View>
    );
};

// Styles
const styles = StyleSheet.create<{ [key: string]: ViewStyle | TextStyle }>({
    container: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        zIndex: 10,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 10,
    },
    menuButton: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuIcon: {
        fontSize: 18,
        color: '#374151',
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 42,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    searchIcon: {
        fontSize: 15,
        marginRight: 8,
        color: '#9CA3AF',
    },
    searchInput: {
        flex: 1,
        paddingVertical: 0,
        fontSize: 14,
        color: '#111827',
    },
    clearButton: {
        padding: 4,
    },
    clearIcon: {
        fontSize: 16,
        color: '#9CA3AF',
    },
    notificationButton: {
        position: 'relative',
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationIcon: {
        fontSize: 17,
        color: '#374151',
    },
    notificationBadge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: '#EF4444',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
    searchResults: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        maxHeight: 300,
        paddingVertical: 4,
    },
    searchResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        minHeight: 52,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    resultIcon: {
        fontSize: 18,
        marginRight: 12,
    },
    resultName: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    noResults: {
        paddingVertical: 18,
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    noResultsText: {
        fontSize: 14,
        color: '#9CA3AF',
    },
});

export default DashboardHeader;

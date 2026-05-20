import React, { FC, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../app/reducers';
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
    const navigation = useNavigation<NavigationProp<ParamListBase>>();
    const cartItems = useSelector((state: RootState) => state.cart.items);
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const searchItems: SearchItem[] = [
        { name: 'Pet Profiles', icon: '🐾', route: 'PetProfiles' },
        { name: 'My Pets', icon: '👤', route: 'PetProfiles' },
        { name: 'Orders', icon: '🛒', route: 'Orders' },
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
                <TouchableOpacity style={styles.notificationButton}>
                    <Text style={styles.notificationIcon}>🔔</Text>
                    <View style={styles.notificationBadge}>
                        <Text style={styles.badgeText}>3</Text>
                    </View>
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
        paddingHorizontal: 12,
        paddingVertical: 12,
        gap: 8,
    },
    menuButton: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: '#F3F4F6',
    },
    menuIcon: {
        fontSize: 20,
        color: '#374151',
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    searchIcon: {
        fontSize: 16,
        marginRight: 8,
        color: '#9CA3AF',
    },
    searchInput: {
        flex: 1,
        paddingVertical: 8,
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
        padding: 8,
        borderRadius: 6,
        backgroundColor: '#F3F4F6',
    },
    notificationIcon: {
        fontSize: 18,
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
    },
    searchResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
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
        paddingVertical: 20,
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    noResultsText: {
        fontSize: 14,
        color: '#9CA3AF',
    },
});

export default DashboardHeader;

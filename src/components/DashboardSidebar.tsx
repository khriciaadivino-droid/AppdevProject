import React, { FC } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../app/reducers';
import { userLogout } from '../app/reducers/auth';
import { SCREENS } from '../utils/routes';

interface DashboardSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    stats?: {
        totalPetProfiles: number;
        totalOrders: number;
        totalProducts: number;
        totalStocks: number;
    };
}

interface NavItemProps {
    icon: string;
    label: string;
    onPress: () => void;
    destructive?: boolean;
}

const SidebarNavItem: FC<NavItemProps> = ({ icon, label, onPress, destructive }) => (
    <TouchableOpacity
        style={[styles.navItem, destructive && styles.navItemDestructive]}
        onPress={onPress}
    >
        <Text style={styles.navIcon}>{icon}</Text>
        <Text style={[styles.navLabel, destructive && styles.navLabelDestructive]}>
            {label}
        </Text>
    </TouchableOpacity>
);

const DashboardSidebar: FC<DashboardSidebarProps> = ({ isOpen, onClose, stats }) => {
    const navigation = useNavigation<any>();
    const dispatch = useDispatch();
    const { data: user } = useSelector((state: RootState) => state.auth);
    const canSeeStockTotals = Boolean(
        user?.roles?.some((role) => role === 'ROLE_ADMIN' || role === 'ROLE_STAFF')
    );

    const handleNavigation = (route: string): void => {
        navigation.navigate(route);
        onClose();
    };

    const handleLogout = (): void => {
        dispatch(userLogout());
        onClose();
    };

    return (
        <SafeAreaView
            style={[styles.container, isOpen ? styles.containerVisible : styles.containerHidden]}
        >
            <TouchableOpacity style={styles.overlay} onPress={onClose} />

            <View style={styles.sidebarContent}>
                <View style={styles.profileSection}>
                    <Text style={styles.logo}>🐾 PawStuff</Text>
                    <Text style={styles.profileName}>{user?.name || 'Welcome'}</Text>
                    <Text style={styles.profileEmail}>{user?.email || 'Signed in user'}</Text>
                </View>

                {stats && (
                    <View style={styles.statsSection}>
                        <Text style={styles.statsHeading}>Live Summary</Text>
                        <View style={styles.statsGrid}>
                            <View style={styles.statChip}>
                                <Text style={styles.statChipValue}>{stats.totalPetProfiles}</Text>
                                <Text style={styles.statChipLabel}>Pets</Text>
                            </View>
                            <View style={styles.statChip}>
                                <Text style={styles.statChipValue}>{stats.totalOrders}</Text>
                                <Text style={styles.statChipLabel}>Orders</Text>
                            </View>
                            <View style={styles.statChip}>
                                <Text style={styles.statChipValue}>{stats.totalProducts}</Text>
                                <Text style={styles.statChipLabel}>Products</Text>
                            </View>
                            {canSeeStockTotals ? (
                                <View style={styles.statChip}>
                                    <Text style={styles.statChipValue}>{stats.totalStocks}</Text>
                                    <Text style={styles.statChipLabel}>Stock</Text>
                                </View>
                            ) : null}
                        </View>
                    </View>
                )}

                <ScrollView style={styles.navContainer}>
                    <SidebarNavItem
                        icon="🏠"
                        label="Dashboard"
                        onPress={() => handleNavigation(SCREENS.DASHBOARD_USER)}
                    />
                    <SidebarNavItem
                        icon="➕"
                        label="Add Pet"
                        onPress={() => handleNavigation(SCREENS.ADD_PET)}
                    />
                    <SidebarNavItem
                        icon="🐾"
                        label="My Pets"
                        onPress={() => handleNavigation(SCREENS.PET_PROFILES)}
                    />
                    <SidebarNavItem
                        icon="📋"
                        label="My Orders"
                        onPress={() => handleNavigation(SCREENS.ORDERS)}
                    />
                    <SidebarNavItem
                        icon="👤"
                        label="My Profile"
                        onPress={() => handleNavigation(SCREENS.PROFILE)}
                    />
                    <SidebarNavItem
                        icon="🚪"
                        label="Logout"
                        onPress={handleLogout}
                        destructive
                    />
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create<{ [key: string]: ViewStyle | TextStyle }>({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        flexDirection: 'row',
    },
    containerVisible: {
        display: 'flex',
    },
    containerHidden: {
        display: 'none',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sidebarContent: {
        width: '75%',
        backgroundColor: '#FFFFFF',
        borderRightWidth: 1,
        borderRightColor: '#E5E7EB',
    },
    profileSection: {
        paddingHorizontal: 16,
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#111827',
    },
    logo: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 12,
    },
    profileName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    profileEmail: {
        fontSize: 12,
        color: '#D1D5DB',
        marginTop: 4,
    },
    navContainer: {
        flex: 1,
        paddingVertical: 10,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    navItemDestructive: {
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    navIcon: {
        fontSize: 18,
        marginRight: 12,
    },
    navLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
    },
    navLabelDestructive: {
        color: '#DC2626',
    },
    statsSection: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
    },
    statsHeading: {
        fontSize: 13,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 10,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 8,
    },
    statChip: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 10,
    },
    statChipValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
    },
    statChipLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 4,
    },
});

export default DashboardSidebar;

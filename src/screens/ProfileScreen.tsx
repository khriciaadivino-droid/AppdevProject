import React, { FC, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/reducers';
import { resetLogin } from '../app/reducers/auth';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';

interface ProfileScreenProps {
    navigation: any;
}

const ProfileScreen: FC<ProfileScreenProps> = ({ navigation }) => {
    const dispatch = useDispatch();
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const { data: user } = useSelector((state: RootState) => state.auth);

    const handleLogout = (): void => {
        dispatch(resetLogin());
        navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
    };

    return (
        <View style={styles.container}>
            <DashboardHeader onMenuPress={() => setSidebarOpen(true)} />
            <DashboardSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <ScrollView style={styles.mainContent}>
                <View style={styles.contentContainer}>
                    <View style={styles.profileHeader}>
                        <View style={styles.headerGradient} />
                        <View style={styles.profileAvatarContainer}>
                            <View style={styles.profileAvatar}>
                                <Text style={styles.avatarInitial}>
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.profileCard}>
                        <Text style={styles.profileName}>{user?.name || 'User'}</Text>
                        <Text style={styles.profileRole}>👤 User</Text>

                        <View style={styles.profileDetails}>
                            <View style={styles.detailBlock}>
                                <Text style={styles.detailLabel}>📧 Email Address</Text>
                                <Text style={styles.detailValue}>{user?.email || 'N/A'}</Text>
                            </View>

                            <View style={styles.detailBlock}>
                                <Text style={styles.detailLabel}>🎯 Account Type</Text>
                                <Text style={styles.detailValue}>Standard Account</Text>
                            </View>

                            <View style={styles.detailBlock}>
                                <Text style={styles.detailLabel}>🆔 User ID</Text>
                                <Text style={styles.detailValue}>{user?.id || 'N/A'}</Text>
                            </View>
                        </View>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={[styles.actionBtn, styles.editBtn]}>
                                <Text style={styles.actionBtnText}>✏️ Edit Profile</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.actionBtn, styles.passwordBtn]}>
                                <Text style={styles.actionBtnText}>🔑 Change Password</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.logoutBtn}
                            onPress={handleLogout}
                        >
                            <Text style={styles.logoutBtnText}>🚪 Logout</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create<{ [key: string]: ViewStyle | TextStyle }>({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    mainContent: { flex: 1 },
    contentContainer: { paddingBottom: 30 },
    profileHeader: {
        backgroundColor: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
        height: 150,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 60,
    },
    headerGradient: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#3B82F6',
    },
    profileAvatarContainer: {
        alignItems: 'center',
        marginBottom: -40,
        zIndex: 10,
    },
    profileAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#3B82F6',
    },
    avatarInitial: {
        fontSize: 48,
        fontWeight: '700',
        color: '#3B82F6',
    },
    profileCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: 50,
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    profileName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
        textAlign: 'center',
    },
    profileRole: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    profileDetails: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 24,
        marginBottom: 24,
    },
    detailBlock: {
        marginBottom: 16,
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#9CA3AF',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
    },
    actionButtons: {
        gap: 12,
        marginBottom: 16,
    },
    actionBtn: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    editBtn: {
        backgroundColor: '#3B82F6',
    },
    passwordBtn: {
        backgroundColor: '#10B981',
    },
    actionBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    logoutBtn: {
        backgroundColor: '#EF4444',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    logoutBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

export default ProfileScreen;

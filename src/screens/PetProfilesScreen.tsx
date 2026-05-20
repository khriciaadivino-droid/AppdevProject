import React, { FC, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { RootState } from '../app/reducers';
import * as types from '../app/actions';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import { SCREENS } from '../utils/routes';

interface PetItem {
    id: number;
    name: string;
    species: string;
    breed?: string;
    age?: number;
    ownerName?: string;
}

interface SummaryCardProps {
    icon: string;
    label: string;
    value: string | number;
    accent: string;
}

interface PetRowProps {
    pet: PetItem;
    onEdit: (pet: PetItem) => void;
    onDelete: (petId: number) => void;
}

const formatSpecies = (value?: string): string => {
    if (!value) {
        return 'Unknown';
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
};

const getBreed = (pet: PetItem): string => {
    return (pet as any).breed || 'No breed set';
};

const getAgeLabel = (pet: PetItem): string => {
    const age = Number((pet as any).age || 0);
    if (!age) {
        return 'Age not set';
    }

    return `${age} year${age === 1 ? '' : 's'} old`;
};

const getOwnerName = (pet: PetItem): string => {
    const owner = (pet as any).ownerName || (pet as any).owner_name || (pet as any).owner;
    return owner ? String(owner) : 'You';
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

const PetRow: FC<PetRowProps> = ({ pet, onEdit, onDelete }) => (
    <View style={styles.petRow}>
        <View style={styles.petAvatar}>
            <Text style={styles.petAvatarText}>🐾</Text>
        </View>

        <View style={styles.petInfoWrap}>
            <Text style={styles.petName}>{pet.name || 'Unnamed pet'}</Text>
            <Text style={styles.petMeta}>{formatSpecies(pet.species)} · {getBreed(pet)}</Text>
            <Text style={styles.petMeta}>{getAgeLabel(pet)} · Owner: {getOwnerName(pet)}</Text>
        </View>

        <View style={styles.rowActions}>
            <TouchableOpacity style={styles.editButton} onPress={() => onEdit(pet)}>
                <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(pet.id)}>
                <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
        </View>
    </View>
);

const PetProfilesScreen: FC = () => {
    const navigation = useNavigation<any>();
    const dispatch = useDispatch();
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const { data: user } = useSelector((state: RootState) => state.auth);
    const { list: petProfiles, isLoading, error } = useSelector(
        (state: RootState) => state.pet
    );

    const refreshPets = React.useCallback((): void => {
        if (!user?.token) {
            return;
        }

        dispatch({
            type: types.GET_PETS_REQUEST,
            token: user.token,
        } as any);
    }, [dispatch, user?.token]);

    useEffect(() => {
        refreshPets();
    }, [refreshPets]);

    useFocusEffect(
        React.useCallback(() => {
            if (user?.token) {
                console.log('🟢 PetProfilesScreen focused - refreshing list');
                refreshPets();
            }
        }, [refreshPets, user?.token])
    );

    const handleDelete = (petId: number): void => {
        Alert.alert(
            'Delete Pet',
            'Are you sure you want to delete this pet profile?',
            [
                { text: 'Cancel', onPress: () => { } },
                {
                    text: 'Delete',
                    onPress: () => {
                        dispatch({
                            type: types.DELETE_PET_REQUEST,
                            id: petId,
                            token: user?.token,
                        } as any);
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    const handleEdit = (pet: PetItem): void => {
        navigation.navigate(SCREENS.EDIT_PET, { petId: pet.id, pet });
    };

    const handleAdd = (): void => {
        navigation.navigate(SCREENS.ADD_PET);
    };

    const totalPets = petProfiles.length;
    const dogs = petProfiles.filter((pet: PetItem) => (pet.species || '').toLowerCase() === 'dog').length;
    const cats = petProfiles.filter((pet: PetItem) => (pet.species || '').toLowerCase() === 'cat').length;
    const petsWithAge = petProfiles.filter((pet: PetItem) => Number((pet as any).age || 0) > 0);
    const averageAge = petsWithAge.length > 0
        ? (petsWithAge.reduce((total: number, pet: PetItem) => total + Number((pet as any).age || 0), 0) / petsWithAge.length).toFixed(1)
        : '0.0';

    if (isLoading && (!petProfiles || petProfiles.length === 0)) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <DashboardHeader onMenuPress={() => setSidebarOpen(true)} />
            <DashboardSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <View style={styles.heroCard}>
                    <Text style={styles.heroTitle}>Pet Profiles</Text>
                    <Text style={styles.heroSubtitle}>
                        Keep your pets organized with a cleaner live view from the backend.
                    </Text>
                    <View style={styles.heroActions}>
                        <TouchableOpacity style={styles.primaryButton} onPress={handleAdd}>
                            <Text style={styles.primaryButtonText}>Add Pet</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.secondaryButton} onPress={refreshPets}>
                            <Text style={styles.secondaryButtonText}>
                                {isLoading ? 'Refreshing...' : 'Refresh'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.summaryGrid}>
                    <SummaryCard icon="🐾" label="Total Pets" value={totalPets} accent="#DBEAFE" />
                    <SummaryCard icon="🐶" label="Dogs" value={dogs} accent="#FEF3C7" />
                    <SummaryCard icon="🐱" label="Cats" value={cats} accent="#FCE7F3" />
                    <SummaryCard icon="🎂" label="Avg. Age" value={averageAge} accent="#DCFCE7" />
                </View>

                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={styles.sectionTitle}>My Pets</Text>
                            <Text style={styles.sectionSubtitle}>Edit or remove profiles with the same backend flow.</Text>
                        </View>
                    </View>

                    {error && (
                        <View style={styles.errorBanner}>
                            <Text style={styles.errorBannerText}>{error}</Text>
                        </View>
                    )}

                    {petProfiles.length > 0 ? (
                        <View style={styles.petsList}>
                            {petProfiles.map((pet: PetItem) => (
                                <PetRow
                                    key={pet.id}
                                    pet={pet}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyStateCard}>
                            <Text style={styles.emptyStateTitle}>No pets yet</Text>
                            <Text style={styles.emptyStateText}>
                                Add your first pet profile and it will appear here automatically.
                            </Text>
                            <TouchableOpacity style={styles.primaryButton} onPress={handleAdd}>
                                <Text style={styles.primaryButtonText}>Add First Pet</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create<{ [key: string]: ViewStyle | TextStyle }>({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    content: { flex: 1 },
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
    heroActions: {
        flexDirection: 'row',
        marginTop: 18,
        gap: 12,
    },
    primaryButton: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    secondaryButton: {
        borderWidth: 1,
        borderColor: '#374151',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1F2937',
    },
    secondaryButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#F9FAFB',
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
        marginBottom: 12,
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
    },
    sectionHeader: {
        marginBottom: 16,
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
    },
    errorBanner: {
        backgroundColor: '#FEF3C7',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 14,
    },
    errorBannerText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#92400E',
        lineHeight: 18,
    },
    petsList: { gap: 12 },
    petRow: {
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 14,
    },
    petAvatar: {
        width: 56,
        height: 56,
        borderRadius: 14,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    petAvatarText: {
        fontSize: 24,
    },
    petInfoWrap: {
        marginBottom: 14,
    },
    petName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    petMeta: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 4,
        lineHeight: 18,
    },
    rowActions: {
        flexDirection: 'row',
        gap: 10,
    },
    editButton: {
        flex: 1,
        backgroundColor: '#E0E7FF',
        borderRadius: 10,
        paddingVertical: 8,
        alignItems: 'center',
    },
    editButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#3730A3',
    },
    deleteButton: {
        flex: 1,
        backgroundColor: '#FEE2E2',
        borderRadius: 10,
        paddingVertical: 8,
        alignItems: 'center',
    },
    deleteButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#B91C1C',
    },
    emptyStateCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 14,
        padding: 20,
        alignItems: 'center',
    },
    emptyStateTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 6,
    },
    emptyStateText: {
        fontSize: 13,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 16,
    },
});

export default PetProfilesScreen;

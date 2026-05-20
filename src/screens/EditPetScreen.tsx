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

interface EditPetScreenProps {
    route: {
        params?: {
            petId?: number;
            pet?: any;
        };
    };
    navigation: any;
}

const EditPetScreen: FC<EditPetScreenProps> = ({ route, navigation }) => {
    const { petId } = route.params || {};
    const dispatch = useDispatch();
    const { data: user } = useSelector((state: RootState) => state.auth);
    const { isLoading, error } = useSelector((state: RootState) => state.pet);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [name, setName] = useState<string>('');
    const [species, setSpecies] = useState<string>('');
    const [breed, setBreed] = useState<string>('');
    const [age, setAge] = useState<string>('');
    const [ownerName, setOwnerName] = useState<string>('');
    const [description, setDescription] = useState<string>('');

    useEffect(() => {
        if (route.params?.pet) {
            const {
                name: pName,
                species: pSpecies,
                breed: pBreed,
                age: pAge,
                ownerName: pOwner,
                description: pDesc,
            } = route.params.pet;
            setName(pName || '');
            setSpecies(pSpecies || '');
            setBreed(pBreed || '');
            setAge(String(pAge) || '');
            setOwnerName(pOwner || '');
            setDescription(pDesc || '');
        }
    }, [route.params]);

    useEffect(() => {
        if (!isSubmitting || isLoading) {
            return;
        }

        if (error) {
            setIsSubmitting(false);
            Alert.alert('Unable to update pet', error);
            return;
        }

        setIsSubmitting(false);
        navigation.goBack();
    }, [error, isLoading, isSubmitting, navigation]);

    const handleUpdatePet = (): void => {
        if (!name.trim() || !species.trim()) {
            Alert.alert('Validation', 'Please fill in name and species');
            return;
        }

        dispatch({
            type: types.UPDATE_PET_REQUEST,
            id: petId,
            payload: {
                name: name.trim(),
                species: species.trim(),
                breed: breed.trim(),
                age: age.trim() ? Number.parseInt(age, 10) : 0,
                ownerName: ownerName.trim(),
                description: description.trim(),
            },
            token: user?.token,
        } as any);

        setIsSubmitting(true);
    };

    return (
        <View style={styles.container}>
            <DashboardHeader onMenuPress={() => { }} />
            <ScrollView style={styles.content}>
                <View style={styles.formCard}>
                    <Text style={styles.formTitle}>✏️ Edit Pet</Text>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Pet Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter pet name"
                            value={name}
                            onChangeText={setName}
                            editable={!isLoading}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Species *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Dog, Cat"
                            value={species}
                            onChangeText={setSpecies}
                            editable={!isLoading}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Breed</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Labrador"
                            value={breed}
                            onChangeText={setBreed}
                            editable={!isLoading}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Age (years)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0"
                            value={age}
                            onChangeText={setAge}
                            keyboardType="number-pad"
                            editable={!isLoading}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Owner Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Owner name"
                            value={ownerName}
                            onChangeText={setOwnerName}
                            editable={!isLoading}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Enter description"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                            editable={!isLoading}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
                        onPress={handleUpdatePet}
                        disabled={isLoading}
                    >
                        <Text style={styles.submitBtnText}>
                            {isLoading ? '⏳ Updating...' : '✅ Update Pet'}
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
    textArea: { textAlignVertical: 'top', paddingTop: 12 },
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

export default EditPetScreen;

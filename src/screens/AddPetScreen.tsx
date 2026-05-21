import React, { FC, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    Image,
    ActivityIndicator,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/reducers';
import * as types from '../app/actions';
import * as petAPI from '../app/api/pet';
import DashboardHeader from '../components/DashboardHeader';

interface AddPetScreenProps {
    navigation: any;
}

const AddPetScreen: FC<AddPetScreenProps> = ({ navigation }) => {
    const dispatch = useDispatch();
    const { data: user } = useSelector((state: RootState) => state.auth);
    const { isLoading, error } = useSelector((state: RootState) => state.pet);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [name, setName] = useState<string>('');
    const [species, setSpecies] = useState<string>('');
    const [breed, setBreed] = useState<string>('');
    const [age, setAge] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);

    useEffect(() => {
        if (!isSubmitting || isLoading) {
            return;
        }
        if (error) {
            setIsSubmitting(false);
            Alert.alert('Unable to add pet', error);
            return;
        }
        setIsSubmitting(false);
        navigation.goBack();
    }, [error, isLoading, isSubmitting, navigation]);

    const handlePickImage = async (): Promise<void> => {
        const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
        if (result.didCancel || !result.assets?.[0]?.uri) {
            return;
        }

        const uri = result.assets[0].uri;
        setImageUri(uri);
        setUploadedFilename(null);

        if (!user?.token) {
            return;
        }

        setIsUploading(true);
        try {
            const res = await petAPI.uploadPetImage(uri, user.token);
            if (res.ok && res.data?.filename) {
                setUploadedFilename(res.data.filename);
            } else {
                Alert.alert('Upload failed', 'Could not upload image. You can still save the pet without a photo.');
                setImageUri(null);
            }
        } catch {
            Alert.alert('Upload failed', 'Could not upload image.');
            setImageUri(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddPet = (): void => {
        if (!name.trim() || !species.trim()) {
            Alert.alert('Validation', 'Please fill in name and species');
            return;
        }

        dispatch({
            type: types.CREATE_PET_REQUEST,
            payload: {
                name: name.trim(),
                species: species.trim(),
                breed: breed.trim(),
                age: age.trim() ? Number.parseInt(age, 10) : 0,
                description: description.trim(),
                image: uploadedFilename ?? undefined,
                isPetOfTheMonth: false,
            },
            token: user?.token,
        } as any);

        setIsSubmitting(true);
    };

    const isBusy = isLoading || isUploading;

    return (
        <View style={styles.container}>
            <DashboardHeader onMenuPress={() => { }} />
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <View style={styles.heroCard}>
                    <Text style={styles.heroTitle}>Add New Pet</Text>
                    <Text style={styles.heroSubtitle}>Fill in the details about your furry friend.</Text>
                </View>

                <View style={styles.formCard}>
                    {/* Image picker */}
                    <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage} disabled={isBusy}>
                        {isUploading ? (
                            <ActivityIndicator size="large" color="#3B82F6" />
                        ) : imageUri ? (
                            <Image source={{ uri: imageUri }} style={styles.previewImage} />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Text style={styles.imagePlaceholderIcon}>📷</Text>
                                <Text style={styles.imagePlaceholderText}>Tap to add a photo</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    {imageUri && !isUploading && (
                        <TouchableOpacity style={styles.changePhotoLink} onPress={handlePickImage}>
                            <Text style={styles.changePhotoText}>Change photo</Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Pet Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Buddy"
                            placeholderTextColor="#9CA3AF"
                            value={name}
                            onChangeText={setName}
                            editable={!isBusy}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Species *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Dog, Cat, Rabbit"
                            placeholderTextColor="#9CA3AF"
                            value={species}
                            onChangeText={setSpecies}
                            editable={!isBusy}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.formGroup, styles.rowItem]}>
                            <Text style={styles.label}>Breed</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., Labrador"
                                placeholderTextColor="#9CA3AF"
                                value={breed}
                                onChangeText={setBreed}
                                editable={!isBusy}
                            />
                        </View>
                        <View style={[styles.formGroup, styles.rowItem]}>
                            <Text style={styles.label}>Age (years)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                placeholderTextColor="#9CA3AF"
                                value={age}
                                onChangeText={setAge}
                                keyboardType="number-pad"
                                editable={!isBusy}
                            />
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="A little about your pet..."
                            placeholderTextColor="#9CA3AF"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                            editable={!isBusy}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.submitBtn, isBusy && styles.submitBtnDisabled]}
                        onPress={handleAddPet}
                        disabled={isBusy}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text style={styles.submitBtnText}>Save Pet</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => navigation.goBack()}
                        disabled={isBusy}
                    >
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    content: { flex: 1 },
    contentContainer: { padding: 16, paddingBottom: 32 },
    heroCard: {
        backgroundColor: '#111827',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
    },
    heroTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF' },
    heroSubtitle: { fontSize: 14, color: '#D1D5DB', marginTop: 6 },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    imagePicker: {
        alignSelf: 'center',
        width: 140,
        height: 140,
        borderRadius: 20,
        marginBottom: 8,
        overflow: 'hidden',
        backgroundColor: '#F3F4F6',
    },
    previewImage: { width: 140, height: 140, borderRadius: 20 },
    imagePlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        borderRadius: 20,
    },
    imagePlaceholderIcon: { fontSize: 36 },
    imagePlaceholderText: { fontSize: 12, color: '#9CA3AF', marginTop: 6, fontWeight: '600' },
    changePhotoLink: { alignSelf: 'center', marginBottom: 16 },
    changePhotoText: { fontSize: 13, fontWeight: '600', color: '#3B82F6' },
    formGroup: { marginBottom: 14 },
    label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 6 },
    row: { flexDirection: 'row', gap: 12 },
    rowItem: { flex: 1 },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#1F2937',
        backgroundColor: '#F9FAFB',
    },
    textArea: { textAlignVertical: 'top', paddingTop: 12, minHeight: 80 },
    submitBtn: {
        backgroundColor: '#111827',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 20,
    },
    submitBtnDisabled: { opacity: 0.5 },
    submitBtnText: { fontSize: 15, fontWeight: '700', color: 'white' },
    cancelBtn: {
        paddingVertical: 12,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    cancelBtnText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
});

export default AddPetScreen;

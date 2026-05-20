import React, { FC, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { launchImageLibrary } from 'react-native-image-picker';
import { RootState } from '../app/reducers';
import * as types from '../app/actions';
import DashboardHeader from '../components/DashboardHeader';
import { uploadProductImage } from '../app/api/productUpload';
import { createProduct } from '../app/api/product';

interface AddProductScreenProps {
    navigation: any;
}

const AddProductScreen: FC<AddProductScreenProps> = ({ navigation }) => {
    const dispatch = useDispatch();
    const { data: user } = useSelector((state: RootState) => state.auth);
    const { isLoading } = useSelector((state: RootState) => state.product || { isLoading: false });

    // Form fields
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [price, setPrice] = useState<string>('');
    const [quantity, setQuantity] = useState<string>('');
    const [categoryId, setCategoryId] = useState<string>('');

    // Image upload state
    const [selectedImage, setSelectedImage] = useState<{ uri: string; name: string } | null>(null);
    const [uploadingImage, setUploadingImage] = useState<boolean>(false);
    const [uploadedFilename, setUploadedFilename] = useState<string>('');
    const [imageUploadError, setImageUploadError] = useState<string>('');

    // Overall submission state
    const [submitting, setSubmitting] = useState<boolean>(false);

    const handleSelectImage = async (): Promise<void> => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.8,
                includeBase64: false,
                maxWidth: 1024,
                maxHeight: 1024,
            });

            if (result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                if (asset.uri) {
                    const fileName = asset.fileName || `product_${Date.now()}.jpg`;
                    setSelectedImage({ uri: asset.uri, name: fileName });
                    setImageUploadError('');
                }
            }
        } catch (error: any) {
            Alert.alert('Error', 'Failed to select image: ' + error.message);
        }
    };

    const handleUploadImage = async (): Promise<void> => {
        if (!selectedImage) {
            Alert.alert('Error', 'No image selected');
            return;
        }

        if (!user?.token) {
            Alert.alert('Error', 'Authentication token required');
            return;
        }

        setUploadingImage(true);
        setImageUploadError('');

        try {
            const uploadResult = await uploadProductImage(
                selectedImage.uri,
                selectedImage.name,
                user.token
            );

            setUploadedFilename(uploadResult.data.filename);
            Alert.alert('Success', 'Image uploaded successfully');
        } catch (error: any) {
            setImageUploadError('Failed to upload image: ' + error.message);
            Alert.alert('Upload Error', error.message || 'Failed to upload image');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleAddProduct = async (): Promise<void> => {
        // Validation
        if (!name.trim()) {
            Alert.alert('Validation', 'Please enter product name');
            return;
        }

        if (!description.trim()) {
            Alert.alert('Validation', 'Please enter product description');
            return;
        }

        if (!price.trim() || isNaN(parseFloat(price))) {
            Alert.alert('Validation', 'Please enter valid price');
            return;
        }

        if (!quantity.trim() || isNaN(parseInt(quantity))) {
            Alert.alert('Validation', 'Please enter valid quantity');
            return;
        }

        if (!uploadedFilename) {
            Alert.alert('Validation', 'Please upload a product image');
            return;
        }

        if (!user?.token) {
            Alert.alert('Error', 'Authentication token required');
            return;
        }

        setSubmitting(true);

        try {
            const productPayload = {
                name: name.trim(),
                description: description.trim(),
                price: parseFloat(price),
                quantity: parseInt(quantity),
                image: uploadedFilename,
                ...(categoryId && { category_id: parseInt(categoryId) }),
            };

            const response = await createProduct(productPayload, user.token);

            if (response.ok && response.data?.success) {
                Alert.alert('Success', 'Product created successfully');
                // Reset form
                setName('');
                setDescription('');
                setPrice('');
                setQuantity('');
                setCategoryId('');
                setSelectedImage(null);
                setUploadedFilename('');
                navigation.goBack();
            } else {
                Alert.alert('Error', response.data?.message || 'Failed to create product');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create product');
        } finally {
            setSubmitting(false);
        }
    };

    const isImageReady = !!uploadedFilename;
    const isFormValid =
        name.trim() &&
        description.trim() &&
        price.trim() &&
        quantity.trim() &&
        isImageReady;

    return (
        <View style={styles.container}>
            <DashboardHeader onMenuPress={() => { }} />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.formCard}>
                    <Text style={styles.formTitle}>➕ Add New Product</Text>

                    {/* Image Section */}
                    <View style={styles.imageSection}>
                        <Text style={styles.sectionTitle}>📸 Product Image</Text>

                        {selectedImage && (
                            <Image
                                source={{ uri: selectedImage.uri }}
                                style={styles.previewImage}
                                resizeMode="cover"
                            />
                        )}

                        <TouchableOpacity
                            style={[styles.imageBtn, uploadingImage && styles.buttonDisabled]}
                            onPress={handleSelectImage}
                            disabled={uploadingImage}
                        >
                            <Text style={styles.imageBtnText}>
                                {selectedImage ? '🔄 Change Image' : '📱 Select Image'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.uploadBtn,
                                (!selectedImage || uploadingImage) && styles.buttonDisabled,
                            ]}
                            onPress={handleUploadImage}
                            disabled={!selectedImage || uploadingImage}
                        >
                            {uploadingImage ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Text style={styles.uploadBtnText}>
                                    {uploadedFilename ? '✅ Image Uploaded' : '☁️ Upload Image'}
                                </Text>
                            )}
                        </TouchableOpacity>

                        {imageUploadError && <Text style={styles.errorText}>{imageUploadError}</Text>}
                        {uploadedFilename && (
                            <Text style={styles.successText}>✓ Filename: {uploadedFilename}</Text>
                        )}
                    </View>

                    <View style={styles.divider} />

                    {/* Product Details Section */}
                    <Text style={styles.sectionTitle}>📋 Product Details</Text>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Product Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Red Wine 2020"
                            value={name}
                            onChangeText={setName}
                            editable={!submitting}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Description *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Enter product description"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                            editable={!submitting}
                        />
                    </View>

                    <View style={styles.rowGroup}>
                        <View style={[styles.formGroup, styles.flex1]}>
                            <Text style={styles.label}>Price (₱) *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0.00"
                                value={price}
                                onChangeText={setPrice}
                                keyboardType="decimal-pad"
                                editable={!submitting}
                            />
                        </View>

                        <View style={[styles.formGroup, styles.flex1]}>
                            <Text style={styles.label}>Quantity *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                value={quantity}
                                onChangeText={setQuantity}
                                keyboardType="number-pad"
                                editable={!submitting}
                            />
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Category ID (Optional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Leave blank for default"
                            value={categoryId}
                            onChangeText={setCategoryId}
                            keyboardType="number-pad"
                            editable={!submitting}
                        />
                    </View>

                    {/* Action Buttons */}
                    <TouchableOpacity
                        style={[
                            styles.submitBtn,
                            (!isFormValid || submitting) && styles.submitBtnDisabled,
                        ]}
                        onPress={handleAddProduct}
                        disabled={!isFormValid || submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text style={styles.submitBtnText}>✅ Create Product</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => navigation.goBack()}
                        disabled={submitting}
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
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4B5563',
        marginBottom: 12,
        marginTop: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 16,
    },

    // Image section styles
    imageSection: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: '#E5E7EB',
    },
    imageBtn: {
        backgroundColor: '#6366F1',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    imageBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },
    uploadBtn: {
        backgroundColor: '#3B82F6',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 8,
    },
    uploadBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 8,
    },
    successText: {
        fontSize: 12,
        color: '#10B981',
        marginTop: 8,
        fontWeight: '500',
    },

    // Form styles
    formGroup: { marginBottom: 16 },
    rowGroup: {
        flexDirection: 'row',
        gap: 12,
    },
    flex1: { flex: 1 },
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

    // Button styles
    submitBtn: {
        backgroundColor: '#10B981',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 24,
    },
    submitBtnDisabled: { opacity: 0.5 },
    submitBtnText: { fontSize: 16, fontWeight: '600', color: 'white' },
    cancelBtn: {
        backgroundColor: '#E5E7EB',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 12,
    },
    cancelBtnText: { fontSize: 16, fontWeight: '600', color: '#4B5563' },
    buttonDisabled: {
        opacity: 0.5,
    },
});

export default AddProductScreen;

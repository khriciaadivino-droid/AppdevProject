/**
 * Product Image Upload API Service (TypeScript)
 * Handles image uploads for products using multipart/form-data
 */

import { API_CONFIG } from './config';

interface UploadResponse {
    success: boolean;
    message: string;
    data: {
        filename: string;
        url: string;
    };
}

interface UploadError {
    success: false;
    message: string;
}

/**
 * Upload product image to backend
 * Requires Bearer token authentication
 */
export const uploadProductImage = async (
    imageUri: string,
    fileName: string,
    token: string
): Promise<UploadResponse> => {
    if (!token) {
        throw new Error('Authentication token required for image upload');
    }

    try {
        // Convert image URI to blob
        const response = await fetch(imageUri);
        const blob = await response.blob();

        // Create FormData with image file
        const formData = new FormData();
        formData.append('image', blob, fileName);

        // Determine base URL (same fallback logic as main API client)
        const baseUrls = API_CONFIG.BASE_URLS;
        let lastError: Error | null = null;

        for (const baseUrl of baseUrls) {
            try {
                const uploadUrl = `${baseUrl}/api/products/upload/image`;

                console.log(`📸 [Upload] Attempting: ${uploadUrl}`);

                const uploadResponse = await fetch(uploadUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        // Note: Don't set Content-Type header; fetch will set it to multipart/form-data automatically
                    },
                    body: formData,
                });

                if (uploadResponse.ok) {
                    const uploadData: UploadResponse = await uploadResponse.json();
                    console.log('✅ [Upload] Success:', uploadData.data);
                    return uploadData;
                } else {
                    const errorData = await uploadResponse.json() as UploadError;
                    throw new Error(errorData.message || `Upload failed with status ${uploadResponse.status}`);
                }
            } catch (error: any) {
                lastError = error;
                console.warn(`⚠️ [Upload] Failed on ${baseUrl}:`, error.message);
                continue;
            }
        }

        throw lastError || new Error('All upload endpoints failed');
    } catch (error: any) {
        console.error('📸 [Upload] Error:', error.message);
        throw error;
    }
};

export default {
    uploadProductImage,
};

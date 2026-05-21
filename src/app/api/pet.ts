/**
 * Pet Profile API Service (TypeScript)
 * CRUD operations for pet profiles
 */

import { apiClient, apiGet, apiPost, apiPut, apiDelete } from './client';
import { Pet, CreatePetInput, UpdatePetInput } from '../../types/index';

interface ApiResponse<T> {
    status: number;
    ok: boolean;
    data?: T;
}

interface PetListResponse {
    pets: Pet[];
    total: number;
}

interface UploadPetImageApiResponse {
    success?: boolean;
    message?: string;
    data?: {
        filename: string;
        url: string;
    };
}

/**
 * Get all pets for current user
 */
export const getPets = async (token?: string, params?: { [key: string]: any }): Promise<ApiResponse<PetListResponse>> => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiGet<PetListResponse>(`/pet-profiles${queryString}`, token);
};

/**
 * Get single pet by ID
 */
export const getPet = async (id: string, token?: string): Promise<ApiResponse<Pet>> => {
    return apiGet<Pet>(`/pet-profiles/${id}`, token);
};

/**
 * Create new pet
 */
export const createPet = async (data: CreatePetInput, token: string): Promise<ApiResponse<Pet>> => {
    return apiPost<Pet>('/pet-profiles', data, token);
};

/**
 * Update pet
 */
export const updatePet = async (
    id: string,
    data: UpdatePetInput,
    token: string
): Promise<ApiResponse<Pet>> => {
    return apiPut<Pet>(`/pet-profiles/${id}`, data, token);
};

/**
 * Partially update pet
 */
export const patchPet = async (
    id: string,
    data: Partial<UpdatePetInput>,
    token: string
): Promise<ApiResponse<Pet>> => {
    return apiPut<Pet>(`/pet-profiles/${id}`, data, token);
};

/**
 * Delete pet
 */
export const deletePet = async (id: string, token: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiDelete<{ success: boolean }>(`/pet-profiles/${id}`, token);
};

/**
 * Upload a pet image. Returns { filename, url } on success.
 */
export const uploadPetImage = async (
    imageUri: string,
    token: string
): Promise<ApiResponse<{ filename: string; url: string }>> => {
    const filename = imageUri.split('/').pop() ?? 'pet-photo.jpg';
    const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
    const mimeType = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/jpeg';

    const formData = new FormData();
    formData.append('image', { uri: imageUri, name: filename, type: mimeType } as any);

    try {
        const response = await apiClient<UploadPetImageApiResponse>('/pet-profiles/upload/image', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });

        return {
            status: response.status,
            ok: response.ok,
            data: response.data?.data,
        };
    } catch (error: any) {
        return { status: 0, ok: false, data: undefined };
    }
};

/**
 * Legacy function names for backwards compatibility
 */
export const getAll = (token?: string) => getPets(token);
export const getById = (id: string, token?: string) => getPet(id, token);
export const create = (data: CreatePetInput, token: string) => createPet(data, token);
export const update = (id: string, data: UpdatePetInput, token: string) => updatePet(id, data, token);
export const remove = (id: string, token: string) => deletePet(id, token);

export default {
    getPets,
    getPet,
    createPet,
    updatePet,
    patchPet,
    deletePet,
    uploadPetImage,
    getAll,
    getById,
    create,
    update,
    remove,
};

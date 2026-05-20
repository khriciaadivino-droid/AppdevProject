/**
 * Pet Profile API Service (TypeScript)
 * CRUD operations for pet profiles
 */

import { apiGet, apiPost, apiPut, apiDelete } from './client';
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
    getAll,
    getById,
    create,
    update,
    remove,
};

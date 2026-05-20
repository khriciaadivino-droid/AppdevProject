/**
 * Product API Service (TypeScript)
 * Handles product CRUD operations and image uploads
 */

import { apiGet, apiPost } from './client';

export interface ProductApiItem {
    id: number;
    name: string;
    description?: string;
    price?: number;
    quantity?: number;
    category?: string | { name?: string } | null;
    image?: string;
    imagefilename?: string;
}

export interface CreateProductPayload {
    name: string;
    description: string;
    price: number;
    quantity: number;
    image: string; // filename from upload endpoint
    category_id?: number;
}

interface ApiResponse<T> {
    status: number;
    ok: boolean;
    data?: T;
}

interface ProductListResponse {
    success?: boolean;
    data?: ProductApiItem[];
    products?: ProductApiItem[];
    count?: number;
    message?: string;
}

interface CreateProductResponse {
    success: boolean;
    message: string;
    data: {
        id: number;
    };
}

/**
 * Fetch all products
 */
export const getProducts = async (token?: string): Promise<ApiResponse<ProductListResponse>> => {
    return apiGet<ProductListResponse>('/products', token);
};

/**
 * Create a new product
 * Note: Call uploadProductImage first to get the filename
 */
export const createProduct = async (
    payload: CreateProductPayload,
    token?: string
): Promise<ApiResponse<CreateProductResponse>> => {
    return apiPost<CreateProductResponse>('/products', payload, token);
};

export default {
    getProducts,
    createProduct,
};
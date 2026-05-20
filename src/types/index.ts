/**
 * TypeScript Type Definitions and Utilities
 * Central location for all app-wide types and interfaces
 */

// Navigation types
export const SCREENS = {
    LANDING: 'Landing',
    ABOUT: 'About',
    HOME: 'Home',
    PROFILE: 'Profile',
    LOGIN: 'Login',
    REGISTER: 'Register',
    DASHBOARD_USER: 'DashboardUser',
    PET_PROFILES: 'PetProfiles',
    ADD_PET: 'AddPet',
    EDIT_PET: 'EditPet',
    ORDERS: 'Orders',
    ADD_ORDER: 'AddOrder',
    EDIT_ORDER: 'EditOrder',
} as const;

export type ScreenName = typeof SCREENS[keyof typeof SCREENS];

// API Response types
export interface ApiErrorResponse {
    success: false;
    message: string;
    statusCode: number;
    errors?: Record<string, string[]>;
}

export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
    message?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// User types
export interface User {
    id: number;
    email: string;
    name: string;
    roles: string[];
    status: 'active' | 'inactive' | 'banned';
    createdAt: string;
}

export interface AuthUser extends User {
    token: string;
    isVerified: boolean;
    loginTime?: string;
}

// Pet types
export interface Pet {
    id: number;
    userId: number;
    name: string;
    species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
    breed?: string;
    age?: number;
    color?: string;
    weight?: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePetInput {
    name: string;
    species: Pet['species'];
    breed?: string;
    age?: number;
    color?: string;
    weight?: number;
    notes?: string;
}

export interface UpdatePetInput extends Partial<CreatePetInput> { }

// Order types
export interface OrderItem {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
}

export interface Order {
    id: number;
    userId: number;
    items: OrderItem[];
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    totalAmount: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrderInput {
    items: Array<{
        productId: number;
        quantity: number;
    }>;
    notes?: string;
}

export interface UpdateOrderInput {
    status?: Order['status'];
    notes?: string;
}

// Pagination types
export interface Pagination {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: Pagination;
}

// Error handling types
export interface AppError {
    code: string;
    message: string;
    statusCode: number;
    details?: Record<string, any>;
    isRetryable: boolean;
}

// Form types
export interface FormErrors {
    [field: string]: string | string[];
}

export interface FormState<T> {
    values: T;
    errors: FormErrors;
    touched: Record<keyof T, boolean>;
    isSubmitting: boolean;
    isDirty: boolean;
}

// Redux action types
export interface ReduxAction<T = any> {
    type: string;
    payload?: T;
    meta?: Record<string, any>;
    error?: Error;
}

// Utility functions
export const isAuthUser = (user: any): user is AuthUser => {
    return user && typeof user === 'object' && 'token' in user && 'id' in user;
};

export const isPet = (pet: any): pet is Pet => {
    return (
        pet &&
        typeof pet === 'object' &&
        'id' in pet &&
        'userId' in pet &&
        'name' in pet &&
        'species' in pet
    );
};

export const isOrder = (order: any): order is Order => {
    return (
        order &&
        typeof order === 'object' &&
        'id' in order &&
        'userId' in order &&
        'items' in order &&
        'status' in order
    );
};

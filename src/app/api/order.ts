/**
 * Order API Service (TypeScript)
 * CRUD operations for orders
 */

import { apiGet, apiPost, apiPut, apiDelete } from './client';
import { Order, CreateOrderInput, UpdateOrderInput } from '../../types/index';

interface ApiResponse<T> {
    status: number;
    ok: boolean;
    data?: T;
}

interface OrderListResponse {
    orders: Order[];
    total: number;
}

const compactPayload = (payload: Record<string, any>): Record<string, any> => {
    return Object.fromEntries(
        Object.entries(payload).filter(([, value]) => value !== undefined)
    );
};

const normalizeCreateOrderPayload = (data: any): Record<string, any> => {
    return compactPayload({
        order_number: data?.order_number ?? data?.orderNumber,
        product_id: data?.product_id ?? data?.productId,
        customer_name: data?.customer_name ?? data?.customerName,
        customer_email: data?.customer_email ?? data?.customerEmail,
        quantity: data?.quantity,
        total_amount: data?.total_amount ?? data?.totalAmount,
        status: data?.status,
        order_date: data?.order_date ?? data?.orderDate,
        notes: data?.notes,
        fulfillment_type: data?.fulfillment_type ?? data?.fulfillmentType,
        delivery_address: data?.delivery_address ?? data?.deliveryAddress,
    });
};

const normalizeUpdateOrderPayload = (data: any): Record<string, any> => {
    return compactPayload({
        order_number: data?.order_number ?? data?.orderNumber,
        product_id: data?.product_id ?? data?.productId,
        customer_name: data?.customer_name ?? data?.customerName,
        customer_email: data?.customer_email ?? data?.customerEmail,
        quantity: data?.quantity,
        total_amount: data?.total_amount ?? data?.totalAmount,
        status: data?.status,
        order_date: data?.order_date ?? data?.orderDate,
        notes: data?.notes,
    });
};

/**
 * Get all orders for current user
 */
export const getOrders = async (token?: string, params?: { [key: string]: any }): Promise<ApiResponse<OrderListResponse>> => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiGet<OrderListResponse>(`/orders${queryString}`, token);
};

/**
 * Get single order by ID
 */
export const getOrder = async (id: string, token?: string): Promise<ApiResponse<Order>> => {
    return apiGet<Order>(`/orders/${id}`, token);
};

/**
 * Create new order
 */
export const createOrder = async (data: CreateOrderInput, token: string): Promise<ApiResponse<Order>> => {
    return apiPost<Order>('/orders', normalizeCreateOrderPayload(data), token);
};

/**
 * Update order
 */
export const updateOrder = async (
    id: string,
    data: UpdateOrderInput,
    token: string
): Promise<ApiResponse<Order>> => {
    return apiPut<Order>(`/orders/${id}`, normalizeUpdateOrderPayload(data), token);
};

/**
 * Partially update order
 */
export const patchOrder = async (
    id: string,
    data: Partial<UpdateOrderInput>,
    token: string
): Promise<ApiResponse<Order>> => {
    return apiPut<Order>(`/orders/${id}`, normalizeUpdateOrderPayload(data), token);
};

/**
 * Delete order
 */
export const deleteOrder = async (id: string, token: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiDelete<{ success: boolean }>(`/orders/${id}`, token);
};

/**
 * Legacy function names for backwards compatibility
 */
export const getAll = (token?: string) => getOrders(token);
export const getById = (id: string, token?: string) => getOrder(id, token);
export const create = (data: CreateOrderInput, token: string) => createOrder(data, token);
export const update = (id: string, data: UpdateOrderInput, token: string) => updateOrder(id, data, token);
export const remove = (id: string, token: string) => deleteOrder(id, token);

export default {
    getOrders,
    getOrder,
    createOrder,
    updateOrder,
    patchOrder,
    deleteOrder,
    getAll,
    getById,
    create,
    update,
    remove,
};

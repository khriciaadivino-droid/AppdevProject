/**
 * Payment API service
 * Calls the Symfony /api/payment/* endpoints which proxy to PayMongo.
 */

import { apiPost } from './client';

// ── Types ─────────────────────────────────────────────────────────────────

export interface CreatePaymentInput {
    payment_method: 'gcash' | 'maya' | 'card';
    total_amount: number;    // PHP pesos (e.g. 150.00)
    order_ids: number[];
    description?: string;
    customer_name: string;
    customer_email?: string;
    customer_phone?: string;
    // Card-only fields
    card_holder?: string;
    card_number?: string;     // raw 16 digits (no spaces)
    exp_month_year?: string;  // "MM/YY"
    cvc?: string;
}

export interface PaymentResult {
    success: boolean;
    type?: 'redirect' | 'success';
    checkout_url?: string;
    source_id?: string;
    intent_id?: string;
    status?: string;
    message?: string;
}

interface ApiResponse<T> {
    status: number;
    ok: boolean;
    data?: T;
}

// ── API call ──────────────────────────────────────────────────────────────

/**
 * Creates a PayMongo payment source or payment intent.
 *
 * For gcash / maya: returns { type: 'redirect', checkout_url } — open in browser.
 * For card: returns { type: 'success' } (immediate) or { type: 'redirect', checkout_url } (3DS).
 */
export const createPayment = async (
    data: CreatePaymentInput,
    token: string
): Promise<ApiResponse<PaymentResult>> => {
    return apiPost<PaymentResult>('/payment/create', data, token);
};

export default { createPayment };

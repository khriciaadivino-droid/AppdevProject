import * as types from '../actions';

export interface CartItem {
    productId: number;
    name: string;
    price: number;
    quantity: number;
    maxStock: number;
    image: string | null;
}

export interface CartState {
    items: CartItem[];
}

export interface CartAction {
    type: string;
    payload?: any;
}

const initialState: CartState = {
    items: [],
};

export default function cartReducer(state: CartState = initialState, action: CartAction): CartState {
    switch (action.type) {
        case types.CART_ADD_ITEM: {
            const incoming: CartItem = action.payload;
            const existing = state.items.find((i) => i.productId === incoming.productId);
            if (existing) {
                return {
                    ...state,
                    items: state.items.map((i) =>
                        i.productId === incoming.productId
                            ? { ...i, quantity: Math.min(i.quantity + incoming.quantity, i.maxStock) }
                            : i
                    ),
                };
            }
            return { ...state, items: [...state.items, incoming] };
        }

        case types.CART_REMOVE_ITEM:
            return {
                ...state,
                items: state.items.filter((i) => i.productId !== action.payload),
            };

        case types.CART_UPDATE_QUANTITY: {
            const { productId, quantity } = action.payload;
            if (quantity <= 0) {
                return { ...state, items: state.items.filter((i) => i.productId !== productId) };
            }
            return {
                ...state,
                items: state.items.map((i) =>
                    i.productId === productId
                        ? { ...i, quantity: Math.min(quantity, i.maxStock) }
                        : i
                ),
            };
        }

        case types.CART_CLEAR:
            return { ...state, items: [] };

        default:
            return state;
    }
}

// Action creators
export const cartAddItem = (item: CartItem): CartAction => ({
    type: types.CART_ADD_ITEM,
    payload: item,
});

export const cartRemoveItem = (productId: number): CartAction => ({
    type: types.CART_REMOVE_ITEM,
    payload: productId,
});

export const cartUpdateQuantity = (productId: number, quantity: number): CartAction => ({
    type: types.CART_UPDATE_QUANTITY,
    payload: { productId, quantity },
});

export const cartClear = (): CartAction => ({
    type: types.CART_CLEAR,
});

import * as types from '../actions';

// Type definitions
export interface Pet {
    id: number;
    name: string;
    species: string;
    breed?: string;
    age?: number;
    owner?: string;
    [key: string]: any;
}

export interface PetState {
    list: Pet[];
    isLoading: boolean;
    error: string | null;
}

export interface PetAction {
    type: string;
    payload?: any;
}

const initialState: PetState = {
    list: [],
    isLoading: false,
    error: null,
};

export default function petReducer(state: PetState = initialState, action: PetAction): PetState {
    switch (action.type) {
        case types.GET_PETS_REQUEST:
            return { ...state, isLoading: true, error: null };
        case types.GET_PETS_COMPLETED:
            return { ...state, list: action.payload, isLoading: false };
        case types.GET_PETS_ERROR:
            return { ...state, error: action.payload, isLoading: false };

        case types.CREATE_PET_REQUEST:
            return { ...state, isLoading: true, error: null };
        case types.CREATE_PET_COMPLETED:
            return { ...state, list: [...state.list, action.payload], isLoading: false };
        case types.CREATE_PET_ERROR:
            return { ...state, error: action.payload, isLoading: false };

        case types.UPDATE_PET_REQUEST:
            return { ...state, isLoading: true, error: null };
        case types.UPDATE_PET_COMPLETED:
            return {
                ...state,
                list: state.list.map(item => item.id === action.payload.id ? action.payload : item),
                isLoading: false,
            };
        case types.UPDATE_PET_ERROR:
            return { ...state, error: action.payload, isLoading: false };

        case types.DELETE_PET_REQUEST:
            return { ...state, isLoading: true, error: null };
        case types.DELETE_PET_COMPLETED:
            return {
                ...state,
                list: state.list.filter(item => item.id !== action.payload),
                isLoading: false,
            };
        case types.DELETE_PET_ERROR:
            return { ...state, error: action.payload, isLoading: false };

        default:
            return state;
    }
}

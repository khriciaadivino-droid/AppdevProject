import {
  USER_LOGIN,
  USER_LOGIN_COMPLETED,
  USER_LOGIN_ERROR,
  USER_LOGIN_REQUEST,
  USER_LOGIN_RESET,
} from '../actions';
import { PURGE } from 'redux-persist';

const INITIAL_STATE = {
  data: null,
  isLoading: false,
  isError: false,
  errorMessage: null,
};

export default function reducer(state = INITIAL_STATE, action) {
  console.log('Auth Reducer - Action:', action.type);
  console.log('Auth Reducer - Current state:', state);
  switch (action.type) {
    case USER_LOGIN_REQUEST:
      return {
        ...state,
        data: null,
        isLoading: true,
        isError: false,
        errorMessage: null,
      };

    case USER_LOGIN_COMPLETED:
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        isError: false,
        errorMessage: null,
      };

    case USER_LOGIN_ERROR:
      return {
        data: null,
        isLoading: false,
        isError: true,
        errorMessage: action.payload || 'Login failed. Please try again.',
      };

    case USER_LOGIN_RESET:
    case PURGE:
      return INITIAL_STATE;

    default:
      return state;
  }
}

export const userLogin = payload => ({
  type: USER_LOGIN,
  payload,
});

export const userLoginCompleted = payload => ({
  type: USER_LOGIN_COMPLETED,
  payload,
});

export const resetLogin = () => ({
  type: USER_LOGIN_RESET,
});

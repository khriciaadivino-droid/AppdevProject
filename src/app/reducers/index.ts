import { applyMiddleware, combineReducers, createStore, Store } from 'redux';
import createSagaMiddleware, { SagaMiddleware } from 'redux-saga';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer, persistStore, Persistor } from 'redux-persist';

import auth, { AuthState } from '../reducers/auth';
import pet, { PetState } from '../reducers/pet';
import order, { OrderState } from '../reducers/order';
import error, { ErrorState } from '../reducers/error';
import cart, { CartState } from '../reducers/cart';

// Root state type
export interface RootState {
    auth: AuthState;
    pet: PetState;
    order: OrderState;
    error: ErrorState;
    cart: CartState;
}

// Store return type
export interface StoreSetup {
    store: Store<RootState>;
    persistor: Persistor;
    runSaga: SagaMiddleware['run'];
}

const sagaMiddleware = createSagaMiddleware();

const rootReducer = combineReducers<RootState>({
    auth,
    pet,
    order,
    error,
    cart,
});

const persistConfig = {
    key: 'root-v2',
    storage: AsyncStorage,
    blacklist: ['auth', 'pet', 'order', 'error'],
    whitelist: ['cart'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export default (): StoreSetup => {
    const store = createStore<RootState>(persistedReducer, applyMiddleware(sagaMiddleware));
    const persistor = persistStore(store);
    const runSaga = sagaMiddleware.run;
    return { store, persistor, runSaga };
};

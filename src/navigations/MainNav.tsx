import React, { FC } from 'react';
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { RootState } from '../app/reducers';
import { SCREENS } from '../utils/routes';
import DashboardUserScreen from '../screens/DashboardUserScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PetProfilesScreen from '../screens/PetProfilesScreen';
import AddPetScreen from '../screens/AddPetScreen';
import EditPetScreen from '../screens/EditPetScreen';
import OrdersScreen from '../screens/OrdersScreen';
import AddOrderScreen from '../screens/AddOrderScreen';
import EditOrderScreen from '../screens/EditOrderScreen';
import AddProductScreen from '../screens/AddProductScreen';
import ProductsScreen from '../screens/ProductsScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';

// Type definitions for navigation params
export type MainStackParamList = {
    [SCREENS.DASHBOARD_USER]: undefined;
    [SCREENS.NOTIFICATIONS]: undefined;
    [SCREENS.PROFILE]: undefined;
    [SCREENS.PET_PROFILES]: undefined;
    [SCREENS.ADD_PET]: undefined;
    [SCREENS.EDIT_PET]: { petId: number; pet?: any };
    [SCREENS.ORDERS]: undefined;
    [SCREENS.ADD_ORDER]: undefined;
    [SCREENS.EDIT_ORDER]: { orderId: number; order?: any };
    [SCREENS.ADD_PRODUCT]: undefined;
    [SCREENS.PRODUCTS]: undefined;
    [SCREENS.CART]: undefined;
    [SCREENS.CHECKOUT]: undefined;
};

export type MainStackScreenProps<T extends keyof MainStackParamList> = StackScreenProps<
    MainStackParamList,
    T
>;

const Stack = createStackNavigator<MainStackParamList>();

const MainNav: FC = () => {
    const { data } = useSelector((state: RootState) => state.auth);

    const initialRouteName = SCREENS.DASHBOARD_USER;

    return (
        <Stack.Navigator initialRouteName={initialRouteName}>
            <Stack.Screen
                name={SCREENS.DASHBOARD_USER}
                component={DashboardUserScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={SCREENS.NOTIFICATIONS}
                component={NotificationsScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={SCREENS.PROFILE}
                component={ProfileScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={SCREENS.PET_PROFILES}
                component={PetProfilesScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={SCREENS.ADD_PET}
                component={AddPetScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={SCREENS.EDIT_PET}
                component={EditPetScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={SCREENS.ORDERS}
                component={OrdersScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={SCREENS.ADD_ORDER}
                component={AddOrderScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={SCREENS.EDIT_ORDER}
                component={EditOrderScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={SCREENS.ADD_PRODUCT}
                component={AddProductScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={SCREENS.PRODUCTS}
                component={ProductsScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={SCREENS.CART}
                component={CartScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={SCREENS.CHECKOUT}
                component={CheckoutScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};

export default MainNav;

import React, { FC } from 'react';
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack';
import { SCREENS } from '../utils/routes';
import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';
import LandingScreen from '../screens/LandingScreen';
import AboutScreen from '../screens/AboutScreen';

// Type definitions for navigation params
export type AuthStackParamList = {
    [SCREENS.LANDING]: undefined;
    [SCREENS.ABOUT]: undefined;
    [SCREENS.LOGIN]: undefined;
    [SCREENS.REGISTER]: undefined;
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = StackScreenProps<
    AuthStackParamList,
    T
>;

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNav: FC = () => {
    return (
        <Stack.Navigator initialRouteName={SCREENS.LANDING}>
            <Stack.Screen
                name={SCREENS.LANDING}
                component={LandingScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={SCREENS.ABOUT}
                component={AboutScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={SCREENS.LOGIN}
                component={Login}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={SCREENS.REGISTER}
                component={Register}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};

export default AuthNav;

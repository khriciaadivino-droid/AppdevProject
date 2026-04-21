import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AuthNav from './AuthNav';
import MainNav from './MainNav';

export default () => {
    const { data } = useSelector(state => state.auth);

    let isLoggedIn = !!data;

    console.log('🟢 Navigation - isLoggedIn:', isLoggedIn);
    console.log('🟢 Navigation - auth data:', data);

    return (
        <NavigationContainer key={isLoggedIn ? 'logged-in' : 'logged-out'}>
            {isLoggedIn ? <MainNav /> : <AuthNav />}
        </NavigationContainer>
    );
};
import React, { FC } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../app/reducers';
import AuthNav from './AuthNav';
import MainNav from './MainNav';

const Navigation: FC = () => {
    const { data } = useSelector((state: RootState) => state.auth);

    const isLoggedIn = !!data;

    console.log('🟢 Navigation - isLoggedIn:', isLoggedIn);
    console.log('🟢 Navigation - auth data:', data);

    return (
        <NavigationContainer key={isLoggedIn ? 'logged-in' : 'logged-out'}>
            {isLoggedIn ? <MainNav /> : <AuthNav />}
        </NavigationContainer>
    );
};

export default Navigation;

/**
 * Divino React Native App
 *
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import firebase from '@react-native-firebase/app';
import Navigation from './src/navigations/Index';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import rootSaga from './src/app/sagas';
import configureStore from './src/app/reducers';

const { store, persistor, runSaga } = configureStore();
runSaga(rootSaga);

export { persistor };

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  console.log('Firebase app initialized:', firebase.app().name);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <Navigation />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  );
}

export default App;

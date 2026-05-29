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
import messaging from '@react-native-firebase/messaging';
import Navigation from './src/navigations/Index';
import ErrorBoundary from './src/components/ErrorBoundary';
import ErrorDisplay from './src/components/ErrorDisplay';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import rootSaga from './src/app/sagas';
import configureStore from './src/app/reducers';
import { showLocalNotificationFromRemoteMessage } from './src/app/notifications/push';


// Initialize Google Sign-In configuration (replace with your actual web client ID)

// Google Sign-In configuration is now handled in Login.tsx only to avoid duplicate/conflicting setup.
const { store, persistor, runSaga } = configureStore();
runSaga(rootSaga);
export { persistor };

function AppContent() {
  const isDarkMode = useColorScheme() === 'dark';

  React.useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      await showLocalNotificationFromRemoteMessage(remoteMessage);
    });
    return unsubscribe;
  }, []);

  return (
    <ErrorBoundary onReset={() => { }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <Navigation />
          <ErrorDisplay />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

function App() {
  console.log('Firebase app initialized:', firebase.app().name);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}

export default App;

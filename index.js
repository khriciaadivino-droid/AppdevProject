/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import { showLocalNotificationFromRemoteMessage } from './src/app/notifications/push';

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  await showLocalNotificationFromRemoteMessage(remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);

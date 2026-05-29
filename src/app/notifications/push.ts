import { PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

import { registerPushToken } from '../api/push';

export const ensureDefaultChannel = async (): Promise<void> => {
    if (Platform.OS !== 'android') return;
    await notifee.createChannel({
        id: 'default',
        name: 'Default',
        importance: AndroidImportance.HIGH,
    });
};

export const requestPushPermission = async (): Promise<void> => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    }

    // iOS permission prompt (no-op on Android)
    await messaging().requestPermission();
};

export const registerDeviceForPush = async (authToken: string): Promise<void> => {
    try {
        await requestPushPermission();
        await ensureDefaultChannel();

        await messaging().registerDeviceForRemoteMessages();
        const fcmToken = await messaging().getToken();

        if (!fcmToken) return;

        await registerPushToken(fcmToken, Platform.OS, authToken);
        console.log('✅ [Push] FCM token registered');
    } catch (err: any) {
        console.log('⚠️ [Push] registerDeviceForPush failed:', err?.message ?? err);
    }
};

export const showLocalNotificationFromRemoteMessage = async (remoteMessage: any): Promise<void> => {
    try {
        await ensureDefaultChannel();

        const title = remoteMessage?.notification?.title ?? 'Divino';
        const body = remoteMessage?.notification?.body ?? '';

        await notifee.displayNotification({
            title,
            body,
            android: {
                channelId: 'default',
                pressAction: { id: 'default' },
            },
        });
    } catch (err: any) {
        console.log('⚠️ [Push] display failed:', err?.message ?? err);
    }
};


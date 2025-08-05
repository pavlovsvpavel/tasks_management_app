import {useEffect} from 'react';
import {router} from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import {Platform} from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});


async function registerForPushNotificationsAsync() {
    if (Device.isDevice) {
        const {status: existingStatus} = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const {status} = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.warn('Notification permissions not granted!');
            return;
        }

        const token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log('Expo Push Token:', token);
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }
}


export const useNotifications = () => {
    useEffect(() => {
        registerForPushNotificationsAsync();

        const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            console.log("Notification response received:", data);
            if (data && data.url) {
                router.push(data.url as any);
            }
        });

        const notificationSubscription = Notifications.addNotificationReceivedListener(notification => {
            console.log('Notification received while app is foregrounded:', notification);
        });

        return () => {
            responseSubscription.remove();
            notificationSubscription.remove();
        };
    }, []);
};
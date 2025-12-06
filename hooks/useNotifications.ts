import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const { session } = useAuth();

  useEffect(() => {
    if (session?.user) {
      registerForPushNotificationsAsync().then(async (token) => {
        if (token) {
          setExpoPushToken(token);
          await savePushToken(token);
        }
      });

      notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('Notification response:', response);
      });

      return () => {
        if (notificationListener.current) {
          Notifications.removeNotificationSubscription(notificationListener.current);
        }
        if (responseListener.current) {
          Notifications.removeNotificationSubscription(responseListener.current);
        }
      };
    }
  }, [session?.user]);

  const savePushToken = async (token: string) => {
    if (!session?.user) return;

    try {
      const { error } = await supabase
        .from('push_tokens')
        .upsert(
          {
            user_id: session.user.id,
            expo_push_token: token,
            device_id: Device.modelName || 'unknown',
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'expo_push_token',
          }
        );

      if (error) {
        console.error('Error saving push token:', error);
      }
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  };

  const removePushToken = async () => {
    if (!expoPushToken || !session?.user) return;

    try {
      const { error } = await supabase
        .from('push_tokens')
        .delete()
        .eq('expo_push_token', expoPushToken)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error removing push token:', error);
      }
    } catch (error) {
      console.error('Error removing push token:', error);
    }
  };

  return {
    expoPushToken,
    notification,
    removePushToken,
  };
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'web') {
    console.log('Push notifications are not supported on web');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token || null;
}

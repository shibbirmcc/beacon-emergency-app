// Notification Service Interface for emergency notifications

import { EmergencyRequest, User, DatabaseResult } from '../types';
import PushNotification, { Importance } from 'react-native-push-notification';
import { Platform, PermissionsAndroid } from 'react-native';

export interface INotificationService {
  requestNotificationPermission(): Promise<boolean>;
  showEmergencyNotification(request: EmergencyRequest): Promise<DatabaseResult<boolean>>;
  showResponderNotification(responder: User): Promise<DatabaseResult<boolean>>;
  scheduleLocationUpdateNotification(): Promise<DatabaseResult<boolean>>;
  cancelAllNotifications(): Promise<DatabaseResult<boolean>>;
  areNotificationsEnabled(): Promise<boolean>;
  showLocalNotification(title: string, message: string): Promise<DatabaseResult<boolean>>;
}

/**
 * Real Notification Service Implementation using react-native-push-notification
 */
class NotificationServiceImpl implements INotificationService {
  private isInitialized: boolean = false;
  private permissionsGranted: boolean = false;

  constructor() {
    this.initializeNotifications();
  }

  private initializeNotifications(): void {
    if (this.isInitialized) return;

    PushNotification.configure({
      onRegister: (token: any) => {
        console.log('FCM Token:', token);
      },

      onNotification: (notification: any) => {
        console.log('Notification received:', notification);
        notification.finish && notification.finish();
      },

      onAction: (notification: any) => {
        console.log('Notification action:', notification.action);
      },

      onRegistrationError: (err: any) => {
        console.error('Notification registration error:', err.message);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    // Create default channel for Android
    PushNotification.createChannel(
      {
        channelId: 'emergency-channel',
        channelName: 'Emergency Notifications',
        channelDescription: 'Critical emergency notifications',
        playSound: true,
        soundName: 'default',
        importance: Importance.HIGH,
        vibrate: true,
      },
      (created: boolean) => console.log(`Emergency channel created: ${created}`)
    );

    PushNotification.createChannel(
      {
        channelId: 'general-channel',
        channelName: 'General Notifications',
        channelDescription: 'General app notifications',
        playSound: true,
        soundName: 'default',
        importance: Importance.DEFAULT,
        vibrate: false,
      },
      (created: boolean) => console.log(`General channel created: ${created}`)
    );

    this.isInitialized = true;
  }

  async requestNotificationPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        this.permissionsGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        return this.permissionsGranted;
      } else {
        // iOS permissions are requested automatically by PushNotification.configure
        this.permissionsGranted = true;
        return true;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async showEmergencyNotification(request: EmergencyRequest): Promise<DatabaseResult<boolean>> {
    try {
      if (!this.permissionsGranted) {
        return {
          success: false,
          error: 'Notification permissions not granted',
          data: false
        };
      }

      PushNotification.localNotification({
        channelId: 'emergency-channel',
        title: '🚨 Emergency Request',
        message: `Emergency at ${request.location?.lat}, ${request.location?.lon}`,
        playSound: true,
        soundName: 'default',
        importance: 'high',
        priority: 'high',
        largeIcon: 'ic_launcher',
        smallIcon: 'ic_notification',
        userInfo: { requestId: request.id },
        actions: ['Respond', 'Ignore'],
      });

      return { success: true, data: true };
    } catch (error) {
      return {
        success: false,
        error: `Failed to show emergency notification: ${error}`,
        data: false
      };
    }
  }

  async showResponderNotification(responder: User): Promise<DatabaseResult<boolean>> {
    try {
      if (!this.permissionsGranted) {
        return {
          success: false,
          error: 'Notification permissions not granted',
          data: false
        };
      }

      PushNotification.localNotification({
        channelId: 'general-channel',
        title: '✅ Responder En Route',
        message: `${responder.name} is coming to help you`,
        playSound: true,
        soundName: 'default',
        largeIcon: 'ic_launcher',
        smallIcon: 'ic_notification',
        userInfo: { responderId: responder.userId },
      });

      return { success: true, data: true };
    } catch (error) {
      return {
        success: false,
        error: `Failed to show responder notification: ${error}`,
        data: false
      };
    }
  }

  async scheduleLocationUpdateNotification(): Promise<DatabaseResult<boolean>> {
    try {
      if (!this.permissionsGranted) {
        return {
          success: false,
          error: 'Notification permissions not granted',
          data: false
        };
      }

      const now = new Date();
      const reminderTime = new Date(now.getTime() + 5 * 60 * 1000);

      PushNotification.localNotificationSchedule({
        channelId: 'general-channel',
        title: '📍 Location Update',
        message: 'Please update your location for emergency responders',
        date: reminderTime,
        repeatType: 'minute',
        repeatTime: 5,
      });

      return { success: true, data: true };
    } catch (error) {
      return {
        success: false,
        error: `Failed to schedule location notification: ${error}`,
        data: false
      };
    }
  }

  async cancelAllNotifications(): Promise<DatabaseResult<boolean>> {
    try {
      PushNotification.cancelAllLocalNotifications();
      return { success: true, data: true };
    } catch (error) {
      return {
        success: false,
        error: `Failed to cancel notifications: ${error}`,
        data: false
      };
    }
  }

  async areNotificationsEnabled(): Promise<boolean> {
    return Promise.resolve(this.permissionsGranted);
  }

  async showLocalNotification(title: string, message: string): Promise<DatabaseResult<boolean>> {
    try {
      if (!this.permissionsGranted) {
        return {
          success: false,
          error: 'Notification permissions not granted',
          data: false
        };
      }

      PushNotification.localNotification({
        channelId: 'general-channel',
        title,
        message,
        playSound: true,
        soundName: 'default',
        largeIcon: 'ic_launcher',
        smallIcon: 'ic_notification',
      });

      return { success: true, data: true };
    } catch (error) {
      return {
        success: false,
        error: `Failed to show notification: ${error}`,
        data: false
      };
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationServiceImpl();

// For testing purposes, also export the class
export { NotificationServiceImpl as NotificationService };

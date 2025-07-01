// Type definitions for React Native packages

// React Native core
declare module 'react-native' {
  export interface Platform {
    OS: 'ios' | 'android' | 'windows' | 'macos' | 'web';
    select<T>(config: { [key in typeof Platform.OS]?: T }): T | undefined;
  }

  export interface PermissionsAndroid {
    PERMISSIONS: {
      ACCESS_COARSE_LOCATION: string;
      ACCESS_FINE_LOCATION: string;
      POST_NOTIFICATIONS: string;
    };
    RESULTS: {
      GRANTED: string;
      DENIED: string;
      NEVER_ASK_AGAIN: string;
    };
    request(permission: string): Promise<string>;
    requestMultiple(permissions: string[]): Promise<Record<string, string>>;
  }

  export const Platform: Platform;
  export const PermissionsAndroid: PermissionsAndroid;
}

// Global React Native variables
declare global {
  const __DEV__: boolean;
  
  const process: {
    env: {
      NODE_ENV: 'development' | 'production' | 'test';
    };
  };
}

declare module 'react-native-push-notification' {
  export interface PushNotificationPermissions {
    alert?: boolean;
    badge?: boolean;
    sound?: boolean;
  }

  export interface PushNotificationConfiguration {
    onRegister?: (token: any) => void;
    onNotification?: (notification: any) => void;
    onAction?: (notification: any) => void;
    onRegistrationError?: (err: any) => void;
    permissions?: PushNotificationPermissions;
    popInitialNotification?: boolean;
    requestPermissions?: boolean;
  }

  export interface PushNotificationChannel {
    channelId: string;
    channelName: string;
    channelDescription?: string;
    playSound?: boolean;
    soundName?: string;
    importance?: Importance;
    vibrate?: boolean;
  }

  export interface LocalNotification {
    channelId?: string;
    title?: string;
    message?: string;
    playSound?: boolean;
    soundName?: string;
    importance?: string;
    priority?: string;
    largeIcon?: string;
    smallIcon?: string;
    userInfo?: any;
    actions?: string[];
    date?: Date;
    repeatType?: string;
    repeatTime?: number;
  }

  export enum Importance {
    DEFAULT = 'default',
    HIGH = 'high',
    LOW = 'low',
    MIN = 'min'
  }

  interface PushNotification {
    configure(options: PushNotificationConfiguration): void;
    createChannel(channel: PushNotificationChannel, callback?: (created: boolean) => void): void;
    localNotification(notification: LocalNotification): void;
    localNotificationSchedule(notification: LocalNotification): void;
    cancelAllLocalNotifications(): void;
  }

  const PushNotification: PushNotification;
  export default PushNotification;
  export { Importance };
}

declare module '@react-native-async-storage/async-storage' {
  interface AsyncStorageStatic {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    multiGet(keys: string[]): Promise<[string, string | null][]>;
    multiSet(keyValuePairs: [string, string][]): Promise<void>;
    multiRemove(keys: string[]): Promise<void>;
    clear(): Promise<void>;
    getAllKeys(): Promise<string[]>;
  }

  const AsyncStorage: AsyncStorageStatic;
  export default AsyncStorage;
}

declare module 'react-native-geolocation-service' {
  export interface Position {
    coords: {
      latitude: number;
      longitude: number;
      altitude: number | null;
      accuracy: number;
      altitudeAccuracy: number | null;
      heading: number | null;
      speed: number | null;
    };
    timestamp: number;
  }

  export interface PositionError {
    code: number;
    message: string;
    PERMISSION_DENIED: number;
    POSITION_UNAVAILABLE: number;
    TIMEOUT: number;
  }

  export interface GeolocationOptions {
    timeout?: number;
    maximumAge?: number;
    enableHighAccuracy?: boolean;
    distanceFilter?: number;
    forceRequestLocation?: boolean;
    showLocationDialog?: boolean;
    forceLocationManager?: boolean;
  }

  interface Geolocation {
    getCurrentPosition(
      success: (position: Position) => void,
      error?: (error: PositionError) => void,
      options?: GeolocationOptions
    ): void;

    watchPosition(
      success: (position: Position) => void,
      error?: (error: PositionError) => void,
      options?: GeolocationOptions
    ): number;

    clearWatch(watchId: number): void;
    stopObserving(): void;
  }

  const Geolocation: Geolocation;
  export default Geolocation;
}

declare module 'react-native-permissions' {
  export const PERMISSIONS: {
    ANDROID: {
      ACCESS_COARSE_LOCATION: string;
      ACCESS_FINE_LOCATION: string;
      POST_NOTIFICATIONS: string;
    };
    IOS: {
      LOCATION_WHEN_IN_USE: string;
      LOCATION_ALWAYS: string;
    };
  };

  export const RESULTS: {
    UNAVAILABLE: string;
    DENIED: string;
    LIMITED: string;
    GRANTED: string;
    BLOCKED: string;
  };

  export function check(permission: string): Promise<string>;
  export function request(permission: string): Promise<string>;
  export function checkMultiple(permissions: string[]): Promise<Record<string, string>>;
  export function requestMultiple(permissions: string[]): Promise<Record<string, string>>;
}

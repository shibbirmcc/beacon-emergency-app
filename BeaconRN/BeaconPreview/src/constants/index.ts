import { Location } from '../types';

// Environment configuration
const isDev = process.env.NODE_ENV === 'development';

export const Config = {
  // Sync Gateway URLs
  SYNC_GATEWAY_URL: isDev 
    ? 'ws://localhost:4984/beacon'
    : 'wss://beacon-sync.company.com/beacon',
  
  // Backend API URLs  
  API_BASE_URL: isDev
    ? 'http://localhost:5000'
    : 'https://beacon-api.company.com',
    
  // P2P Networking
  P2P_PORT: 55990,
  P2P_DISCOVERY_TIMEOUT: 30000, // 30 seconds
  
  // Default map region (Stockholm, Sweden)
  DEFAULT_MAP_REGION: {
    lat: 59.3293,
    lon: 18.0686,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  
  // Database configuration
  DATABASE_NAME: 'beacon',
  
  // Sync channels
  SYNC_CHANNELS: {
    EMERGENCY_REQUESTS: 'emergency_requests',
    STOCKHOLM_RESPONDERS: 'stockholm_responders',
    STOCKHOLM_REQUESTS: 'stockholm-requests',
  },
  
  // Location settings
  LOCATION_UPDATE_INTERVAL: 10000, // 10 seconds
  RESPONDER_SEARCH_RADIUS: 50, // 50 km default
  
  // Notification settings
  NOTIFICATION_TIMEOUT: 30000, // 30 seconds
  
  // App settings
  APP_NAME: 'Beacon Emergency',
  APP_VERSION: '1.0.0',
};

// Emergency types mapping
export const EMERGENCY_TYPES = [
  'Ambulance',
  'Doctor', 
  'Fire Truck',
  'Rescue Team',
  'Generator',
  'Water Supply'
] as const;

// App color palette
export const COLORS = {
  primary: '#2196F3',
  secondary: '#FFC107',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#00BCD4',
  light: '#F5F5F5',
  dark: '#212121',
  background: '#FFFFFF',
  surface: '#FAFAFA',
  text: '#212121',
  textSecondary: '#757575',
  disabled: '#BDBDBD',
  transparent: 'transparent',
  
  // Additional colors for UI components
  white: '#FFFFFF',
  black: '#000000',
  gray: '#9E9E9E',
  lightGray: '#E0E0E0',
  darkGray: '#424242',
};

// App spacing and sizes
export const SIZES = {
  base: 8,
  font: 14,
  radius: 8,
  padding: 16,
  margin: 16,
  
  // Font sizes
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  body: 16,
  body2: 15,
  body3: 14,
  body4: 12,
  caption: 12,
  
  // Component sizes
  buttonHeight: 48,
  inputHeight: 48,
  cardPadding: 16,
  iconSize: 24,
};

// User status colors
export const STATUS_COLORS = {
  available: COLORS.success,
  occupied: COLORS.error,
  unavailable: COLORS.disabled,
};

// Map marker colors
export const MARKER_COLORS = {
  user: COLORS.primary,
  responder: COLORS.success,
  emergency: COLORS.warning,
};

// Default user settings
export const DEFAULT_USER_PREFERENCES = {
  notificationsEnabled: true,
  locationSharingEnabled: true,
  emergencyRadius: 50,
  language: 'en',
};

// Network timeout settings
export const NETWORK_TIMEOUTS = {
  SYNC_GATEWAY_CONNECT: 10000,
  P2P_CONNECT: 5000,
  API_REQUEST: 15000,
  LOCATION_REQUEST: 10000,
};

// Error codes
export const ERROR_CODES = {
  // Database errors
  DB_INIT_FAILED: 'DB_INIT_FAILED',
  DB_SAVE_FAILED: 'DB_SAVE_FAILED',
  DB_QUERY_FAILED: 'DB_QUERY_FAILED',
  
  // Network errors
  SYNC_GATEWAY_CONNECTION_FAILED: 'SYNC_GATEWAY_CONNECTION_FAILED',
  P2P_CONNECTION_FAILED: 'P2P_CONNECTION_FAILED',
  API_REQUEST_FAILED: 'API_REQUEST_FAILED',
  
  // Location errors
  LOCATION_PERMISSION_DENIED: 'LOCATION_PERMISSION_DENIED',
  LOCATION_SERVICE_DISABLED: 'LOCATION_SERVICE_DISABLED',
  LOCATION_TIMEOUT: 'LOCATION_TIMEOUT',
  
  // Emergency request errors
  EMERGENCY_REQUEST_FAILED: 'EMERGENCY_REQUEST_FAILED',
  EMERGENCY_RESPONSE_FAILED: 'EMERGENCY_RESPONSE_FAILED',
  
  // User errors
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
};

// Application events
export const APP_EVENTS = {
  USER_LOCATION_UPDATED: 'USER_LOCATION_UPDATED',
  EMERGENCY_REQUEST_CREATED: 'EMERGENCY_REQUEST_CREATED',
  EMERGENCY_REQUEST_RESPONDED: 'EMERGENCY_REQUEST_RESPONDED',
  RESPONDER_STATUS_CHANGED: 'RESPONDER_STATUS_CHANGED',
  SYNC_STATUS_CHANGED: 'SYNC_STATUS_CHANGED',
  P2P_PEER_CONNECTED: 'P2P_PEER_CONNECTED',
  P2P_PEER_DISCONNECTED: 'P2P_PEER_DISCONNECTED',
};

// Core data types for Beacon Emergency App
// Based on the existing Android app's JSON schema

export interface Location {
  latitude: number;
  longitude: number;
  timestamp?: number;
}

// Legacy interface for backward compatibility
export interface LocationLegacy {
  lat: number;
  lon: number;
}

export type UserType = 'responder' | 'requester';
export type ResponderType = 'Ambulance' | 'Doctor' | 'Fire Truck' | 'Rescue Team' | 'Generator' | 'Water Supply';
export type UserStatus = 'available' | 'occupied' | 'unavailable';
export type EmergencyRequestStatus = 'open' | 'responded' | 'completed';

export interface User {
  id: string;
  type: 'user';
  userId: string;
  name: string;
  userType: UserType;
  responderType?: ResponderType;
  location: Location;
  status?: UserStatus;
  lastUpdated: string;
}

export interface UserCredentials {
  type: 'user_credentials';
  userId: string;
  username: string;
  password: string; // bcrypt-hashed
}

export interface EmergencyRequest {
  id: string;
  type: 'emergency_request';
  request_by: string;
  requested_at: string;
  status: EmergencyRequestStatus;
  responded_by?: string;
  responded_at?: string;
  emergency_type: ResponderType;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  notes_by_responder?: string;
  city?: string;
  location: Location;
  createdAt: string;
  updatedAt: string;
}

// App state interfaces for Redux store
export interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  userPreferences: UserPreferences;
}

export interface UserPreferences {
  notificationsEnabled: boolean;
  locationSharingEnabled: boolean;
  emergencyRadius: number; // in kilometers
  language: string;
}

export interface EmergencyState {
  activeRequests: EmergencyRequest[];
  completedRequests: EmergencyRequest[];
  nearbyResponders: User[];
  isCreatingRequest: boolean;
  lastRequestError: string | null;
}

export interface LocationState {
  currentLocation: Location | null;
  isLocationEnabled: boolean;
  isTracking: boolean;
  locationPermissionGranted: boolean;
  lastLocationUpdate: string | null;
}

export interface NetworkState {
  isOnline: boolean;
  isConnectedToSyncGateway: boolean;
  connectedPeers: string[];
  lastSyncTime: string | null;
  replicationStatus: ReplicationStatus;
}

export interface ReplicationStatus {
  syncGateway: {
    isActive: boolean;
    lastSync: string | null;
    error: string | null;
  };
  p2p: {
    isListening: boolean;
    connectedPeers: number;
    lastActivity: string | null;
  };
}

export interface AppState {
  user: UserState;
  emergency: EmergencyState;
  location: LocationState;
  network: NetworkState;
}

// Component prop interfaces
export interface MapViewProps {
  userLocation: Location | null;
  responders: User[];
  emergencyRequests: EmergencyRequest[];
  onMapPress?: (coordinate: Location) => void;
  onMarkerPress?: (markerId: string) => void;
}

export interface EmergencyRequestDialogProps {
  visible: boolean;
  onRequestType: (type: ResponderType) => void;
  onCancel: () => void;
}

export interface RequestListProps {
  requests: EmergencyRequest[];
  onRequestPress: (request: EmergencyRequest) => void;
  userType: UserType;
}

export interface ResponderCardProps {
  responder: User;
  distance: number;
  onContact: (responder: User) => void;
}

export interface StatusIndicatorProps {
  status: UserStatus;
  size?: 'small' | 'medium' | 'large';
}

export interface UserProfileHeaderProps {
  user: User;
  onEditProfile: () => void;
  onToggleStatus: () => void;
}

// Service interfaces
export interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ReplicationConfig {
  syncGatewayUrl: string;
  channels: string[];
  username?: string;
  password?: string;
}

export interface P2PConfig {
  port: number;
  peerDiscoveryEnabled: boolean;
  tlsCertificatePath?: string;
}

// Replication status types
export type ReplicationStatusType = 'stopped' | 'connecting' | 'connected' | 'syncing' | 'error';

// Navigation types
export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Map: undefined;
  Emergency: undefined;
  Profile: undefined;
};

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Utility types
export type Nullable<T> = T | null;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

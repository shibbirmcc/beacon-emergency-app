# React Native Migration Plan for Beacon Emergency App

## 📋 Overview
Converting the current Android Java app to React Native will enable cross-platform support (iOS + Android) while maintaining the offline-first, disaster-resilient architecture. This plan outlines a comprehensive 14-week migration strategy.

## 🎯 Goals
- ✅ **Cross-platform Support**: Single codebase for iOS and Android
- ✅ **Maintain Core Features**: Preserve all disaster-resilient capabilities
- ✅ **Improve Developer Experience**: Modern tooling and hot reload
- ✅ **Enhanced UI/UX**: Modern React Native components and animations
- ✅ **Better Maintainability**: Cleaner architecture and TypeScript support

---

## 📅 Migration Timeline (14 Weeks)

### Phase 1: Project Setup & Architecture (Week 1-2)

#### 1.1 Initialize React Native Project
- **Create new React Native project** with TypeScript template
- **Configure development environment** (Node.js, React Native CLI, Android Studio, Xcode)
- **Set up folder structure** following React Native best practices:

```
BeaconRN/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/          # Generic components
│   │   ├── map/             # Map-related components
│   │   └── emergency/       # Emergency-specific components
│   ├── screens/             # App screens
│   │   ├── MapScreen/
│   │   ├── OnboardingScreen/
│   │   └── EmergencyScreen/
│   ├── services/            # Business logic services
│   │   ├── DatabaseService.ts
│   │   ├── ReplicationService.ts
│   │   ├── LocationService.ts
│   │   └── NotificationService.ts
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Helper functions
│   ├── constants/           # App constants
│   └── navigation/          # Navigation configuration
├── android/                 # Android-specific code
├── ios/                     # iOS-specific code
├── assets/                  # Images, fonts, etc.
└── package.json
```

#### 1.2 Core Dependencies Installation
Install essential React Native packages:

```json
{
  "dependencies": {
    "react-native": "latest",
    "@react-navigation/native": "^6.0.0",
    "@react-navigation/stack": "^6.0.0",
    "@react-navigation/bottom-tabs": "^6.0.0",
    "react-native-maps": "^1.0.0",
    "@react-native-community/geolocation": "^3.0.0",
    "react-native-permissions": "^4.0.0",
    "@reduxjs/toolkit": "^2.0.0",
    "react-redux": "^9.0.0",
    "react-native-couchbase-lite": "^2.0.0",
    "react-native-tcp-socket": "^6.0.0",
    "react-native-elements": "^3.0.0",
    "react-native-vector-icons": "^10.0.0",
    "react-native-modal": "^13.0.0",
    "react-native-toast-message": "^2.0.0"
  },
  "devDependencies": {
    "@types/react-native": "latest",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "jest": "^29.0.0",
    "@testing-library/react-native": "^12.0.0"
  }
}
```

#### 1.3 TypeScript Interfaces
Define core data types based on current JSON schema:

```typescript
// src/types/index.ts

export interface Location {
  lat: number;
  lon: number;
}

export interface User {
  type: 'user';
  userId: string;
  name: string;
  userType: 'responder' | 'requester';
  responderType?: 'Ambulance' | 'Doctor' | 'Fire Truck' | 'Rescue Team' | 'Generator' | 'Water Supply';
  location: Location;
  status: 'available' | 'occupied' | 'unavailable';
  lastUpdated: string;
}

export interface UserCredentials {
  type: 'user_credentials';
  userId: string;
  username: string;
  password: string; // bcrypt-hashed
}

export interface EmergencyRequest {
  type: 'emergency_request';
  request_by: string;
  requested_at: string;
  status: 'open' | 'responded' | 'completed';
  responded_by?: string;
  responded_at?: string;
  emergency_type: 'Ambulance' | 'Doctor' | 'Fire Truck' | 'Rescue Team' | 'Generator' | 'Water Supply';
  notes_by_responder?: string;
}

export interface AppState {
  user: User | null;
  emergencyRequests: EmergencyRequest[];
  nearbyResponders: User[];
  isOnline: boolean;
  currentLocation: Location | null;
}
```

---

### Phase 2: Core Services Migration (Week 3-4)

#### 2.1 Database Service (`services/DatabaseService.ts`)
Implement Couchbase Lite wrapper with TypeScript:

```typescript
class DatabaseService {
  private database: any; // Couchbase Lite database instance
  
  async initializeDatabase(): Promise<void>
  async saveUser(user: User): Promise<void>
  async getUser(userId: string): Promise<User | null>
  async saveEmergencyRequest(request: EmergencyRequest): Promise<void>
  async getOpenEmergencyRequests(): Promise<EmergencyRequest[]>
  async updateEmergencyRequestStatus(requestId: string, status: string): Promise<void>
  async getNearbyResponders(location: Location, radius: number): Promise<User[]>
  async deleteAllDocuments(): Promise<void> // For testing
}
```

#### 2.2 Replication Service (`services/ReplicationService.ts`)
Handle all replication scenarios:

```typescript
class ReplicationService {
  private syncGatewayReplicator: any;
  private p2pReplicators: Map<string, any> = new Map();
  
  async startSyncGatewayReplication(): Promise<void>
  async stopSyncGatewayReplication(): Promise<void>
  async startP2PListener(): Promise<void>
  async connectToPeers(peerUris: string[]): Promise<void>
  async handleConflictResolution(conflict: any): Promise<any>
  onReplicationStatusChange(callback: (status: any) => void): void
}
```

#### 2.3 Location Service (`services/LocationService.ts`)
Manage GPS and location permissions:

```typescript
class LocationService {
  async requestLocationPermission(): Promise<boolean>
  async getCurrentLocation(): Promise<Location>
  async startLocationTracking(callback: (location: Location) => void): Promise<void>
  async stopLocationTracking(): Promise<void>
  calculateDistance(loc1: Location, loc2: Location): number
  async isLocationEnabled(): Promise<boolean>
}
```

#### 2.4 Notification Service (`services/NotificationService.ts`)
Handle emergency notifications:

```typescript
class NotificationService {
  async requestNotificationPermission(): Promise<boolean>
  async showEmergencyNotification(request: EmergencyRequest): Promise<void>
  async showResponderNotification(responder: User): Promise<void>
  async scheduleLocationUpdateNotification(): Promise<void>
}
```

---

### Phase 3: UI Components Development (Week 5-6)

#### 3.1 Map Component (`components/map/MapView.tsx`)
Core map functionality with Google Maps:

```typescript
interface MapViewProps {
  userLocation: Location | null;
  responders: User[];
  emergencyRequests: EmergencyRequest[];
  onMapPress?: (coordinate: Location) => void;
  onMarkerPress?: (markerId: string) => void;
}

const MapView: React.FC<MapViewProps> = ({
  userLocation,
  responders,
  emergencyRequests,
  onMapPress,
  onMarkerPress
}) => {
  // Implementation with react-native-maps
};
```

#### 3.2 Emergency Request Components

**Emergency Request Dialog** (`components/emergency/EmergencyRequestDialog.tsx`):
```typescript
interface EmergencyRequestDialogProps {
  visible: boolean;
  onRequestType: (type: string) => void;
  onCancel: () => void;
}
```

**Request List** (`components/emergency/RequestList.tsx`):
```typescript
interface RequestListProps {
  requests: EmergencyRequest[];
  onRequestPress: (request: EmergencyRequest) => void;
  userType: 'responder' | 'requester';
}
```

**Responder Card** (`components/emergency/ResponderCard.tsx`):
```typescript
interface ResponderCardProps {
  responder: User;
  distance: number;
  onContact: (responder: User) => void;
}
```

#### 3.3 Common UI Components

**Status Indicator** (`components/common/StatusIndicator.tsx`):
```typescript
interface StatusIndicatorProps {
  status: 'available' | 'occupied' | 'unavailable';
  size?: 'small' | 'medium' | 'large';
}
```

**User Profile Header** (`components/common/UserProfileHeader.tsx`):
```typescript
interface UserProfileHeaderProps {
  user: User;
  onEditProfile: () => void;
  onToggleStatus: () => void;
}
```

---

### Phase 4: Screen Implementation (Week 7-8)

#### 4.1 Main Map Screen (`screens/MapScreen/index.tsx`)
Primary app interface with role-based functionality:

```typescript
const MapScreen: React.FC = () => {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [nearbyResponders, setNearbyResponders] = useState<User[]>([]);
  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyRequest[]>([]);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  
  // User type determines UI behavior
  const user = useSelector((state: AppState) => state.user);
  const isResponder = user?.userType === 'responder';
  
  // Real-time location tracking
  useEffect(() => {
    LocationService.startLocationTracking(setUserLocation);
    return () => LocationService.stopLocationTracking();
  }, []);
  
  // Emergency request handling
  const handleEmergencyRequest = async (emergencyType: string) => {
    const request: EmergencyRequest = {
      type: 'emergency_request',
      request_by: user!.userId,
      requested_at: new Date().toISOString(),
      status: 'open',
      emergency_type: emergencyType as any
    };
    
    await DatabaseService.saveEmergencyRequest(request);
    setShowEmergencyDialog(false);
  };
  
  return (
    <View style={styles.container}>
      <MapView
        userLocation={userLocation}
        responders={nearbyResponders}
        emergencyRequests={emergencyRequests}
      />
      
      {!isResponder && (
        <FloatingActionButton
          onPress={() => setShowEmergencyDialog(true)}
          icon="emergency"
        />
      )}
      
      <EmergencyRequestDialog
        visible={showEmergencyDialog}
        onRequestType={handleEmergencyRequest}
        onCancel={() => setShowEmergencyDialog(false)}
      />
    </View>
  );
};
```

#### 4.2 Onboarding Screen (`screens/OnboardingScreen/index.tsx`)
User setup and permissions:

```typescript
const OnboardingScreen: React.FC = () => {
  const [userType, setUserType] = useState<'responder' | 'requester' | null>(null);
  const [responderType, setResponderType] = useState<string | null>(null);
  const [name, setName] = useState('');
  
  const handleComplete = async () => {
    // Request permissions
    await LocationService.requestLocationPermission();
    await NotificationService.requestNotificationPermission();
    
    // Create user profile
    const user: User = {
      type: 'user',
      userId: generateUserId(),
      name,
      userType: userType!,
      responderType: responderType || undefined,
      location: await LocationService.getCurrentLocation(),
      status: 'available',
      lastUpdated: new Date().toISOString()
    };
    
    await DatabaseService.saveUser(user);
    // Navigate to main app
  };
  
  return (
    <ScrollView style={styles.container}>
      {/* User type selection UI */}
      {/* Responder type selection (if responder) */}
      {/* Name input */}
      {/* Complete button */}
    </ScrollView>
  );
};
```

#### 4.3 Emergency Management Screen (`screens/EmergencyScreen/index.tsx`)
Request history and management:

```typescript
const EmergencyScreen: React.FC = () => {
  const [activeRequests, setActiveRequests] = useState<EmergencyRequest[]>([]);
  const [completedRequests, setCompletedRequests] = useState<EmergencyRequest[]>([]);
  
  return (
    <View style={styles.container}>
      <TabView>
        <TabView.Item title="Active">
          <RequestList
            requests={activeRequests}
            onRequestPress={handleRequestPress}
            userType={user?.userType || 'requester'}
          />
        </TabView.Item>
        
        <TabView.Item title="History">
          <RequestList
            requests={completedRequests}
            onRequestPress={handleRequestPress}
            userType={user?.userType || 'requester'}
          />
        </TabView.Item>
      </TabView>
    </View>
  );
};
```

---

### Phase 5: Native Module Bridges (Week 9-10)

#### 5.1 Couchbase Lite Bridge
Create native modules for platform-specific functionality:

**Android Bridge** (`android/app/src/main/java/com/beacon/CouchbaseLiteModule.java`):
```java
@ReactModule(name = "CouchbaseLite")
public class CouchbaseLiteModule extends ReactContextBaseJavaModule {
    private Database database;
    private Replicator replicator;
    
    @ReactMethod
    public void initializeDatabase(Promise promise) {
        // Initialize Couchbase Lite database
    }
    
    @ReactMethod
    public void startReplication(String endpoint, Promise promise) {
        // Start Sync Gateway replication
    }
    
    @ReactMethod
    public void saveDocument(ReadableMap document, Promise promise) {
        // Save document to local database
    }
}
```

**iOS Bridge** (`ios/BeaconRN/CouchbaseLiteModule.m`):
```objective-c
@interface CouchbaseLiteModule : NSObject <RCTBridgeModule>
@property (nonatomic, strong) CBLDatabase *database;
@property (nonatomic, strong) CBLReplicator *replicator;
@end

@implementation CouchbaseLiteModule

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(initializeDatabase:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    // Initialize Couchbase Lite database
}

@end
```

#### 5.2 P2P Networking Module
Handle TLS certificates and peer discovery:

```typescript
// src/services/P2PNetworkingService.ts
class P2PNetworkingService {
  async createServerIdentity(): Promise<string>
  async createClientIdentity(): Promise<string>
  async startP2PListener(port: number): Promise<void>
  async discoverNearbyPeers(): Promise<string[]>
  async connectToPeer(peerAddress: string): Promise<void>
}
```

---

### Phase 6: Testing & Optimization (Week 11-12)

#### 6.1 Unit Testing
Test core functionality with Jest and React Native Testing Library:

```typescript
// __tests__/services/DatabaseService.test.ts
describe('DatabaseService', () => {
  test('should save and retrieve user', async () => {
    const user: User = createMockUser();
    await DatabaseService.saveUser(user);
    const retrievedUser = await DatabaseService.getUser(user.userId);
    expect(retrievedUser).toEqual(user);
  });
});

// __tests__/components/MapView.test.tsx
describe('MapView', () => {
  test('should render markers for responders', () => {
    const responders = [createMockResponder()];
    const { getByTestId } = render(
      <MapView responders={responders} userLocation={null} emergencyRequests={[]} />
    );
    expect(getByTestId('responder-marker')).toBeTruthy();
  });
});
```

#### 6.2 Integration Testing
Test end-to-end emergency request flow:

```typescript
// __tests__/integration/EmergencyFlow.test.ts
describe('Emergency Request Flow', () => {
  test('should create request and notify responders', async () => {
    // Setup: Create requester and responder
    // Action: Create emergency request
    // Verify: Responder receives notification
    // Verify: Request appears in database
  });
});
```

#### 6.3 Performance Testing
- **Memory Usage**: Monitor memory consumption during map rendering
- **Battery Optimization**: Test background location tracking efficiency
- **Database Performance**: Query performance with large datasets
- **Network Efficiency**: Replication bandwidth usage

---

### Phase 7: Deployment Preparation (Week 13-14)

#### 7.1 Build Configuration

**Android Configuration** (`android/app/build.gradle`):
```gradle
android {
    compileSdkVersion 34
    
    defaultConfig {
        applicationId "com.beacon.emergency"
        minSdkVersion 21
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
    
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

**iOS Configuration** (`ios/BeaconRN/Info.plist`):
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Beacon needs location access to show nearby emergency responders</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Beacon needs background location to provide emergency services</string>
```

#### 7.2 Environment Configuration
```typescript
// src/constants/config.ts
export const Config = {
  SYNC_GATEWAY_URL: __DEV__ 
    ? 'ws://localhost:4984/beacon'
    : 'wss://beacon-sync.company.com/beacon',
  
  API_BASE_URL: __DEV__
    ? 'http://localhost:5000'
    : 'https://beacon-api.company.com',
    
  P2P_PORT: 55990,
  DEFAULT_MAP_REGION: {
    latitude: 59.3293,  // Stockholm
    longitude: 18.0686,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
};
```

#### 7.3 App Store Preparation
- **App Store Connect** setup for iOS
- **Google Play Console** setup for Android
- **Screenshots** for different device sizes
- **App descriptions** emphasizing emergency and offline capabilities
- **Privacy policy** covering location data and offline storage

---

## 🔧 Key Technical Considerations

### React Native Specific Challenges

#### 1. **Couchbase Lite Integration**
- **Challenge**: Limited React Native support for Couchbase Lite
- **Solution**: Create custom native modules for both platforms
- **Alternative**: Consider using SQLite with custom sync logic

#### 2. **P2P Networking**
- **Challenge**: Complex TLS certificate management
- **Solution**: Native modules for certificate generation and peer discovery
- **Testing**: Extensive testing in various network conditions

#### 3. **Background Processing**
- **Challenge**: iOS restrictions on background tasks
- **Solution**: Use Background App Refresh and location updates strategically
- **Android**: Foreground services for continuous location tracking

#### 4. **Large Dataset Handling**
- **Challenge**: Rendering many map markers efficiently
- **Solution**: Implement marker clustering and viewport-based rendering
- **Optimization**: Virtual scrolling for request lists

### Architecture Decisions

#### State Management
```typescript
// Redux store structure
interface RootState {
  user: UserState;
  emergency: EmergencyState;
  location: LocationState;
  network: NetworkState;
  replication: ReplicationState;
}
```

#### Navigation Structure
```typescript
// Navigation hierarchy
const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Main" component={MainTabNavigator} />
    </Stack.Navigator>
  </NavigationContainer>
);

const MainTabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="Map" component={MapScreen} />
    <Tab.Screen name="Emergency" component={EmergencyScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);
```

#### Error Handling Strategy
```typescript
// Global error boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to crash reporting service
    // Show user-friendly error message
    // Attempt graceful recovery
  }
}
```

---

## 📈 Migration Benefits

### Development Benefits
- ✅ **Single Codebase**: Maintain iOS and Android from one source
- ✅ **Hot Reload**: Faster development iteration
- ✅ **TypeScript**: Better type safety and developer experience
- ✅ **Modern Tooling**: Jest testing, ESLint, Prettier
- ✅ **Community**: Large ecosystem of React Native packages

### User Benefits
- ✅ **iOS Support**: Reach iOS users with native performance
- ✅ **Consistent UX**: Unified experience across platforms
- ✅ **Modern UI**: Updated design with smooth animations
- ✅ **Better Performance**: Optimized rendering and memory usage

### Business Benefits
- ✅ **Reduced Development Cost**: Single team for both platforms
- ✅ **Faster Feature Delivery**: Simultaneous iOS/Android releases
- ✅ **Easier Maintenance**: Unified codebase and deployment
- ✅ **Better Testing**: Comprehensive testing across platforms

---

## 🎯 Success Metrics

### Technical Metrics
- **Performance**: App startup time < 3 seconds
- **Memory**: Memory usage < 100MB during normal operation
- **Battery**: Background location tracking < 5% battery drain/hour
- **Offline**: Full functionality without network for 24+ hours

### User Experience Metrics
- **Response Time**: Emergency request creation < 2 seconds
- **Reliability**: 99.9% uptime for core offline functionality
- **Sync Performance**: Data sync within 30 seconds when online
- **Cross-platform**: Feature parity between iOS and Android

### Business Metrics
- **Development Speed**: 50% faster feature development vs native
- **Bug Reduction**: 60% fewer platform-specific bugs
- **Code Reuse**: 90%+ code sharing between platforms
- **Maintenance**: 40% reduction in maintenance overhead

---

## 📅 Estimated Timeline: 14 Weeks

This comprehensive plan maintains all disaster-resilient features while modernizing the technology stack for better cross-platform support, improved developer experience, and enhanced user interface capabilities.

## 🚀 Next Steps

1. **Stakeholder Approval**: Review plan with development team and stakeholders
2. **Environment Setup**: Prepare development environments and tools
3. **Resource Allocation**: Assign team members to specific phases
4. **Risk Assessment**: Identify potential blockers and mitigation strategies
5. **Phase 1 Kickoff**: Begin with project setup and architecture foundation

---

*This migration plan ensures the Beacon Emergency App maintains its core mission of disaster-resilient emergency response while expanding to serve both iOS and Android users with a modern, maintainable codebase.*

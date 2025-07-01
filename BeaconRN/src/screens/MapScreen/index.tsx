import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import {
  setCurrentLocation,
  setLocationError,
  setTracking,
} from '../../store/slices/locationSlice';
import {
  setNearbyResponders,
  addEmergencyRequest,
  setRequestError,
  setCreatingRequest,
} from '../../store/slices/emergencySlice';
import { updateUserLocation } from '../../store/slices/userSlice';

// Components
import {
  MapView,
  EmergencyRequestDialog,
  FloatingActionButton,
  Loading,
  ErrorMessage,
  UserProfileHeader,
} from '../../components';

// Services
import { LocationService } from '../../services/LocationService';
import { DatabaseService } from '../../services/DatabaseService';
import { notificationService } from '../../services/NotificationService';

// Types and Constants
import { Location, EmergencyRequest, User } from '../../types';
import { COLORS, SIZES } from '../../constants';

const MapScreen: React.FC = () => {
  // Redux state
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { currentLocation, isTracking } = useSelector((state: RootState) => state.location);
  const { nearbyResponders, isCreatingRequest } = useSelector((state: RootState) => state.emergency);
  const { isOnline } = useSelector((state: RootState) => state.network);

  // Local state
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileHeader, setShowProfileHeader] = useState(false);

  // Derived state
  const isResponder = currentUser?.userType === 'responder';
  const isUserAvailable = currentUser?.status === 'available';

  // Initialize location tracking
  useEffect(() => {
    initializeLocationTracking();
    loadEmergencyRequests();
    
    return () => {
      LocationService.stopLocationTracking();
    };
  }, []);

  // Load nearby responders when location changes
  useEffect(() => {
    if (currentLocation && isUserAvailable) {
      loadNearbyResponders();
    }
  }, [currentLocation, isUserAvailable]);

  const initializeLocationTracking = async () => {
    try {
      setIsLoading(true);
      
      // Check permissions
      const hasPermission = await LocationService.requestLocationPermission();
      if (!hasPermission) {
        dispatch(setLocationError('Location permission is required to use the app'));
        return;
      }

      // Start location tracking
      await LocationService.startLocationTracking(handleLocationUpdate);
      dispatch(setTracking(true));
      
    } catch (error) {
      console.error('Failed to initialize location tracking:', error);
      dispatch(setLocationError('Failed to start location tracking'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationUpdate = useCallback((location: Location) => {
    dispatch(setCurrentLocation(location));
    
    // Update user location in Redux and database
    if (currentUser) {
      dispatch(updateUserLocation({
        latitude: location.latitude,
        longitude: location.longitude,
      }));
      
      // Save to database
      DatabaseService.saveUser({
        ...currentUser,
        location,
        lastUpdated: new Date().toISOString(),
      }).catch(console.error);
    }
  }, [dispatch, currentUser]);

  const loadEmergencyRequests = async () => {
    try {
      const requests = await DatabaseService.getOpenEmergencyRequests();
      setEmergencyRequests(requests);
    } catch (error) {
      console.error('Failed to load emergency requests:', error);
    }
  };

  const loadNearbyResponders = async () => {
    if (!currentLocation) return;
    
    try {
      const responders = await DatabaseService.getNearbyResponders(
        currentLocation,
        50 // 50km radius
      );
      dispatch(setNearbyResponders(responders));
    } catch (error) {
      console.error('Failed to load nearby responders:', error);
    }
  };

  const handleEmergencyRequest = async (
    emergencyType: string,
    priority: string,
    notes?: string
  ) => {
    if (!currentUser || !currentLocation) {
      Alert.alert('Error', 'User location is required to create an emergency request');
      return;
    }

    try {
      dispatch(setCreatingRequest(true));

      const request: EmergencyRequest = {
        id: `emergency_${Date.now()}_${currentUser.userId}`,
        type: 'emergency_request',
        request_by: currentUser.userId,
        requested_at: new Date().toISOString(),
        status: 'open',
        emergency_type: emergencyType as any,
        priority: priority as any,
        notes_by_responder: notes,
        location: currentLocation,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to database
      await DatabaseService.saveEmergencyRequest(request);
      
      // Update Redux state
      dispatch(addEmergencyRequest(request));
      setEmergencyRequests(prev => [request, ...prev]);
      
      // Send notifications to nearby responders
      if (isOnline && nearbyResponders.length > 0) {
        notificationService.showEmergencyNotification(request);
      }
      
      setShowEmergencyDialog(false);
      Alert.alert('Emergency Request Sent', 'Your emergency request has been sent to nearby responders.');
      
    } catch (error) {
      console.error('Failed to create emergency request:', error);
      dispatch(setRequestError('Failed to send emergency request. Please try again.'));
      Alert.alert('Error', 'Failed to send emergency request. Please try again.');
    }
  };

  const handleMapPress = (coordinate: Location) => {
    // Handle map press if needed
    console.log('Map pressed at:', coordinate);
  };

  const handleMarkerPress = (markerId: string) => {
    console.log('Marker pressed:', markerId);
    // Handle marker press - could show responder details or request details
  };

  const handleProfileHeaderToggle = () => {
    setShowProfileHeader(!showProfileHeader);
  };

  const handleEditProfile = () => {
    // Navigate to profile edit screen
    console.log('Edit profile pressed');
  };

  const handleToggleStatus = () => {
    // Toggle user availability status
    if (currentUser?.userType === 'responder') {
      const newStatus = currentUser.status === 'available' ? 'unavailable' : 'available';
      // Dispatch status update
      console.log('Toggle status to:', newStatus);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Loading message="Initializing location services..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      {/* Profile Header - Toggle visibility */}
      {showProfileHeader && currentUser && (
        <View style={styles.profileHeader}>
          <UserProfileHeader
            user={currentUser}
            onEditProfile={handleEditProfile}
            onToggleStatus={handleToggleStatus}
            compact={true}
          />
        </View>
      )}

      {/* Main Map View */}
      <View style={styles.mapContainer}>
        <MapView
          userLocation={currentLocation}
          responders={nearbyResponders}
          emergencyRequests={emergencyRequests}
          onMapPress={handleMapPress}
          onMarkerPress={handleMarkerPress}
          showUserLocation={true}
          followUserLocation={isTracking}
        />
      </View>

      {/* Profile Toggle Button */}
      <View style={styles.profileToggle}>
        <FloatingActionButton
          onPress={handleProfileHeaderToggle}
          icon="👤"
          size="small"
          position="bottom-left"
        />
      </View>

      {/* Emergency Action Button - Only for requesters */}
      {!isResponder && (
        <FloatingActionButton
          onPress={() => setShowEmergencyDialog(true)}
          icon="🚨"
          title="EMERGENCY"
          disabled={!currentLocation || isCreatingRequest}
          position="bottom-right"
        />
      )}

      {/* Emergency Request Dialog */}
      <EmergencyRequestDialog
        visible={showEmergencyDialog}
        onRequestType={handleEmergencyRequest}
        onCancel={() => setShowEmergencyDialog(false)}
        userLocation={currentLocation}
      />

      {/* Loading overlay for creating request */}
      {isCreatingRequest && (
        <Loading
          message="Sending emergency request..."
          overlay={true}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  profileHeader: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
    zIndex: 100,
  },
  mapContainer: {
    flex: 1,
  },
  profileToggle: {
    position: 'absolute',
    bottom: SIZES.padding,
    left: SIZES.padding,
    zIndex: 999,
  },
});

export default MapScreen;

import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import MapViewComponent, { 
  Marker, 
  PROVIDER_GOOGLE, 
  Region,
  LatLng 
} from 'react-native-maps';
import { Location, User, EmergencyRequest } from '../../types';
import { COLORS } from '../../constants';

interface MapViewProps {
  userLocation: Location | null;
  responders: User[];
  emergencyRequests: EmergencyRequest[];
  onMapPress?: (coordinate: Location) => void;
  onMarkerPress?: (markerId: string) => void;
  showUserLocation?: boolean;
  followUserLocation?: boolean;
}

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const MapView: React.FC<MapViewProps> = ({
  userLocation,
  responders,
  emergencyRequests,
  onMapPress,
  onMarkerPress,
  showUserLocation = true,
  followUserLocation = true
}) => {
  const mapRef = useRef<MapViewComponent>(null);

  // Center map on user location when it changes
  useEffect(() => {
    if (userLocation && followUserLocation && mapRef.current) {
      const region: Region = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };
      mapRef.current.animateToRegion(region, 1000);
    }
  }, [userLocation, followUserLocation]);

  const handleMapPress = (event: any) => {
    if (onMapPress) {
      const { coordinate } = event.nativeEvent;
      onMapPress({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        timestamp: Date.now()
      });
    }
  };

  const handleMarkerPress = (markerId: string) => {
    if (onMarkerPress) {
      onMarkerPress(markerId);
    }
  };

  const getMarkerColor = (userType: string, status: string): string => {
    if (userType === 'responder') {
      switch (status) {
        case 'available':
          return COLORS.success;
        case 'occupied':
          return COLORS.warning;
        case 'unavailable':
          return COLORS.error;
        default:
          return COLORS.primary;
      }
    }
    return COLORS.primary;
  };

  const getEmergencyMarkerColor = (priority: string): string => {
    switch (priority) {
      case 'critical':
        return COLORS.error;
      case 'high':
        return COLORS.warning;
      case 'medium':
        return COLORS.info;
      case 'low':
        return COLORS.success;
      default:
        return COLORS.primary;
    }
  };

  const initialRegion: Region = userLocation ? {
    latitude: userLocation.latitude,
    longitude: userLocation.longitude,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  } : {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  };

  return (
    <View style={styles.container}>
      <MapViewComponent
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        onPress={handleMapPress}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        rotateEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
      >
        {/* User Location Marker */}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Your Location"
            pinColor={COLORS.primary}
            onPress={() => handleMarkerPress('user-location')}
          />
        )}

        {/* Responder Markers */}
        {responders.map((responder) => (
          <Marker
            key={responder.id}
            coordinate={{
              latitude: responder.location.latitude,
              longitude: responder.location.longitude,
            }}
            title={`${responder.name} (${responder.userType})`}
            description={`Status: ${responder.status || 'available'}`}
            pinColor={getMarkerColor(responder.userType, responder.status || 'available')}
            onPress={() => handleMarkerPress(responder.id)}
          />
        ))}

        {/* Emergency Request Markers */}
        {emergencyRequests.map((request) => (
          <Marker
            key={request.id}
            coordinate={{
              latitude: request.location.latitude,
              longitude: request.location.longitude,
            }}
            title={`Emergency: ${request.type}`}
            description={`Priority: ${request.priority || 'medium'}`}
            pinColor={getEmergencyMarkerColor(request.priority || 'medium')}
            onPress={() => handleMarkerPress(request.id)}
          />
        ))}
      </MapViewComponent>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default MapView;

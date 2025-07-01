import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { EmergencyRequest, ResponderType, User } from '../types';
import { COLORS, SIZES, EMERGENCY_TYPES } from '../constants';

const MapScreen: React.FC = () => {
  // Mock user data for demo
  const [currentUser] = useState<User>({
    id: 'user_1',
    type: 'user',
    userId: 'user_1',
    name: 'John Doe',
    userType: 'requester',
    location: { latitude: 59.3293, longitude: 18.0686 },
    status: 'available',
    lastUpdated: new Date().toISOString(),
  });

  const [activeRequests, setActiveRequests] = useState<EmergencyRequest[]>([]);
  const [nearbyResponders, setNearbyResponders] = useState<User[]>([]);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);

  // Simulate nearby responders
  useEffect(() => {
    const mockResponders: User[] = [
      {
        id: 'resp_1',
        type: 'user',
        userId: 'resp_1',
        name: 'Dr. Sarah Johnson',
        userType: 'responder',
        responderType: 'Doctor',
        location: { latitude: 59.3295, longitude: 18.0689 },
        status: 'available',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'resp_2',
        type: 'user',
        userId: 'resp_2',
        name: 'Ambulance Unit 5',
        userType: 'responder',
        responderType: 'Ambulance',
        location: { latitude: 59.3290, longitude: 18.0683 },
        status: 'available',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'resp_3',
        type: 'user',
        userId: 'resp_3',
        name: 'Fire Station Central',
        userType: 'responder',
        responderType: 'Fire Truck',
        location: { latitude: 59.3297, longitude: 18.0692 },
        status: 'occupied',
        lastUpdated: new Date().toISOString(),
      },
    ];
    setNearbyResponders(mockResponders);
  }, []);

  const handleEmergencyRequest = (emergencyType: ResponderType) => {
    if (!currentUser) return;

    const request: EmergencyRequest = {
      id: `req_${Date.now()}`,
      type: 'emergency_request',
      request_by: currentUser.userId,
      requested_at: new Date().toISOString(),
      status: 'open',
      emergency_type: emergencyType,
      priority: 'high',
      location: currentUser.location,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setActiveRequests(prev => [...prev, request]);
    setShowEmergencyDialog(false);
    
    Alert.alert(
      'Emergency Request Sent',
      `Your ${emergencyType} request has been sent to nearby responders.`,
      [{ text: 'OK' }]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return COLORS.success;
      case 'occupied':
        return COLORS.warning;
      case 'unavailable':
        return COLORS.error;
      default:
        return COLORS.gray;
    }
  };

  return (
    <View style={styles.container}>
      {/* Map placeholder */}
      <View style={styles.mapContainer}>
        <Text style={styles.mapTitle}>🗺️ Emergency Map View</Text>
        <Text style={styles.mapSubtitle}>
          Stockholm, Sweden {'\n'}
          Lat: 59.3293, Lon: 18.0686
        </Text>
        
        {/* Mock map markers */}
        <View style={styles.markersContainer}>
          <View style={styles.marker}>
            <Text style={styles.markerText}>📍 You</Text>
          </View>
          
          {nearbyResponders.map((responder) => (
            <View key={responder.id} style={styles.marker}>
              <Text style={styles.markerText}>
                {responder.responderType === 'Doctor' ? '👨‍⚕️' :
                 responder.responderType === 'Ambulance' ? '🚑' :
                 responder.responderType === 'Fire Truck' ? '🚒' : '🚨'}
              </Text>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: getStatusColor(responder.status || 'available') },
                ]}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Emergency action section */}
      <View style={styles.actionSection}>
        <Text style={styles.sectionTitle}>
          {currentUser?.userType === 'responder' 
            ? 'Monitor Emergency Requests' 
            : 'Request Emergency Help'
          }
        </Text>

        {currentUser?.userType === 'responder' ? (
          <View style={styles.responderInfo}>
            <Text style={styles.responderStatus}>
              Status: {currentUser.status || 'available'}
            </Text>
            <Text style={styles.activeRequests}>
              Active Requests: {activeRequests.length}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={() => setShowEmergencyDialog(true)}
          >
            <Text style={styles.emergencyButtonText}>🚨 Request Help</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Nearby responders */}
      <ScrollView style={styles.respondersSection}>
        <Text style={styles.sectionTitle}>Nearby Responders</Text>
        {nearbyResponders.map((responder) => (
          <View key={responder.id} style={styles.responderCard}>
            <View style={styles.responderInfo}>
              <Text style={styles.responderName}>{responder.name}</Text>
              <Text style={styles.responderType}>
                {responder.responderType}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(responder.status || 'available') },
              ]}
            >
              <Text style={styles.statusText}>
                {responder.status || 'available'}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Emergency type selection dialog */}
      {showEmergencyDialog && (
        <View style={styles.dialogOverlay}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Select Emergency Type</Text>
            <ScrollView style={styles.emergencyTypes}>
              {EMERGENCY_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.emergencyType}
                  onPress={() => handleEmergencyRequest(type)}
                >
                  <Text style={styles.emergencyTypeText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowEmergencyDialog(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
    margin: SIZES.padding,
    borderRadius: SIZES.radius,
    position: 'relative',
  },
  mapTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  mapSubtitle: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  markersContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
  },
  marker: {
    position: 'absolute',
    alignItems: 'center',
  },
  markerText: {
    fontSize: 20,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 2,
  },
  actionSection: {
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  sectionTitle: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  emergencyButton: {
    height: SIZES.buttonHeight,
    backgroundColor: COLORS.error,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyButtonText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.white,
  },
  responderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  responderStatus: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
  },
  activeRequests: {
    fontSize: SIZES.body2,
    color: COLORS.primary,
    fontWeight: '600',
  },
  respondersSection: {
    maxHeight: 200,
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
  },
  responderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  responderName: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.text,
  },
  responderType: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: SIZES.base,
    paddingVertical: 4,
    borderRadius: SIZES.radius / 2,
  },
  statusText: {
    fontSize: SIZES.caption,
    color: COLORS.white,
    fontWeight: '600',
  },
  dialogOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.black + '50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    margin: SIZES.padding,
    maxHeight: '80%',
    minWidth: '80%',
  },
  dialogTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.padding,
  },
  emergencyTypes: {
    maxHeight: 200,
  },
  emergencyType: {
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  emergencyTypeText: {
    fontSize: SIZES.body,
    color: COLORS.text,
  },
  cancelButton: {
    marginTop: SIZES.padding,
    padding: SIZES.padding,
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: SIZES.body,
    color: COLORS.text,
  },
});

export default MapScreen;

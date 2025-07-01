import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { COLORS, SIZES } from '../constants';

const MapScreen: React.FC = () => {
  const user = useSelector((state: RootState) => state.user.currentUser);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);

  const handleEmergencyRequest = (type: string) => {
    // This would normally create an emergency request
    alert(`Emergency request for ${type} created!`);
    setShowEmergencyDialog(false);
  };

  const isResponder = user?.userType === 'responder';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🗺️ Emergency Map</Text>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, { backgroundColor: COLORS.success }]} />
          <Text style={styles.statusText}>Online</Text>
        </View>
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapText}>🗺️</Text>
          <Text style={styles.mapLabel}>Interactive Map</Text>
          <Text style={styles.mapSubtitle}>
            Shows real-time locations of emergency responders and requests
          </Text>
          
          {/* Mock markers */}
          <View style={styles.markersContainer}>
            <View style={[styles.marker, { backgroundColor: COLORS.primary }]}>
              <Text style={styles.markerText}>🚑</Text>
            </View>
            <View style={[styles.marker, { backgroundColor: COLORS.secondary }]}>
              <Text style={styles.markerText}>👤</Text>
            </View>
            <View style={[styles.marker, { backgroundColor: COLORS.warning }]}>
              <Text style={styles.markerText}>🚨</Text>
            </View>
          </View>
        </View>
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <Text style={styles.userRole}>
          {isResponder ? '🚑 Responder' : '🙋‍♂️ Requester'} - {user?.name}
        </Text>
        {isResponder && (
          <Text style={styles.responderType}>
            Type: {user?.responderType}
          </Text>
        )}
      </View>

      {/* Emergency Button for Requesters */}
      {!isResponder && (
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={() => setShowEmergencyDialog(true)}
        >
          <Text style={styles.emergencyButtonText}>🚨 Request Emergency Help</Text>
        </TouchableOpacity>
      )}

      {/* Responder Status for Responders */}
      {isResponder && (
        <View style={styles.responderPanel}>
          <Text style={styles.panelTitle}>Responder Status</Text>
          <TouchableOpacity style={styles.statusButton}>
            <Text style={styles.statusButtonText}>✅ Available</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Emergency Request Dialog */}
      {showEmergencyDialog && (
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Request Emergency Help</Text>
            <ScrollView style={styles.emergencyTypes}>
              {['Ambulance', 'Doctor', 'Fire Truck', 'Rescue Team', 'Generator', 'Water Supply'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.emergencyTypeButton}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
  },
  mapContainer: {
    flex: 1,
    margin: SIZES.padding,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  mapText: {
    fontSize: 60,
    marginBottom: 10,
  },
  mapLabel: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  mapSubtitle: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  markersContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  marker: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  markerText: {
    fontSize: 20,
  },
  userInfo: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    marginHorizontal: SIZES.padding,
    marginBottom: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  userRole: {
    fontSize: SIZES.h5,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  responderType: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  emergencyButton: {
    backgroundColor: COLORS.primary,
    margin: SIZES.padding,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  emergencyButtonText: {
    color: COLORS.white,
    fontSize: SIZES.h5,
    fontWeight: 'bold',
  },
  responderPanel: {
    backgroundColor: COLORS.white,
    margin: SIZES.padding,
    padding: SIZES.padding,
    borderRadius: 12,
    alignItems: 'center',
  },
  panelTitle: {
    fontSize: SIZES.h5,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  statusButton: {
    backgroundColor: COLORS.success,
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  statusButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body1,
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    backgroundColor: COLORS.white,
    margin: SIZES.padding,
    padding: SIZES.padding,
    borderRadius: 12,
    width: '80%',
    maxHeight: '60%',
  },
  dialogTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  emergencyTypes: {
    maxHeight: 200,
  },
  emergencyTypeButton: {
    backgroundColor: COLORS.lightGray,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  emergencyTypeText: {
    fontSize: SIZES.body1,
    color: COLORS.text,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: COLORS.gray,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body1,
  },
});

export default MapScreen;

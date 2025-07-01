import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
  Switch,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

// Redux actions
import { setUser, updateUserLocation } from '../../store/slices/userSlice';

// Services
import { LocationService } from '../../services/LocationService';
import { DatabaseService } from '../../services/DatabaseService';

// Components
import {
  UserProfileHeader,
  StatusIndicator,
  Loading,
  ErrorMessage,
} from '../../components';

// Types and Constants
import { User, ResponderType, UserStatus } from '../../types';
import { COLORS, SIZES } from '../../constants';
import { RootState } from '../../store';

const ProfileScreen: React.FC = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.user.user);
  
  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedName, setEditedName] = useState(currentUser?.name || '');
  const [editedResponderType, setEditedResponderType] = useState<ResponderType | undefined>(
    currentUser?.responderType
  );
  const [isLocationTracking, setIsLocationTracking] = useState(true);

  // Status options for responders
  const statusOptions: UserStatus[] = ['available', 'occupied', 'unavailable'];
  const responderTypeOptions: ResponderType[] = [
    'Ambulance',
    'Doctor', 
    'Fire Truck',
    'Rescue Team',
    'Generator',
    'Water Supply'
  ];

  useEffect(() => {
    if (currentUser) {
      setEditedName(currentUser.name);
      setEditedResponderType(currentUser.responderType);
    }
  }, [currentUser]);

  const handleSaveProfile = async () => {
    if (!currentUser || !editedName.trim()) {
      setError('Name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updatedUser: User = {
        ...currentUser,
        name: editedName.trim(),
        responderType: currentUser.userType === 'responder' ? editedResponderType : undefined,
        lastUpdated: new Date().toISOString(),
      };

      const result = await DatabaseService.saveUser(updatedUser);
      
      if (result.success) {
        dispatch(setUser(updatedUser));
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (newStatus: UserStatus) => {
    if (!currentUser || currentUser.userType !== 'responder') return;

    setIsLoading(true);
    setError(null);

    try {
      const updatedUser: User = {
        ...currentUser,
        status: newStatus,
        lastUpdated: new Date().toISOString(),
      };

      const result = await DatabaseService.saveUser(updatedUser);
      
      if (result.success) {
        dispatch(setUser(updatedUser));
        Alert.alert('Status Updated', `Status changed to ${newStatus}`);
      } else {
        setError(result.error || 'Failed to update status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLocation = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    setError(null);

    try {
      const locationResult = await LocationService.getCurrentLocation();
      
      if (!locationResult.success || !locationResult.data) {
        setError('Failed to get current location');
        return;
      }

      const updatedUser: User = {
        ...currentUser,
        location: locationResult.data,
        lastUpdated: new Date().toISOString(),
      };

      const result = await DatabaseService.saveUser(updatedUser);
      
      if (result.success) {
        dispatch(setUser(updatedUser));
        dispatch(updateUserLocation(locationResult.data));
        Alert.alert('Success', 'Location updated successfully');
      } else {
        setError(result.error || 'Failed to update location');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update location');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleLocationTracking = (enabled: boolean) => {
    setIsLocationTracking(enabled);
    // Here you could also enable/disable background location tracking
    // LocationService.setBackgroundTracking(enabled);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            dispatch(setUser(null));
            // Navigation will be handled by the main navigator
          },
        },
      ]
    );
  };

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorMessage message="No user profile found" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <UserProfileHeader
          user={currentUser}
          onEditProfile={() => setIsEditing(!isEditing)}
          onToggleStatus={currentUser.userType === 'responder' ? undefined : handleToggleStatus}
        />

        {/* Error Message */}
        {error && <ErrorMessage message={error} />}

        {/* Profile Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Enter your name"
                placeholderTextColor={COLORS.gray}
              />
            ) : (
              <Text style={styles.value}>{currentUser.name}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>User Type</Text>
            <Text style={styles.value}>
              {currentUser.userType === 'responder' ? 'Emergency Responder' : 'Help Seeker'}
            </Text>
          </View>

          {currentUser.userType === 'responder' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Responder Type</Text>
              {isEditing ? (
                <View style={styles.pickerContainer}>
                  {responderTypeOptions.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.pickerOption,
                        editedResponderType === type && styles.pickerOptionSelected
                      ]}
                      onPress={() => setEditedResponderType(type)}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        editedResponderType === type && styles.pickerOptionTextSelected
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.value}>{currentUser.responderType || 'Not specified'}</Text>
              )}
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>User ID</Text>
            <Text style={[styles.value, styles.valueSmall]}>{currentUser.userId}</Text>
          </View>
        </View>

        {/* Status Management for Responders */}
        {currentUser.userType === 'responder' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status Management</Text>
            
            <View style={styles.statusContainer}>
              <Text style={styles.label}>Current Status</Text>
              <StatusIndicator status={currentUser.status || 'available'} size="large" />
            </View>

            <View style={styles.statusButtons}>
              {statusOptions.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusButton,
                    currentUser.status === status && styles.statusButtonActive
                  ]}
                  onPress={() => handleToggleStatus(status)}
                  disabled={isLoading}
                >
                  <Text style={[
                    styles.statusButtonText,
                    currentUser.status === status && styles.statusButtonTextActive
                  ]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Location Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Settings</Text>
          
          <View style={styles.locationInfo}>
            <Text style={styles.label}>Current Location</Text>
            <Text style={styles.value}>
              {currentUser.location 
                ? `${currentUser.location.latitude.toFixed(6)}, ${currentUser.location.longitude.toFixed(6)}`
                : 'Location not available'
              }
            </Text>
            <Text style={styles.valueSmall}>
              Last updated: {new Date(currentUser.lastUpdated).toLocaleString()}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.updateLocationButton}
            onPress={handleUpdateLocation}
            disabled={isLoading}
          >
            <Text style={styles.updateLocationButtonText}>Update Location</Text>
          </TouchableOpacity>

          <View style={styles.switchContainer}>
            <Text style={styles.label}>Background Location Tracking</Text>
            <Switch
              value={isLocationTracking}
              onValueChange={handleToggleLocationTracking}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              thumbColor={isLocationTracking ? COLORS.white : COLORS.gray}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          {isEditing ? (
            <View style={styles.editButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setIsEditing(false);
                  setEditedName(currentUser.name);
                  setEditedResponderType(currentUser.responderType);
                  setError(null);
                }}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveProfile}
                disabled={isLoading}
              >
                <Text style={styles.saveButtonText}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={() => setIsEditing(true)}
              disabled={isLoading}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.signOutButton]}
            onPress={handleSignOut}
            disabled={isLoading}
          >
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Loading Overlay */}
        {isLoading && <Loading overlay />}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding,
    marginVertical: SIZES.base,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.padding,
  },
  inputGroup: {
    marginBottom: SIZES.padding,
  },
  label: {
    fontSize: SIZES.body3,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: SIZES.base,
  },
  value: {
    fontSize: SIZES.body2,
    color: COLORS.black,
  },
  valueSmall: {
    fontSize: SIZES.body4,
    color: COLORS.gray,
    marginTop: SIZES.base / 2,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    fontSize: SIZES.body2,
    color: COLORS.black,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.base,
  },
  pickerOption: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
  },
  pickerOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  pickerOptionText: {
    fontSize: SIZES.body3,
    color: COLORS.darkGray,
  },
  pickerOptionTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.base,
  },
  statusButton: {
    flex: 1,
    paddingVertical: SIZES.padding,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  statusButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  statusButtonText: {
    fontSize: SIZES.body3,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  statusButtonTextActive: {
    color: COLORS.white,
  },
  locationInfo: {
    marginBottom: SIZES.padding,
  },
  updateLocationButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  updateLocationButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body2,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editButtons: {
    flexDirection: 'row',
    gap: SIZES.padding,
    marginBottom: SIZES.padding,
  },
  button: {
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    marginBottom: SIZES.padding,
  },
  editButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body2,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray,
    backgroundColor: COLORS.white,
  },
  cancelButtonText: {
    color: COLORS.gray,
    fontSize: SIZES.body2,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body2,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: COLORS.error,
  },
  signOutButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body2,
    fontWeight: '600',
  },
});

export default ProfileScreen;

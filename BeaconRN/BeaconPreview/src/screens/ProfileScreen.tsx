import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { COLORS, SIZES } from '../constants';

const ProfileScreen: React.FC = () => {
  // Mock user data
  const [user] = useState({
    name: 'Dr. Sarah Johnson',
    userType: 'responder',
    responderType: 'Doctor',
    status: 'available',
    location: 'Stockholm, Sweden',
    joinedDate: '2024-01-15',
  });

  const [preferences, setPreferences] = useState({
    notificationsEnabled: true,
    locationSharingEnabled: true,
    emergencyRadius: 50,
  });

  const handleStatusToggle = () => {
    Alert.alert(
      'Change Status',
      'Would you like to change your availability status?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Change', onPress: () => console.log('Status changed') },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing functionality would open here');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => console.log('Logout') },
      ]
    );
  };

  const getStatusColor = () => {
    switch (user.status) {
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
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>👨‍⚕️</Text>
          <View
            style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}
          />
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userType}>
          {user.userType === 'responder' ? user.responderType : 'Emergency Requester'}
        </Text>
        <Text style={styles.userLocation}>{user.location}</Text>
        
        <TouchableOpacity style={styles.statusButton} onPress={handleStatusToggle}>
          <Text style={styles.statusButtonText}>
            Status: {user.status}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Profile Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
          <Text style={styles.menuItemText}>✏️ Edit Profile</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>📍 Location Settings</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>🔒 Privacy & Security</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.preferenceItem}>
          <View style={styles.preferenceInfo}>
            <Text style={styles.preferenceLabel}>🔔 Emergency Notifications</Text>
            <Text style={styles.preferenceDescription}>
              Receive notifications for emergency requests
            </Text>
          </View>
          <Switch
            value={preferences.notificationsEnabled}
            onValueChange={(value) =>
              setPreferences({ ...preferences, notificationsEnabled: value })
            }
            trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
        
        <View style={styles.preferenceItem}>
          <View style={styles.preferenceInfo}>
            <Text style={styles.preferenceLabel}>📡 Location Sharing</Text>
            <Text style={styles.preferenceDescription}>
              Share your location with other responders
            </Text>
          </View>
          <Switch
            value={preferences.locationSharingEnabled}
            onValueChange={(value) =>
              setPreferences({ ...preferences, locationSharingEnabled: value })
            }
            trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>
            🎯 Emergency Radius: {preferences.emergencyRadius}km
          </Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* App Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Information</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>ℹ️ About Beacon Emergency</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>📖 User Guide</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>🐛 Report Issue</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>⭐ Rate App</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Account Actions */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Beacon Emergency v1.0.0</Text>
        <Text style={styles.versionText}>
          Member since {new Date(user.joinedDate).toLocaleDateString()}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  profileHeader: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding * 2,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingTop: 60,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SIZES.padding,
  },
  avatar: {
    fontSize: 60,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  userName: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  userType: {
    fontSize: SIZES.body,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  userLocation: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginBottom: SIZES.padding,
  },
  statusButton: {
    backgroundColor: COLORS.light,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius,
  },
  statusButtonText: {
    fontSize: SIZES.body2,
    color: COLORS.text,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: SIZES.padding,
    paddingVertical: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.text,
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.base,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  menuItemText: {
    fontSize: SIZES.body2,
    color: COLORS.text,
  },
  menuItemArrow: {
    fontSize: SIZES.h4,
    color: COLORS.textSecondary,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  preferenceInfo: {
    flex: 1,
    marginRight: SIZES.padding,
  },
  preferenceLabel: {
    fontSize: SIZES.body2,
    color: COLORS.text,
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    marginHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: SIZES.body,
    color: COLORS.white,
    fontWeight: '600',
  },
  versionContainer: {
    padding: SIZES.padding,
    alignItems: 'center',
  },
  versionText: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default ProfileScreen;

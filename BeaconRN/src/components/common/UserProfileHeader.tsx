import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { User } from '../../types';
import { COLORS, SIZES } from '../../constants';
import StatusIndicator from './StatusIndicator';

interface UserProfileHeaderProps {
  user: User;
  onEditProfile: () => void;
  onToggleStatus: () => void;
  showStatusToggle?: boolean;
  compact?: boolean;
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  user,
  onEditProfile,
  onToggleStatus,
  showStatusToggle = true,
  compact = false,
}) => {
  const getResponderIcon = (responderType?: string): string => {
    switch (responderType) {
      case 'Ambulance':
        return '🚑';
      case 'Doctor':
        return '👨‍⚕️';
      case 'Fire Truck':
        return '🚒';
      case 'Rescue Team':
        return '👨‍🚒';
      case 'Generator':
        return '⚡';
      case 'Water Supply':
        return '💧';
      default:
        return '👤';
    }
  };

  const getUserTypeText = (userType: string, responderType?: string): string => {
    if (userType === 'responder' && responderType) {
      return responderType;
    }
    return userType === 'responder' ? 'Emergency Responder' : 'Emergency Requester';
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactUserInfo}>
          <Text style={styles.compactIcon}>
            {getResponderIcon(user.responderType)}
          </Text>
          <View style={styles.compactTextInfo}>
            <Text style={styles.compactName} numberOfLines={1}>
              {user.name}
            </Text>
            <Text style={styles.compactType} numberOfLines={1}>
              {getUserTypeText(user.userType, user.responderType)}
            </Text>
          </View>
        </View>
        
        {user.userType === 'responder' && (
          <StatusIndicator
            status={user.status || 'unavailable'}
            size="small"
            showText={false}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarIcon}>
            {getResponderIcon(user.responderType)}
          </Text>
        </View>
        
        <View style={styles.textInfo}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.userType}>
            {getUserTypeText(user.userType, user.responderType)}
          </Text>
          
          {user.userType === 'responder' && (
            <View style={styles.statusContainer}>
              <StatusIndicator
                status={user.status || 'unavailable'}
                size="medium"
                showText={true}
              />
            </View>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton} onPress={onEditProfile}>
          <Text style={styles.editButtonText}>✏️ Edit</Text>
        </TouchableOpacity>
        
        {user.userType === 'responder' && showStatusToggle && (
          <TouchableOpacity style={styles.statusButton} onPress={onToggleStatus}>
            <Text style={styles.statusButtonText}>
              {user.status === 'available' ? '⏸️ Go Offline' : '▶️ Go Online'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {user.location && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>
            📍 Current Location: {user.location.latitude.toFixed(4)}, {user.location.longitude.toFixed(4)}
          </Text>
          <Text style={styles.lastUpdated}>
            Last updated: {new Date(user.lastUpdated).toLocaleString()}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    shadowColor: COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.padding,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  compactUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.padding,
  },
  avatarIcon: {
    fontSize: 32,
  },
  compactIcon: {
    fontSize: 24,
    marginRight: SIZES.base,
  },
  textInfo: {
    flex: 1,
  },
  compactTextInfo: {
    flex: 1,
  },
  name: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  compactName: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  userType: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginBottom: SIZES.base / 2,
  },
  compactType: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
  },
  statusContainer: {
    marginTop: SIZES.base / 2,
  },
  actions: {
    flexDirection: 'row',
    gap: SIZES.base,
    marginBottom: SIZES.base,
  },
  editButton: {
    flex: 1,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: SIZES.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  statusButton: {
    flex: 1,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  statusButtonText: {
    fontSize: SIZES.body,
    color: COLORS.background,
    fontWeight: '600',
  },
  locationInfo: {
    borderTopWidth: 1,
    borderTopColor: COLORS.light,
    paddingTop: SIZES.base,
  },
  locationText: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  lastUpdated: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
  },
});

export default UserProfileHeader;

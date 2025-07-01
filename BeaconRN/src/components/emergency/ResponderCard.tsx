import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { User } from '../../types';
import { COLORS, SIZES, STATUS_COLORS } from '../../constants';

interface ResponderCardProps {
  responder: User;
  distance: number;
  onContact: (responder: User) => void;
  onViewProfile?: (responder: User) => void;
  showDistance?: boolean;
}

const ResponderCard: React.FC<ResponderCardProps> = ({
  responder,
  distance,
  onContact,
  onViewProfile,
  showDistance = true,
}) => {
  const getStatusText = (status?: string): string => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'occupied':
        return 'Busy';
      case 'unavailable':
        return 'Unavailable';
      default:
        return 'Unknown';
    }
  };

  const getDistanceText = (distanceKm: number): string => {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m away`;
    }
    return `${distanceKm.toFixed(1)}km away`;
  };

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
        return '🆘';
    }
  };

  const isAvailable = responder.status === 'available';

  return (
    <View style={[styles.container, !isAvailable && styles.unavailableCard]}>
      <View style={styles.header}>
        <View style={styles.responderInfo}>
          <Text style={styles.responderIcon}>
            {getResponderIcon(responder.responderType)}
          </Text>
          <View style={styles.textInfo}>
            <Text style={styles.name} numberOfLines={1}>
              {responder.name}
            </Text>
            <Text style={styles.type} numberOfLines={1}>
              {responder.responderType || 'Emergency Responder'}
            </Text>
          </View>
        </View>
        
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: STATUS_COLORS[responder.status || 'unavailable'] },
            ]}
          />
          <Text style={styles.statusText}>
            {getStatusText(responder.status)}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        {showDistance && (
          <Text style={styles.distance}>
            📍 {getDistanceText(distance)}
          </Text>
        )}
        
        {responder.lastUpdated && (
          <Text style={styles.lastSeen}>
            Last seen: {new Date(responder.lastUpdated).toLocaleTimeString()}
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        {onViewProfile && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => onViewProfile(responder)}
          >
            <Text style={styles.secondaryButtonText}>View Profile</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[
            styles.contactButton,
            !isAvailable && styles.disabledButton,
          ]}
          onPress={() => onContact(responder)}
          disabled={!isAvailable}
        >
          <Text
            style={[
              styles.contactButtonText,
              !isAvailable && styles.disabledButtonText,
            ]}
          >
            {isAvailable ? 'Contact' : 'Unavailable'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginVertical: SIZES.base / 2,
    shadowColor: COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unavailableCard: {
    opacity: 0.7,
    backgroundColor: COLORS.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  responderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  responderIcon: {
    fontSize: 32,
    marginRight: SIZES.base,
  },
  textInfo: {
    flex: 1,
  },
  name: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  type: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SIZES.base / 2,
  },
  statusText: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  details: {
    marginBottom: SIZES.base,
  },
  distance: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  lastSeen: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: SIZES.base,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: SIZES.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  contactButton: {
    flex: 1,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  contactButtonText: {
    fontSize: SIZES.body,
    color: COLORS.background,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: COLORS.disabled,
  },
  disabledButtonText: {
    color: COLORS.textSecondary,
  },
});

export default ResponderCard;

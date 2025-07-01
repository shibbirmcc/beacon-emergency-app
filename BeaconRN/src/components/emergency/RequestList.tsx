import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { EmergencyRequest } from '../../types';
import { COLORS, SIZES } from '../../constants';

interface RequestListProps {
  requests: EmergencyRequest[];
  onRequestPress: (request: EmergencyRequest) => void;
  userType: 'responder' | 'requester';
  onRefresh?: () => void;
  refreshing?: boolean;
  emptyMessage?: string;
}

const RequestList: React.FC<RequestListProps> = ({
  requests,
  onRequestPress,
  userType,
  onRefresh,
  refreshing = false,
  emptyMessage = 'No emergency requests found',
}) => {
  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const requestTime = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - requestTime.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getPriorityColor = (priority?: string): string => {
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

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'open':
        return COLORS.warning;
      case 'responded':
        return COLORS.info;
      case 'completed':
        return COLORS.success;
      default:
        return COLORS.disabled;
    }
  };

  const renderRequestItem = ({ item }: { item: EmergencyRequest }) => (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => onRequestPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.typeContainer}>
          <Text style={styles.emergencyType}>{item.emergency_type}</Text>
          {item.priority && (
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(item.priority) },
              ]}
            >
              <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
            </View>
          )}
        </View>
        <Text style={styles.timeAgo}>{formatTimeAgo(item.requested_at)}</Text>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.requestBy}>
          {userType === 'responder' ? `Requested by: ${item.request_by}` : 'Your Request'}
        </Text>
        
        {item.location && (
          <Text style={styles.location}>
            📍 {item.location.latitude.toFixed(4)}, {item.location.longitude.toFixed(4)}
          </Text>
        )}

        {item.notes_by_responder && (
          <Text style={styles.notes} numberOfLines={2}>
            💬 {item.notes_by_responder}
          </Text>
        )}
      </View>

      <View style={styles.cardFooter}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
        
        {item.responded_by && (
          <Text style={styles.responderInfo}>
            Responder: {item.responded_by}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📱</Text>
      <Text style={styles.emptyTitle}>No Requests</Text>
      <Text style={styles.emptyMessage}>{emptyMessage}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        renderItem={renderRequestItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          requests.length === 0 && styles.emptyListContainer,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          ) : undefined
        }
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    padding: SIZES.padding,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  requestCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    shadowColor: COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.base,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emergencyType: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: SIZES.base,
  },
  priorityBadge: {
    paddingHorizontal: SIZES.base,
    paddingVertical: 2,
    borderRadius: SIZES.radius / 2,
  },
  priorityText: {
    fontSize: SIZES.caption,
    color: COLORS.background,
    fontWeight: 'bold',
  },
  timeAgo: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
  },
  cardContent: {
    marginBottom: SIZES.base,
  },
  requestBy: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  location: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  notes: {
    fontSize: SIZES.body,
    color: COLORS.text,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: SIZES.base,
    paddingVertical: 4,
    borderRadius: SIZES.radius / 2,
  },
  statusText: {
    fontSize: SIZES.caption,
    color: COLORS.background,
    fontWeight: 'bold',
  },
  responderInfo: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    flex: 1,
    textAlign: 'right',
  },
  separator: {
    height: SIZES.base,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.padding * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SIZES.base,
  },
  emptyTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.base / 2,
  },
  emptyMessage: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default RequestList;

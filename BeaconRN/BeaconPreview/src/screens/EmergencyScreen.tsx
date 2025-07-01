import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SIZES } from '../constants';

const EmergencyScreen: React.FC = () => {
  // Mock data for demonstration
  const activeRequests = [
    {
      id: 'req_1',
      emergency_type: 'Ambulance',
      requested_at: '2025-06-29T10:30:00Z',
      status: 'open',
      priority: 'high',
    },
    {
      id: 'req_2',
      emergency_type: 'Doctor',
      requested_at: '2025-06-29T09:15:00Z',
      status: 'responded',
      priority: 'medium',
    },
  ];

  const completedRequests = [
    {
      id: 'req_3',
      emergency_type: 'Fire Truck',
      requested_at: '2025-06-28T15:45:00Z',
      status: 'completed',
      priority: 'critical',
    },
  ];

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getPriorityColor = (priority: string) => {
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
        return COLORS.gray;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return COLORS.warning;
      case 'responded':
        return COLORS.info;
      case 'completed':
        return COLORS.success;
      default:
        return COLORS.gray;
    }
  };

  const RequestCard = ({ request }: { request: any }) => (
    <TouchableOpacity style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Text style={styles.requestType}>{request.emergency_type}</Text>
        <View
          style={[
            styles.priorityBadge,
            { backgroundColor: getPriorityColor(request.priority) },
          ]}
        >
          <Text style={styles.priorityText}>{request.priority}</Text>
        </View>
      </View>
      <Text style={styles.requestTime}>
        {formatTime(request.requested_at)}
      </Text>
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(request.status) },
        ]}
      >
        <Text style={styles.statusText}>{request.status}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Emergency Requests</Text>
        <Text style={styles.headerSubtitle}>
          Monitor and manage emergency situations
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚨 Active Requests</Text>
          {activeRequests.length > 0 ? (
            activeRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No active emergency requests</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Completed Requests</Text>
          {completedRequests.length > 0 ? (
            completedRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No completed requests</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Statistics</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {activeRequests.length + completedRequests.length}
              </Text>
              <Text style={styles.statLabel}>Total Requests</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{activeRequests.length}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{completedRequests.length}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  section: {
    marginBottom: SIZES.padding * 2,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.padding,
  },
  requestCard: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  requestType: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  priorityBadge: {
    paddingHorizontal: SIZES.base,
    paddingVertical: 4,
    borderRadius: SIZES.radius / 2,
  },
  priorityText: {
    fontSize: SIZES.caption,
    color: COLORS.white,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  requestTime: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginBottom: SIZES.base,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SIZES.base,
    paddingVertical: 4,
    borderRadius: SIZES.radius / 2,
  },
  statusText: {
    fontSize: SIZES.caption,
    color: COLORS.white,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emptyState: {
    backgroundColor: COLORS.light,
    padding: SIZES.padding * 2,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.base,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default EmergencyScreen;

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { COLORS, SIZES } from '../constants';

const EmergencyScreen: React.FC = () => {
  const user = useSelector((state: RootState) => state.user.currentUser);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  const isResponder = user?.userType === 'responder';

  // Mock data for demonstration
  const mockRequests = [
    {
      id: '1',
      type: 'Ambulance',
      status: 'open',
      requestedAt: new Date().toISOString(),
      requestedBy: 'John Doe',
      location: 'Downtown Stockholm',
    },
    {
      id: '2',
      type: 'Fire Truck',
      status: 'responded',
      requestedAt: new Date(Date.now() - 3600000).toISOString(),
      requestedBy: 'Jane Smith',
      respondedBy: 'Fire Station 1',
      location: 'Old Town',
    },
    {
      id: '3',
      type: 'Doctor',
      status: 'completed',
      requestedAt: new Date(Date.now() - 7200000).toISOString(),
      requestedBy: 'Mike Johnson',
      respondedBy: 'Dr. Anderson',
      location: 'Södermalm',
    },
  ];

  const activeRequests = mockRequests.filter(req => req.status === 'open' || req.status === 'responded');
  const completedRequests = mockRequests.filter(req => req.status === 'completed');

  const handleRequestPress = (request: any) => {
    if (isResponder && request.status === 'open') {
      alert(`Responding to ${request.type} request from ${request.requestedBy}`);
    } else {
      alert(`Request details: ${request.type} - ${request.status}`);
    }
  };

  const renderRequest = (request: any) => (
    <TouchableOpacity
      key={request.id}
      style={styles.requestCard}
      onPress={() => handleRequestPress(request)}
    >
      <View style={styles.requestHeader}>
        <Text style={styles.requestType}>{getEmergencyIcon(request.type)} {request.type}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
          <Text style={styles.statusText}>{request.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.requestDetail}>📍 {request.location}</Text>
      <Text style={styles.requestDetail}>👤 {request.requestedBy}</Text>
      <Text style={styles.requestDetail}>⏰ {formatTime(request.requestedAt)}</Text>
      
      {request.respondedBy && (
        <Text style={styles.responderInfo}>🚑 Responded by: {request.respondedBy}</Text>
      )}
      
      {isResponder && request.status === 'open' && (
        <TouchableOpacity style={styles.respondButton}>
          <Text style={styles.respondButtonText}>Respond to Request</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isResponder ? '🚨 Emergency Requests' : '📋 My Requests'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {isResponder ? 'Respond to emergency calls' : 'Track your emergency requests'}
        </Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Active ({activeRequests.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            History ({completedRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'active' ? (
          activeRequests.length > 0 ? (
            activeRequests.map(renderRequest)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={styles.emptyTitle}>No Active Requests</Text>
              <Text style={styles.emptySubtitle}>
                {isResponder 
                  ? 'All emergency requests have been handled'
                  : 'You have no active emergency requests'
                }
              </Text>
            </View>
          )
        ) : (
          completedRequests.length > 0 ? (
            completedRequests.map(renderRequest)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No History</Text>
              <Text style={styles.emptySubtitle}>
                Completed requests will appear here
              </Text>
            </View>
          )
        )}
      </ScrollView>

      {/* Quick Stats for Responders */}
      {isResponder && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Responses Today</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>156</Text>
            <Text style={styles.statLabel}>Total Responses</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const getEmergencyIcon = (type: string) => {
  const icons: { [key: string]: string } = {
    'Ambulance': '🚑',
    'Doctor': '👨‍⚕️',
    'Fire Truck': '🚒',
    'Rescue Team': '🆘',
    'Generator': '⚡',
    'Water Supply': '💧',
  };
  return icons[type] || '🚨';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open': return COLORS.warning;
    case 'responded': return COLORS.secondary;
    case 'completed': return COLORS.success;
    default: return COLORS.gray;
  }
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: SIZES.body1,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  requestCard: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestType: {
    fontSize: SIZES.h5,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.white,
    fontSize: SIZES.caption,
    fontWeight: 'bold',
  },
  requestDetail: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  responderInfo: {
    fontSize: SIZES.body2,
    color: COLORS.success,
    fontWeight: '500',
    marginTop: 8,
  },
  respondButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  respondButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body1,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

export default EmergencyScreen;

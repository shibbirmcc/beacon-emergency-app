import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import {
  setActiveRequests,
  setCompletedRequests,
  setLoadingRequests,
  updateEmergencyRequest,
} from '../../store/slices/emergencySlice';

// Components
import {
  RequestList,
  Loading,
  ErrorMessage,
  UserProfileHeader,
} from '../../components';

// Services
import { DatabaseService } from '../../services/DatabaseService';

// Types and Constants
import { EmergencyRequest } from '../../types';
import { COLORS, SIZES } from '../../constants';

// Tab Navigation
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const Tab = createMaterialTopTabNavigator();

const EmergencyScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const {
    activeRequests,
    completedRequests,
    isLoadingRequests,
    lastRequestError,
  } = useSelector((state: RootState) => state.emergency);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEmergencyRequests();
  }, []);

  const loadEmergencyRequests = async () => {
    if (!currentUser) return;

    try {
      dispatch(setLoadingRequests(true));
      
      // Load requests based on user type
      let active: EmergencyRequest[] = [];
      let completed: EmergencyRequest[] = [];

      if (currentUser.userType === 'responder') {
        // Load all open requests for responders
        const activeResult = await DatabaseService.getOpenEmergencyRequests();
        active = activeResult.success && activeResult.data ? activeResult.data : [];
        // Load requests this responder has responded to
        const completedResult = await DatabaseService.getCompletedRequestsByResponder(currentUser.userId);
        completed = completedResult.success && completedResult.data ? completedResult.data : [];
      } else {
        // Load user's own requests
        const activeResult = await DatabaseService.getRequestsByUser(currentUser.userId, 'active');
        active = activeResult.success && activeResult.data ? activeResult.data : [];
        const completedResult = await DatabaseService.getRequestsByUser(currentUser.userId, 'completed');
        completed = completedResult.success && completedResult.data ? completedResult.data : [];
      }

      dispatch(setActiveRequests(active));
      dispatch(setCompletedRequests(completed));
      
    } catch (error) {
      console.error('Failed to load emergency requests:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEmergencyRequests();
    setRefreshing(false);
  };

  const handleRequestPress = async (request: EmergencyRequest) => {
    if (!currentUser) return;

    if (currentUser.userType === 'responder' && request.status === 'open') {
      // Handle responder accepting the request
      try {
        const updatedRequest: EmergencyRequest = {
          ...request,
          status: 'responded',
          responded_by: currentUser.userId,
          responded_at: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await DatabaseService.updateEmergencyRequestStatus(request.id, 'responded');
        dispatch(updateEmergencyRequest(updatedRequest));
        
      } catch (error) {
        console.error('Failed to respond to request:', error);
      }
    } else {
      // Show request details
      console.log('Show request details:', request);
    }
  };

  const getEmptyMessage = (tab: 'active' | 'completed') => {
    if (currentUser?.userType === 'responder') {
      return tab === 'active' 
        ? 'No active emergency requests in your area'
        : 'You haven\'t responded to any requests yet';
    } else {
      return tab === 'active'
        ? 'You don\'t have any active emergency requests'
        : 'You haven\'t made any emergency requests yet';
    }
  };

  const ActiveRequestsTab = () => (
    <View style={styles.tabContainer}>
      {isLoadingRequests && !refreshing ? (
        <Loading message="Loading requests..." />
      ) : (
        <RequestList
          requests={activeRequests}
          onRequestPress={handleRequestPress}
          userType={currentUser?.userType || 'requester'}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          emptyMessage={getEmptyMessage('active')}
        />
      )}
    </View>
  );

  const CompletedRequestsTab = () => (
    <View style={styles.tabContainer}>
      <RequestList
        requests={completedRequests}
        onRequestPress={handleRequestPress}
        userType={currentUser?.userType || 'requester'}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        emptyMessage={getEmptyMessage('completed')}
      />
    </View>
  );

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorMessage
          message="User not found. Please complete onboarding first."
          type="error"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <UserProfileHeader
          user={currentUser}
          onEditProfile={() => console.log('Edit profile')}
          onToggleStatus={() => console.log('Toggle status')}
          showStatusToggle={currentUser.userType === 'responder'}
          compact={true}
        />
      </View>

      {/* Error Message */}
      {lastRequestError && (
        <ErrorMessage
          message={lastRequestError}
          onRetry={loadEmergencyRequests}
          type="error"
        />
      )}

      {/* Tab Navigation */}
      <View style={styles.tabContent}>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.textSecondary,
            tabBarIndicatorStyle: {
              backgroundColor: COLORS.primary,
              height: 3,
            },
            tabBarStyle: {
              backgroundColor: COLORS.background,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.light,
            },
            tabBarLabelStyle: {
              fontSize: SIZES.body,
              fontWeight: '600',
              textTransform: 'none',
            },
          }}
        >
          <Tab.Screen
            name="Active"
            component={ActiveRequestsTab}
            options={{
              tabBarLabel: currentUser.userType === 'responder' ? 'Open Requests' : 'Active',
              tabBarBadge: activeRequests.length > 0 ? activeRequests.length : undefined,
            }}
          />
          <Tab.Screen
            name="Completed"
            component={CompletedRequestsTab}
            options={{
              tabBarLabel: currentUser.userType === 'responder' ? 'My Responses' : 'History',
              tabBarBadge: completedRequests.length > 0 ? completedRequests.length : undefined,
            }}
          />
        </Tab.Navigator>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  tabContent: {
    flex: 1,
  },
  tabContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default EmergencyScreen;

/**
 * Service Integration Example
 * Demonstrates how all Phase 2 services work together in a real emergency scenario
 */

import { DatabaseService } from './DatabaseService';
import { LocationService } from './LocationService';
import { notificationService } from './NotificationService';
import { replicationService } from './ReplicationService';
import { User, EmergencyRequest, Location } from '../types';

// Use the singleton service instances
const databaseService = DatabaseService;
const locationService = LocationService;

/**
 * Emergency Response Orchestrator
 * Coordinates all services for emergency request handling
 */
export class EmergencyOrchestrator {
  private static instance: EmergencyOrchestrator;
  
  static getInstance(): EmergencyOrchestrator {
    if (!EmergencyOrchestrator.instance) {
      EmergencyOrchestrator.instance = new EmergencyOrchestrator();
    }
    return EmergencyOrchestrator.instance;
  }

  /**
   * Initialize all services and start monitoring
   */
  async initialize(): Promise<void> {
    try {
      // Request permissions
      await notificationService.requestNotificationPermission();
      await locationService.requestLocationPermission();

      // Initialize database
      await databaseService.initializeDatabase();

      // Start location tracking
      await locationService.startLocationTracking((location: Location) => {
        this.handleLocationUpdate(location);
      });

      // Start replication if configured
      const syncConfig = await this.getSyncConfiguration();
      if (syncConfig) {
        await replicationService.startSyncGatewayReplication(syncConfig);
      }

      console.log('Emergency services initialized successfully');
    } catch (error) {
      console.error('Failed to initialize emergency services:', error);
    }
  }

  /**
   * Handle emergency request creation
   */
  async createEmergencyRequest(
    userId: string,
    emergencyType: string,
    location: Location
  ): Promise<EmergencyRequest | null> {
    try {
      // Create emergency request
      const request: EmergencyRequest = {
        id: `emergency_${Date.now()}`,
        type: 'emergency_request',
        request_by: userId,
        requested_at: new Date().toISOString(),
        status: 'open',
        emergency_type: emergencyType as any,
        location,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to local database
      const saveResult = await databaseService.saveEmergencyRequest(request);
      if (!saveResult.success) {
        throw new Error(saveResult.error);
      }

      // Find nearby responders
      const nearbyResponders = await this.findNearbyResponders(location, emergencyType);
      
      // Send notifications to responders
      await this.notifyResponders(request, nearbyResponders);

      // Force sync to share with network
      await replicationService.forceSync();

      console.log('Emergency request created and broadcasted');
      return request;
    } catch (error) {
      console.error('Failed to create emergency request:', error);
      return null;
    }
  }

  /**
   * Handle responder accepting an emergency request
   */
  async acceptEmergencyRequest(
    requestId: string,
    responderId: string
  ): Promise<boolean> {
    try {
      // Get the request by ID (using getOpenEmergencyRequests and filtering)
      const requestsResult = await databaseService.getOpenEmergencyRequests();
      if (!requestsResult.success || !requestsResult.data) {
        throw new Error('Failed to get emergency requests');
      }

      const request = requestsResult.data.find(r => r.id === requestId);
      if (!request) {
        throw new Error('Emergency request not found');
      }

      // Update request status
      const updateResult = await databaseService.updateEmergencyRequestStatus(
        requestId,
        'responded',
        responderId
      );

      if (!updateResult.success) {
        throw new Error(updateResult.error);
      }

      // Get responder info
      const responderResult = await databaseService.getUser(responderId);
      if (responderResult.success && responderResult.data) {
        // Notify the requester
        await notificationService.showResponderNotification(responderResult.data);
      }

      // Sync the update
      await replicationService.forceSync();

      console.log('Emergency request accepted by responder');
      return true;
    } catch (error) {
      console.error('Failed to accept emergency request:', error);
      return false;
    }
  }

  /**
   * Update user location and broadcast to network
   */
  private async handleLocationUpdate(location: Location): Promise<void> {
    try {
      // For now, we'll assume we have a current user ID stored
      // In a real app, this would come from authentication state
      const currentUserId = 'current_user_id'; // This would come from auth
      
      const userResult = await databaseService.getUser(currentUserId);
      if (!userResult.success || !userResult.data) return;

      const currentUser = userResult.data;

      // Update user location
      const updatedUser: User = {
        ...currentUser,
        location,
        lastUpdated: new Date().toISOString(),
      };

      // Save updated location
      await databaseService.saveUser(updatedUser);

      // Trigger sync to share location
      if (replicationService.getReplicationStatus() === 'connected') {
        await replicationService.forceSync();
      }
    } catch (error) {
      console.error('Failed to handle location update:', error);
    }
  }

  /**
   * Find responders near emergency location
   */
  private async findNearbyResponders(
    location: Location,
    emergencyType: string
  ): Promise<User[]> {
    try {
      // Search for nearby responders within 5km
      const nearbyResult = await databaseService.getNearbyResponders(location, 5);
      
      if (!nearbyResult.success || !nearbyResult.data) {
        return [];
      }

      // Filter by responder type if needed
      return nearbyResult.data.filter((responder: User) => 
        responder.responderType === emergencyType || 
        responder.status === 'available'
      );
    } catch (error) {
      console.error('Failed to find nearby responders:', error);
      return [];
    }
  }

  /**
   * Send notifications to nearby responders
   */
  private async notifyResponders(
    request: EmergencyRequest,
    responders: User[]
  ): Promise<void> {
    try {
      for (const responder of responders) {
        await notificationService.showEmergencyNotification(request);
      }
      console.log(`Notified ${responders.length} responders`);
    } catch (error) {
      console.error('Failed to notify responders:', error);
    }
  }

  /**
   * Get sync configuration (stub - would come from app settings)
   */
  private async getSyncConfiguration() {
    // In a real app, this would come from user settings or environment config
    return {
      syncGatewayUrl: 'ws://localhost:4984/beacon',
      channels: ['emergency_requests', 'users'],
      username: 'emergency_user',
      password: 'secure_password'
    };
  }

  /**
   * Monitor replication status and handle errors
   */
  startReplicationMonitoring(): void {
    replicationService.onReplicationStatusChange((status) => {
      console.log('Replication status changed:', status);
      
      if (status === 'error') {
        // Handle replication errors
        this.handleReplicationError();
      } else if (status === 'connected') {
        // Successfully connected - trigger a sync
        replicationService.forceSync();
      }
    });
  }

  /**
   * Handle replication errors with retry logic
   */
  private async handleReplicationError(): Promise<void> {
    // Wait 30 seconds and try to reconnect
    setTimeout(async () => {
      try {
        const syncConfig = await this.getSyncConfiguration();
        if (syncConfig) {
          await replicationService.startSyncGatewayReplication(syncConfig);
        }
      } catch (error) {
        console.error('Failed to reconnect to sync gateway:', error);
      }
    }, 30000);
  }

  /**
   * Cleanup resources when app is backgrounded or closed
   */
  async cleanup(): Promise<void> {
    try {
      await locationService.stopLocationTracking();
      await replicationService.stopSyncGatewayReplication();
      console.log('Emergency services cleaned up');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

// Export singleton instance for app-wide use
export const emergencyOrchestrator = EmergencyOrchestrator.getInstance();

/**
 * Example usage in a React Native component:
 * 
 * ```typescript
 * import { emergencyOrchestrator } from '../services/EmergencyOrchestrator';
 * 
 * // In a React component
 * const handleEmergencyRequest = async () => {
 *   const location = await locationService.getCurrentLocation();
 *   const request = await emergencyOrchestrator.createEmergencyRequest(
 *     currentUser.id,
 *     'Ambulance',
 *     location
 *   );
 *   
 *   if (request) {
 *     // Show success message
 *     alert('Emergency request sent successfully!');
 *   } else {
 *     // Show error message
 *     alert('Failed to send emergency request');
 *   }
 * };
 * ```
 */

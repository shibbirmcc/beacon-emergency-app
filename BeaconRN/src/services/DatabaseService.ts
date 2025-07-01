// Database Service Implementation for Couchbase Lite integration
// Phase 2: Real implementation with AsyncStorage fallback

import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, EmergencyRequest, Location, DatabaseResult } from '../types';

declare const __DEV__: boolean;

export interface IDatabaseService {
  /**
   * Initialize the database
   */
  initializeDatabase(): Promise<DatabaseResult<boolean>>;

  /**
   * Save a user document to the database
   */
  saveUser(user: User): Promise<DatabaseResult<string>>;

  /**
   * Retrieve a user by their ID
   */
  getUser(userId: string): Promise<DatabaseResult<User>>;

  /**
   * Save an emergency request to the database
   */
  saveEmergencyRequest(request: EmergencyRequest): Promise<DatabaseResult<string>>;

  /**
   * Get all open emergency requests
   */
  getOpenEmergencyRequests(): Promise<DatabaseResult<EmergencyRequest[]>>;

  /**
   * Update the status of an emergency request
   */
  updateEmergencyRequestStatus(
    requestId: string, 
    status: string, 
    responderId?: string
  ): Promise<DatabaseResult<boolean>>;

  /**
   * Find nearby responders within a given radius
   */
  getNearbyResponders(
    location: Location, 
    radius: number
  ): Promise<DatabaseResult<User[]>>;

  /**
   * Delete all documents (for testing purposes)
   */
  deleteAllDocuments(): Promise<DatabaseResult<number>>;

  /**
   * Query documents with custom query
   */
  query(queryString: string): Promise<DatabaseResult<any[]>>;

  /**
   * Add a change listener for real-time updates
   */
  addChangeListener(
    callback: (changes: any[]) => void
  ): Promise<string>; // Returns listener ID

  /**
   * Remove a change listener
   */
  removeChangeListener(listenerId: string): Promise<void>;

  /**
   * Get completed emergency requests by responder
   */
  getCompletedRequestsByResponder(responderId: string): Promise<DatabaseResult<EmergencyRequest[]>>;

  /**
   * Get emergency requests by user with status filter
   */
  getRequestsByUser(userId: string, status: 'active' | 'completed'): Promise<DatabaseResult<EmergencyRequest[]>>;
}

/**
 * Real Database Service Implementation
 * Uses AsyncStorage as fallback until Couchbase Lite native module is ready
 * Designed to be easily replaced with Couchbase Lite in Phase 5
 */
class AsyncStorageDatabaseService implements IDatabaseService {
  private static readonly USERS_KEY = 'beacon_users';
  private static readonly REQUESTS_KEY = 'beacon_requests';
  private static readonly METADATA_KEY = 'beacon_metadata';
  
  private listeners: Map<string, (changes: any[]) => void> = new Map();
  private isInitialized: boolean = false;

  async initializeDatabase(): Promise<DatabaseResult<boolean>> {
    try {
      // Check if database metadata exists, create if not
      const metadata = await AsyncStorage.getItem(AsyncStorageDatabaseService.METADATA_KEY);
      if (!metadata) {
        await AsyncStorage.setItem(
          AsyncStorageDatabaseService.METADATA_KEY, 
          JSON.stringify({
            version: '1.0.0',
            created: new Date().toISOString(),
            lastAccessed: new Date().toISOString()
          })
        );
      }

      // Initialize collections if they don't exist
      const users = await AsyncStorage.getItem(AsyncStorageDatabaseService.USERS_KEY);
      if (!users) {
        await AsyncStorage.setItem(AsyncStorageDatabaseService.USERS_KEY, JSON.stringify({}));
      }

      const requests = await AsyncStorage.getItem(AsyncStorageDatabaseService.REQUESTS_KEY);
      if (!requests) {
        await AsyncStorage.setItem(AsyncStorageDatabaseService.REQUESTS_KEY, JSON.stringify({}));
      }

      this.isInitialized = true;
      return { success: true, data: true };
    } catch (error) {
      return { 
        success: false, 
        error: `Database initialization failed: ${error}` 
      };
    }
  }

  async saveUser(user: User): Promise<DatabaseResult<string>> {
    try {
      if (!this.isInitialized) {
        await this.initializeDatabase();
      }

      const usersData = await AsyncStorage.getItem(AsyncStorageDatabaseService.USERS_KEY);
      const users = usersData ? JSON.parse(usersData) : {};
      
      users[user.userId] = {
        ...user,
        lastUpdated: new Date().toISOString()
      };

      await AsyncStorage.setItem(
        AsyncStorageDatabaseService.USERS_KEY, 
        JSON.stringify(users)
      );

      this.notifyListeners('user', 'created', user);
      return { success: true, data: user.userId };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to save user: ${error}` 
      };
    }
  }

  async getUser(userId: string): Promise<DatabaseResult<User>> {
    try {
      if (!this.isInitialized) {
        await this.initializeDatabase();
      }

      const usersData = await AsyncStorage.getItem(AsyncStorageDatabaseService.USERS_KEY);
      const users = usersData ? JSON.parse(usersData) : {};
      
      const user = users[userId];
      if (user) {
        return { success: true, data: user };
      }
      
      return { success: false, error: 'User not found' };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to get user: ${error}` 
      };
    }
  }

  async saveEmergencyRequest(request: EmergencyRequest): Promise<DatabaseResult<string>> {
    try {
      if (!this.isInitialized) {
        await this.initializeDatabase();
      }

      const requestsData = await AsyncStorage.getItem(AsyncStorageDatabaseService.REQUESTS_KEY);
      const requests = requestsData ? JSON.parse(requestsData) : {};
      
      const requestId = `req_${Date.now()}_${request.request_by}`;
      requests[requestId] = {
        ...request,
        id: requestId,
        requested_at: new Date().toISOString()
      };

      await AsyncStorage.setItem(
        AsyncStorageDatabaseService.REQUESTS_KEY, 
        JSON.stringify(requests)
      );

      this.notifyListeners('emergency_request', 'created', requests[requestId]);
      return { success: true, data: requestId };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to save emergency request: ${error}` 
      };
    }
  }

  async getOpenEmergencyRequests(): Promise<DatabaseResult<EmergencyRequest[]>> {
    try {
      if (!this.isInitialized) {
        await this.initializeDatabase();
      }

      const requestsData = await AsyncStorage.getItem(AsyncStorageDatabaseService.REQUESTS_KEY);
      const requests = requestsData ? JSON.parse(requestsData) : {};
      
      const openRequests = Object.values(requests)
        .filter((req: any) => req.status === 'open') as EmergencyRequest[];

      return { success: true, data: openRequests };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to get open requests: ${error}` 
      };
    }
  }

  async updateEmergencyRequestStatus(
    requestId: string, 
    status: string, 
    responderId?: string
  ): Promise<DatabaseResult<boolean>> {
    try {
      if (!this.isInitialized) {
        await this.initializeDatabase();
      }

      const requestsData = await AsyncStorage.getItem(AsyncStorageDatabaseService.REQUESTS_KEY);
      const requests = requestsData ? JSON.parse(requestsData) : {};
      
      if (!requests[requestId]) {
        return { success: false, error: 'Request not found' };
      }

      requests[requestId] = {
        ...requests[requestId],
        status: status as any,
        responded_by: responderId,
        responded_at: responderId ? new Date().toISOString() : undefined
      };

      await AsyncStorage.setItem(
        AsyncStorageDatabaseService.REQUESTS_KEY, 
        JSON.stringify(requests)
      );

      this.notifyListeners('emergency_request', 'updated', requests[requestId]);
      return { success: true, data: true };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to update request status: ${error}` 
      };
    }
  }

  async getNearbyResponders(
    location: Location, 
    radius: number
  ): Promise<DatabaseResult<User[]>> {
    try {
      if (!this.isInitialized) {
        await this.initializeDatabase();
      }

      const usersData = await AsyncStorage.getItem(AsyncStorageDatabaseService.USERS_KEY);
      const users = usersData ? JSON.parse(usersData) : {};
      
      const responders = Object.values(users)
        .filter((user: any) => user.userType === 'responder') as User[];

      // Calculate distances and filter by radius
      const nearbyResponders = responders.filter(responder => {
        const distance = this.calculateDistance(location, responder.location);
        return distance <= radius;
      });

      return { success: true, data: nearbyResponders };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to get nearby responders: ${error}` 
      };
    }
  }

  async deleteAllDocuments(): Promise<DatabaseResult<number>> {
    try {
      const usersData = await AsyncStorage.getItem(AsyncStorageDatabaseService.USERS_KEY);
      const requestsData = await AsyncStorage.getItem(AsyncStorageDatabaseService.REQUESTS_KEY);
      
      const userCount = usersData ? Object.keys(JSON.parse(usersData)).length : 0;
      const requestCount = requestsData ? Object.keys(JSON.parse(requestsData)).length : 0;
      
      await AsyncStorage.multiRemove([
        AsyncStorageDatabaseService.USERS_KEY,
        AsyncStorageDatabaseService.REQUESTS_KEY
      ]);

      // Reinitialize empty collections
      await AsyncStorage.setItem(AsyncStorageDatabaseService.USERS_KEY, JSON.stringify({}));
      await AsyncStorage.setItem(AsyncStorageDatabaseService.REQUESTS_KEY, JSON.stringify({}));

      return { success: true, data: userCount + requestCount };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to delete documents: ${error}` 
      };
    }
  }

  async query(queryString: string): Promise<DatabaseResult<any[]>> {
    try {
      // Basic query implementation for AsyncStorage
      // This would be much more sophisticated with Couchbase Lite
      const usersData = await AsyncStorage.getItem(AsyncStorageDatabaseService.USERS_KEY);
      const requestsData = await AsyncStorage.getItem(AsyncStorageDatabaseService.REQUESTS_KEY);
      
      const users = usersData ? Object.values(JSON.parse(usersData)) : [];
      const requests = requestsData ? Object.values(JSON.parse(requestsData)) : [];
      
      const allDocuments = [...users, ...requests];
      
      // Simple query implementation - in real Couchbase Lite this would be much more powerful
      const results = allDocuments.filter(doc => 
        JSON.stringify(doc).toLowerCase().includes(queryString.toLowerCase())
      );

      return { success: true, data: results };
    } catch (error) {
      return { 
        success: false, 
        error: `Query failed: ${error}` 
      };
    }
  }

  async addChangeListener(
    callback: (changes: any[]) => void
  ): Promise<string> {
    const id = `listener_${Date.now()}_${Math.random()}`;
    this.listeners.set(id, callback);
    return id;
  }

  async removeChangeListener(listenerId: string): Promise<void> {
    this.listeners.delete(listenerId);
  }

  private calculateDistance(loc1: Location, loc2: Location): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(loc2.latitude - loc1.latitude);
    const dLon = this.toRadians(loc2.longitude - loc1.longitude);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(loc1.latitude)) * Math.cos(this.toRadians(loc2.latitude)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private notifyListeners(type: string, action: string, data: any): void {
    const change = { type, action, data, timestamp: new Date().toISOString() };
    this.listeners.forEach(callback => {
      try {
        callback([change]);
      } catch (error) {
        // Handle callback errors silently in production
        if (__DEV__) {
          console.error('Error in change listener:', error);
        }
      }
    });
  }

  private async getStoredData(key: string): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error getting stored data for key ${key}:`, error);
      return [];
    }
  }

  /**
   * Get completed emergency requests by responder
   */
  async getCompletedRequestsByResponder(responderId: string): Promise<DatabaseResult<EmergencyRequest[]>> {
    try {
      const allRequests = await this.getStoredData('emergency_requests');
      const completedRequests = allRequests.filter((request: EmergencyRequest) => 
        request.responded_by === responderId && 
        (request.status === 'completed' || request.status === 'responded')
      );
      
      return {
        success: true,
        data: completedRequests
      };
    } catch (error) {
      console.error('Error getting completed requests by responder:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to get completed requests'
      };
    }
  }

  /**
   * Get emergency requests by user with status filter
   */
  async getRequestsByUser(userId: string, status: 'active' | 'completed'): Promise<DatabaseResult<EmergencyRequest[]>> {
    try {
      const allRequests = await this.getStoredData('emergency_requests');
      let filteredRequests: EmergencyRequest[];
      
      if (status === 'active') {
        filteredRequests = allRequests.filter((request: EmergencyRequest) => 
          request.request_by === userId && request.status === 'open'
        );
      } else {
        filteredRequests = allRequests.filter((request: EmergencyRequest) => 
          request.request_by === userId && 
          (request.status === 'completed' || request.status === 'responded')
        );
      }
      
      return {
        success: true,
        data: filteredRequests
      };
    } catch (error) {
      console.error('Error getting requests by user:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to get user requests'
      };
    }
  }
}

// Export singleton instance
export const DatabaseService: IDatabaseService = new AsyncStorageDatabaseService();

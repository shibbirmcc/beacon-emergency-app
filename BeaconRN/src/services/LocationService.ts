// Location Service Implementation for GPS and location management
// Phase 2: Real implementation with react-native-geolocation-service

import Geolocation from 'react-native-geolocation-service';
import { PERMISSIONS, request, check, RESULTS } from 'react-native-permissions';
import { Platform } from 'react-native';
import { Location, DatabaseResult } from '../types';

export interface ILocationService {
  /**
   * Request location permissions from the user
   */
  requestLocationPermission(): Promise<boolean>;

  /**
   * Get the current location
   */
  getCurrentLocation(): Promise<DatabaseResult<Location>>;

  /**
   * Start continuous location tracking
   */
  startLocationTracking(callback: (location: Location) => void): Promise<DatabaseResult<boolean>>;

  /**
   * Stop location tracking
   */
  stopLocationTracking(): Promise<DatabaseResult<boolean>>;

  /**
   * Calculate distance between two locations
   */
  calculateDistance(loc1: Location, loc2: Location): number;

  /**
   * Check if location services are enabled
   */
  isLocationEnabled(): Promise<boolean>;

  /**
   * Get last known location (cached)
   */
  getLastKnownLocation(): Location | null;

  /**
   * Check if app has location permission
   */
  hasLocationPermission(): Promise<boolean>;
}

/**
 * Real Location Service Implementation using react-native-geolocation-service
 * Handles GPS location tracking, permissions, and distance calculations
 */
class GeolocationService implements ILocationService {
  private isTracking: boolean = false;
  private lastLocation: Location | null = null;
  private trackingCallback: ((location: Location) => void) | null = null;
  private watchId: number | null = null;

  async requestLocationPermission(): Promise<boolean> {
    try {
      const permission = Platform.select({
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      });

      if (!permission) {
        return false;
      }

      const result = await request(permission);
      return result === RESULTS.GRANTED;
    } catch (error) {
      return false;
    }
  }

  async getCurrentLocation(): Promise<DatabaseResult<Location>> {
    return new Promise((resolve) => {
      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      };

      Geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          
          this.lastLocation = location;
          resolve({ success: true, data: location });
        },
        (error) => {
          resolve({ 
            success: false, 
            error: `Failed to get current location: ${error.message}` 
          });
        },
        options
      );
    });
  }

  async startLocationTracking(callback: (location: Location) => void): Promise<DatabaseResult<boolean>> {
    try {
      // Check if we have permission first
      const hasPermission = await this.hasLocationPermission();
      if (!hasPermission) {
        return { 
          success: false, 
          error: 'Location permission not granted' 
        };
      }

      if (this.isTracking) {
        // Stop existing tracking
        await this.stopLocationTracking();
      }

      this.isTracking = true;
      this.trackingCallback = callback;

      const options = {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 5000,
        interval: 10000, // Update every 10 seconds
        fastestInterval: 5000, // Fastest update every 5 seconds
        forceRequestLocation: true,
        showLocationDialog: true,
      };

      this.watchId = Geolocation.watchPosition(
        (position) => {
          const location: Location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          
          this.lastLocation = location;
          
          if (this.trackingCallback) {
            this.trackingCallback(location);
          }
        },
        (error) => {
          // Handle error but continue tracking
          if (__DEV__) {
            console.warn('Location tracking error:', error.message);
          }
        },
        options
      );

      return { success: true, data: true };
    } catch (error) {
      this.isTracking = false;
      return { 
        success: false, 
        error: `Failed to start location tracking: ${error}` 
      };
    }
  }

  async stopLocationTracking(): Promise<DatabaseResult<boolean>> {
    try {
      if (this.watchId !== null) {
        Geolocation.clearWatch(this.watchId);
        this.watchId = null;
      }
      
      this.isTracking = false;
      this.trackingCallback = null;
      
      return { success: true, data: true };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to stop location tracking: ${error}` 
      };
    }
  }

  calculateDistance(loc1: Location, loc2: Location): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(loc2.lat - loc1.lat);
    const dLon = this.toRadians(loc2.lon - loc1.lon);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(loc1.lat)) * Math.cos(this.toRadians(loc2.lat)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async isLocationEnabled(): Promise<boolean> {
    try {
      // Check if location services are enabled on the device
      return new Promise((resolve) => {
        Geolocation.getCurrentPosition(
          () => resolve(true),
          () => resolve(false),
          { timeout: 1000 }
        );
      });
    } catch (error) {
      return false;
    }
  }

  getLastKnownLocation(): Location | null {
    return this.lastLocation;
  }

  async hasLocationPermission(): Promise<boolean> {
    try {
      const permission = Platform.select({
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      });

      if (!permission) {
        return false;
      }

      const result = await check(permission);
      return result === RESULTS.GRANTED;
    } catch (error) {
      return false;
    }
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

/**
 * Mock Location Service for development/testing
 * Simulates GPS location updates around Stockholm
 */
class MockLocationService implements ILocationService {
  private isTracking: boolean = false;
  private lastLocation: Location | null = null;
  private trackingCallback: ((location: Location) => void) | null = null;
  private trackingInterval: any = null;

  async requestLocationPermission(): Promise<boolean> {
    // Mock permission request
    return Promise.resolve(true);
  }

  async getCurrentLocation(): Promise<DatabaseResult<Location>> {
    // Mock Stockholm location with slight variation
    const mockLocation: Location = {
      lat: 59.3293 + (Math.random() - 0.5) * 0.01,
      lon: 18.0686 + (Math.random() - 0.5) * 0.01,
    };

    this.lastLocation = mockLocation;
    return { success: true, data: mockLocation };
  }

  async startLocationTracking(callback: (location: Location) => void): Promise<DatabaseResult<boolean>> {
    this.isTracking = true;
    this.trackingCallback = callback;

    // Simulate location updates every 10 seconds
    this.trackingInterval = setInterval(() => {
      if (this.isTracking && this.trackingCallback) {
        const baseLocation = { lat: 59.3293, lon: 18.0686 };
        const mockLocation: Location = {
          lat: baseLocation.lat + (Math.random() - 0.5) * 0.02,
          lon: baseLocation.lon + (Math.random() - 0.5) * 0.02,
        };

        this.lastLocation = mockLocation;
        this.trackingCallback(mockLocation);
      }
    }, 10000);

    // Send initial location immediately
    const initialLocation = await this.getCurrentLocation();
    if (initialLocation.success && this.trackingCallback) {
      this.trackingCallback(initialLocation.data!);
    }

    return { success: true, data: true };
  }

  async stopLocationTracking(): Promise<DatabaseResult<boolean>> {
    this.isTracking = false;
    this.trackingCallback = null;
    
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
    
    return { success: true, data: true };
  }

  calculateDistance(loc1: Location, loc2: Location): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(loc2.lat - loc1.lat);
    const dLon = this.toRadians(loc2.lon - loc1.lon);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(loc1.lat)) * Math.cos(this.toRadians(loc2.lat)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async isLocationEnabled(): Promise<boolean> {
    return Promise.resolve(true);
  }

  getLastKnownLocation(): Location | null {
    return this.lastLocation;
  }

  async hasLocationPermission(): Promise<boolean> {
    return Promise.resolve(true);
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

// Export the appropriate service based on environment
// Use mock service in development, real service in production
const isDev = process.env.NODE_ENV === 'development';
export const LocationService: ILocationService = isDev 
  ? new MockLocationService() 
  : new GeolocationService();

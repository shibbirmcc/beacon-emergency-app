import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Location } from '../../types';

export interface LocationState {
  currentLocation: Location | null;
  isLocationEnabled: boolean;
  isTracking: boolean;
  locationPermissionGranted: boolean;
  lastLocationUpdate: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: LocationState = {
  currentLocation: null,
  isLocationEnabled: false,
  isTracking: false,
  locationPermissionGranted: false,
  lastLocationUpdate: null,
  isLoading: false,
  error: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setCurrentLocation: (state, action: PayloadAction<Location>) => {
      state.currentLocation = action.payload;
      state.lastLocationUpdate = new Date().toISOString();
      state.error = null;
    },
    setLocationEnabled: (state, action: PayloadAction<boolean>) => {
      state.isLocationEnabled = action.payload;
    },
    setTracking: (state, action: PayloadAction<boolean>) => {
      state.isTracking = action.payload;
    },
    setLocationPermission: (state, action: PayloadAction<boolean>) => {
      state.locationPermissionGranted = action.payload;
    },
    setLocationLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setLocationError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearLocationError: (state) => {
      state.error = null;
    },
    resetLocationState: (state) => {
      state.currentLocation = null;
      state.isTracking = false;
      state.lastLocationUpdate = null;
      state.error = null;
    },
  },
});

export const {
  setCurrentLocation,
  setLocationEnabled,
  setTracking,
  setLocationPermission,
  setLocationLoading,
  setLocationError,
  clearLocationError,
  resetLocationState,
} = locationSlice.actions;

export default locationSlice.reducer;

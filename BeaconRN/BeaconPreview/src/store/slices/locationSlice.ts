import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Location, LocationState } from '../../types';

const initialState: LocationState = {
  currentLocation: null,
  isLocationEnabled: false,
  isTracking: false,
  locationPermissionGranted: false,
  lastLocationUpdate: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setCurrentLocation: (state, action: PayloadAction<Location>) => {
      state.currentLocation = action.payload;
      state.lastLocationUpdate = new Date().toISOString();
    },
    setLocationEnabled: (state, action: PayloadAction<boolean>) => {
      state.isLocationEnabled = action.payload;
    },
    setLocationTracking: (state, action: PayloadAction<boolean>) => {
      state.isTracking = action.payload;
    },
    setLocationPermissionGranted: (state, action: PayloadAction<boolean>) => {
      state.locationPermissionGranted = action.payload;
    },
    clearLocation: (state) => {
      state.currentLocation = null;
      state.lastLocationUpdate = null;
    },
  },
});

export const {
  setCurrentLocation,
  setLocationEnabled,
  setLocationTracking,
  setLocationPermissionGranted,
  clearLocation,
} = locationSlice.actions;

export default locationSlice.reducer;

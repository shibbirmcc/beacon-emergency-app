import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EmergencyRequest, EmergencyState, User } from '../../types';

const initialState: EmergencyState = {
  activeRequests: [],
  completedRequests: [],
  nearbyResponders: [],
  isCreatingRequest: false,
  lastRequestError: null,
};

const emergencySlice = createSlice({
  name: 'emergency',
  initialState,
  reducers: {
    setActiveRequests: (state, action: PayloadAction<EmergencyRequest[]>) => {
      state.activeRequests = action.payload;
    },
    addEmergencyRequest: (state, action: PayloadAction<EmergencyRequest>) => {
      state.activeRequests.push(action.payload);
    },
    updateEmergencyRequest: (state, action: PayloadAction<EmergencyRequest>) => {
      const index = state.activeRequests.findIndex(req => req.id === action.payload.id);
      if (index !== -1) {
        state.activeRequests[index] = action.payload;
      }
    },
    setNearbyResponders: (state, action: PayloadAction<User[]>) => {
      state.nearbyResponders = action.payload;
    },
    setIsCreatingRequest: (state, action: PayloadAction<boolean>) => {
      state.isCreatingRequest = action.payload;
    },
    setRequestError: (state, action: PayloadAction<string | null>) => {
      state.lastRequestError = action.payload;
    },
    clearRequestError: (state) => {
      state.lastRequestError = null;
    },
  },
});

export const {
  setActiveRequests,
  addEmergencyRequest,
  updateEmergencyRequest,
  setNearbyResponders,
  setIsCreatingRequest,
  setRequestError,
  clearRequestError,
} = emergencySlice.actions;

export default emergencySlice.reducer;

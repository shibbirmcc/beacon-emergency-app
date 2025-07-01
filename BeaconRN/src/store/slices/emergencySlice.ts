import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EmergencyRequest, User } from '../../types';

export interface EmergencyState {
  activeRequests: EmergencyRequest[];
  completedRequests: EmergencyRequest[];
  nearbyResponders: User[];
  isCreatingRequest: boolean;
  isLoadingRequests: boolean;
  isLoadingResponders: boolean;
  lastRequestError: string | null;
}

const initialState: EmergencyState = {
  activeRequests: [],
  completedRequests: [],
  nearbyResponders: [],
  isCreatingRequest: false,
  isLoadingRequests: false,
  isLoadingResponders: false,
  lastRequestError: null,
};

const emergencySlice = createSlice({
  name: 'emergency',
  initialState,
  reducers: {
    setActiveRequests: (state, action: PayloadAction<EmergencyRequest[]>) => {
      state.activeRequests = action.payload;
      state.isLoadingRequests = false;
      state.lastRequestError = null;
    },
    setCompletedRequests: (state, action: PayloadAction<EmergencyRequest[]>) => {
      state.completedRequests = action.payload;
      state.isLoadingRequests = false;
    },
    addEmergencyRequest: (state, action: PayloadAction<EmergencyRequest>) => {
      state.activeRequests.unshift(action.payload);
      state.isCreatingRequest = false;
      state.lastRequestError = null;
    },
    updateEmergencyRequest: (state, action: PayloadAction<EmergencyRequest>) => {
      const index = state.activeRequests.findIndex(req => req.id === action.payload.id);
      if (index !== -1) {
        state.activeRequests[index] = action.payload;
        
        // Move to completed if status is completed
        if (action.payload.status === 'completed') {
          const completedRequest = state.activeRequests.splice(index, 1)[0];
          state.completedRequests.unshift(completedRequest);
        }
      }
    },
    setNearbyResponders: (state, action: PayloadAction<User[]>) => {
      state.nearbyResponders = action.payload;
      state.isLoadingResponders = false;
    },
    addNearbyResponder: (state, action: PayloadAction<User>) => {
      const existingIndex = state.nearbyResponders.findIndex(r => r.id === action.payload.id);
      if (existingIndex !== -1) {
        state.nearbyResponders[existingIndex] = action.payload;
      } else {
        state.nearbyResponders.push(action.payload);
      }
    },
    removeNearbyResponder: (state, action: PayloadAction<string>) => {
      state.nearbyResponders = state.nearbyResponders.filter(r => r.id !== action.payload);
    },
    setCreatingRequest: (state, action: PayloadAction<boolean>) => {
      state.isCreatingRequest = action.payload;
    },
    setLoadingRequests: (state, action: PayloadAction<boolean>) => {
      state.isLoadingRequests = action.payload;
    },
    setLoadingResponders: (state, action: PayloadAction<boolean>) => {
      state.isLoadingResponders = action.payload;
    },
    setRequestError: (state, action: PayloadAction<string | null>) => {
      state.lastRequestError = action.payload;
      state.isCreatingRequest = false;
      state.isLoadingRequests = false;
    },
    clearRequestError: (state) => {
      state.lastRequestError = null;
    },
    clearAllRequests: (state) => {
      state.activeRequests = [];
      state.completedRequests = [];
      state.nearbyResponders = [];
    },
  },
});

export const {
  setActiveRequests,
  setCompletedRequests,
  addEmergencyRequest,
  updateEmergencyRequest,
  setNearbyResponders,
  addNearbyResponder,
  removeNearbyResponder,
  setCreatingRequest,
  setLoadingRequests,
  setLoadingResponders,
  setRequestError,
  clearRequestError,
  clearAllRequests,
} = emergencySlice.actions;

export default emergencySlice.reducer;

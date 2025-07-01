import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserPreferences } from '../../types';

export interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  userPreferences: UserPreferences;
  isLoading: boolean;
  error: string | null;
}

const initialUserPreferences: UserPreferences = {
  notificationsEnabled: true,
  locationSharingEnabled: true,
  emergencyRadius: 50,
  language: 'en',
};

const initialState: UserState = {
  currentUser: null,
  isAuthenticated: false,
  userPreferences: initialUserPreferences,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    updateUserLocation: (state, action: PayloadAction<{ latitude: number; longitude: number }>) => {
      if (state.currentUser) {
        state.currentUser.location = {
          latitude: action.payload.latitude,
          longitude: action.payload.longitude,
          timestamp: Date.now(),
        };
        state.currentUser.lastUpdated = new Date().toISOString();
      }
    },
    updateUserStatus: (state, action: PayloadAction<'available' | 'occupied' | 'unavailable'>) => {
      if (state.currentUser) {
        state.currentUser.status = action.payload;
        state.currentUser.lastUpdated = new Date().toISOString();
      }
    },
    updateUserPreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.userPreferences = { ...state.userPreferences, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setUser,
  updateUserLocation,
  updateUserStatus,
  updateUserPreferences,
  setLoading,
  setError,
  logout,
  clearError,
} = userSlice.actions;

export default userSlice.reducer;

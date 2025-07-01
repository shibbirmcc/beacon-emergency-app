import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserPreferences, UserState } from '../../types';
import { DEFAULT_USER_PREFERENCES } from '../../constants';

const initialState: UserState = {
  currentUser: null,
  isAuthenticated: false,
  userPreferences: DEFAULT_USER_PREFERENCES,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
    setUserPreferences: (state, action: PayloadAction<UserPreferences>) => {
      state.userPreferences = action.payload;
    },
    updateUserPreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.userPreferences = { ...state.userPreferences, ...action.payload };
    },
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.userPreferences = DEFAULT_USER_PREFERENCES;
    },
  },
});

export const { setUser, updateUser, setUserPreferences, updateUserPreferences, logout } = userSlice.actions;
export default userSlice.reducer;

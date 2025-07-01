import { configureStore } from '@reduxjs/toolkit';
import userSlice from './slices/userSlice';
import emergencySlice from './slices/emergencySlice';
import locationSlice from './slices/locationSlice';
import networkSlice from './slices/networkSlice';

export const store = configureStore({
  reducer: {
    user: userSlice,
    emergency: emergencySlice,
    location: locationSlice,
    network: networkSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

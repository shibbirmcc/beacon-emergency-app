import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NetworkState {
  isOnline: boolean;
  isConnectedToSyncGateway: boolean;
  connectedPeers: string[];
  syncStatus: 'idle' | 'syncing' | 'completed' | 'error';
  lastSyncTime: string | null;
  syncError: string | null;
}

const initialState: NetworkState = {
  isOnline: true,
  isConnectedToSyncGateway: false,
  connectedPeers: [],
  syncStatus: 'idle',
  lastSyncTime: null,
  syncError: null,
};

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    setSyncGatewayConnection: (state, action: PayloadAction<boolean>) => {
      state.isConnectedToSyncGateway = action.payload;
    },
    setConnectedPeers: (state, action: PayloadAction<string[]>) => {
      state.connectedPeers = action.payload;
    },
    addConnectedPeer: (state, action: PayloadAction<string>) => {
      if (!state.connectedPeers.includes(action.payload)) {
        state.connectedPeers.push(action.payload);
      }
    },
    removeConnectedPeer: (state, action: PayloadAction<string>) => {
      state.connectedPeers = state.connectedPeers.filter(peer => peer !== action.payload);
    },
    setSyncStatus: (state, action: PayloadAction<'idle' | 'syncing' | 'completed' | 'error'>) => {
      state.syncStatus = action.payload;
      if (action.payload === 'completed') {
        state.lastSyncTime = new Date().toISOString();
        state.syncError = null;
      }
    },
    setSyncError: (state, action: PayloadAction<string | null>) => {
      state.syncError = action.payload;
      if (action.payload) {
        state.syncStatus = 'error';
      }
    },
    clearSyncError: (state) => {
      state.syncError = null;
    },
  },
});

export const {
  setOnlineStatus,
  setSyncGatewayConnection,
  setConnectedPeers,
  addConnectedPeer,
  removeConnectedPeer,
  setSyncStatus,
  setSyncError,
  clearSyncError,
} = networkSlice.actions;

export default networkSlice.reducer;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NetworkState, ReplicationStatus } from '../../types';

const initialState: NetworkState = {
  isOnline: true,
  isConnectedToSyncGateway: false,
  connectedPeers: [],
  lastSyncTime: null,
  replicationStatus: {
    syncGateway: {
      isActive: false,
      lastSync: null,
      error: null,
    },
    p2p: {
      isListening: false,
      connectedPeers: 0,
      lastActivity: null,
    },
  },
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
    setLastSyncTime: (state, action: PayloadAction<string>) => {
      state.lastSyncTime = action.payload;
    },
    setReplicationStatus: (state, action: PayloadAction<ReplicationStatus>) => {
      state.replicationStatus = action.payload;
    },
    updateSyncGatewayStatus: (state, action: PayloadAction<Partial<ReplicationStatus['syncGateway']>>) => {
      state.replicationStatus.syncGateway = {
        ...state.replicationStatus.syncGateway,
        ...action.payload,
      };
    },
    updateP2PStatus: (state, action: PayloadAction<Partial<ReplicationStatus['p2p']>>) => {
      state.replicationStatus.p2p = {
        ...state.replicationStatus.p2p,
        ...action.payload,
      };
    },
  },
});

export const {
  setOnlineStatus,
  setSyncGatewayConnection,
  setConnectedPeers,
  setLastSyncTime,
  setReplicationStatus,
  updateSyncGatewayStatus,
  updateP2PStatus,
} = networkSlice.actions;

export default networkSlice.reducer;

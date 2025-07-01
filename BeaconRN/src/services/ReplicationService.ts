// Replication Service Interface for Sync Gateway and P2P replication
// This handles all data synchronization scenarios

import { ReplicationConfig, P2PConfig, DatabaseResult, ReplicationStatusType } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ReplicationStatus = ReplicationStatusType;

export interface IReplicationService {
  startSyncGatewayReplication(config: ReplicationConfig): Promise<DatabaseResult<boolean>>;
  stopSyncGatewayReplication(): Promise<DatabaseResult<boolean>>;
  startP2PListener(config: P2PConfig): Promise<DatabaseResult<boolean>>;
  stopP2PListener(): Promise<DatabaseResult<boolean>>;
  connectToPeers(peerUris: string[]): Promise<DatabaseResult<string[]>>;
  disconnectFromPeer(peerUri: string): Promise<DatabaseResult<boolean>>;
  handleConflictResolution(conflict: any): Promise<any>;
  getReplicationStatus(): ReplicationStatus;
  onReplicationStatusChange(callback: (status: ReplicationStatus) => void): string;
  removeStatusChangeListener(listenerId: string): void;
  getConnectedPeers(): string[];
  forceSync(): Promise<DatabaseResult<boolean>>;
}

/**
 * Real Replication Service Implementation with HTTP-based Sync Gateway support
 * P2P features are stubbed for now and will need native implementation later
 */
class ReplicationServiceImpl implements IReplicationService {
  private status: ReplicationStatus = 'stopped';
  private connectedPeers: string[] = [];
  private listeners: Map<string, (status: ReplicationStatus) => void> = new Map();
  private syncGatewayConfig: ReplicationConfig | null = null;
  private syncInterval: any = null;
  private lastSyncTimestamp: Date | null = null;

  constructor() {
    this.loadPersistedState();
  }

  private async loadPersistedState(): Promise<void> {
    try {
      const savedConfig = await AsyncStorage.getItem('sync_gateway_config');
      if (savedConfig) {
        this.syncGatewayConfig = JSON.parse(savedConfig);
      }

      const lastSync = await AsyncStorage.getItem('last_sync_timestamp');
      if (lastSync) {
        this.lastSyncTimestamp = new Date(lastSync);
      }
    } catch (error) {
      console.error('Failed to load replication state:', error);
    }
  }

  private async persistState(): Promise<void> {
    try {
      if (this.syncGatewayConfig) {
        await AsyncStorage.setItem('sync_gateway_config', JSON.stringify(this.syncGatewayConfig));
      }
      if (this.lastSyncTimestamp) {
        await AsyncStorage.setItem('last_sync_timestamp', this.lastSyncTimestamp.toISOString());
      }
    } catch (error) {
      console.error('Failed to persist replication state:', error);
    }
  }

  async startSyncGatewayReplication(config: ReplicationConfig): Promise<DatabaseResult<boolean>> {
    try {
      this.setStatus('connecting');
      this.syncGatewayConfig = config;

      const testResult = await this.testSyncGatewayConnection(config);
      if (!testResult.success) {
        this.setStatus('error');
        return testResult;
      }

      this.startPeriodicSync();
      this.setStatus('connected');
      await this.persistState();

      return { success: true, data: true };
    } catch (error) {
      this.setStatus('error');
      return {
        success: false,
        error: `Failed to start Sync Gateway replication: ${error}`,
        data: false
      };
    }
  }

  async stopSyncGatewayReplication(): Promise<DatabaseResult<boolean>> {
    try {
      this.setStatus('stopped');
      this.syncGatewayConfig = null;
      
      if (this.syncInterval) {
        clearInterval(this.syncInterval);
        this.syncInterval = null;
      }

      await AsyncStorage.removeItem('sync_gateway_config');
      return { success: true, data: true };
    } catch (error) {
      return {
        success: false,
        error: `Failed to stop replication: ${error}`,
        data: false
      };
    }
  }

  private async testSyncGatewayConnection(config: ReplicationConfig): Promise<DatabaseResult<boolean>> {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };

      if (config.username && config.password) {
        headers['Authorization'] = `Basic ${btoa(`${config.username}:${config.password}`)}`;
      }

      const response = await fetch(`${config.syncGatewayUrl}/_all_dbs`, {
        method: 'GET',
        headers,
      });

      if (response.ok) {
        return { success: true, data: true };
      } else {
        return {
          success: false,
          error: `Sync Gateway connection failed: ${response.status} ${response.statusText}`,
          data: false
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Network error connecting to Sync Gateway: ${error}`,
        data: false
      };
    }
  }

  private startPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      this.performSync();
    }, 30000);

    this.performSync();
  }

  private async performSync(): Promise<void> {
    if (!this.syncGatewayConfig || this.status !== 'connected') {
      return;
    }

    try {
      this.setStatus('syncing');
      await this.pushChangesToSyncGateway();
      await this.pullChangesFromSyncGateway();
      this.lastSyncTimestamp = new Date();
      await this.persistState();
      this.setStatus('connected');
    } catch (error) {
      console.error('Sync operation failed:', error);
      this.setStatus('error');
    }
  }

  private async pushChangesToSyncGateway(): Promise<void> {
    if (!this.syncGatewayConfig) return;

    try {
      const localChanges = await this.getLocalChangesSinceLastSync();
      if (localChanges.length === 0) return;

      const headers: any = {
        'Content-Type': 'application/json',
      };

      if (this.syncGatewayConfig.username && this.syncGatewayConfig.password) {
        headers['Authorization'] = `Basic ${btoa(`${this.syncGatewayConfig.username}:${this.syncGatewayConfig.password}`)}`;
      }

      const response = await fetch(`${this.syncGatewayConfig.syncGatewayUrl}/_bulk_docs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          docs: localChanges,
        }),
      });

      if (!response.ok) {
        throw new Error(`Push failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Push completed:', result);
    } catch (error) {
      console.error('Push to Sync Gateway failed:', error);
      throw error;
    }
  }

  private async pullChangesFromSyncGateway(): Promise<void> {
    if (!this.syncGatewayConfig) return;

    try {
      const since = this.lastSyncTimestamp ? 
        this.lastSyncTimestamp.toISOString() : '0';

      const headers: any = {
        'Content-Type': 'application/json',
      };

      if (this.syncGatewayConfig.username && this.syncGatewayConfig.password) {
        headers['Authorization'] = `Basic ${btoa(`${this.syncGatewayConfig.username}:${this.syncGatewayConfig.password}`)}`;
      }

      const response = await fetch(`${this.syncGatewayConfig.syncGatewayUrl}/_changes?since=${since}&include_docs=true`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Pull failed: ${response.status} ${response.statusText}`);
      }

      const changes = await response.json();
      await this.applyRemoteChangesToLocal(changes.results);
      console.log('Pull completed:', changes.results.length, 'changes');
    } catch (error) {
      console.error('Pull from Sync Gateway failed:', error);
      throw error;
    }
  }

  private async getLocalChangesSinceLastSync(): Promise<any[]> {
    try {
      const allDocs = await AsyncStorage.getItem('emergency_requests');
      if (!allDocs) return [];

      const docs = JSON.parse(allDocs);
      const since = this.lastSyncTimestamp ? this.lastSyncTimestamp.getTime() : 0;

      return docs.filter((doc: any) => 
        new Date(doc.updatedAt || doc.createdAt).getTime() > since
      );
    } catch (error) {
      console.error('Failed to get local changes:', error);
      return [];
    }
  }

  private async applyRemoteChangesToLocal(changes: any[]): Promise<void> {
    try {
      for (const change of changes) {
        if (change.doc && !change.deleted) {
          await this.mergeRemoteDocumentToLocal(change.doc);
        } else if (change.deleted) {
          await this.deleteLocalDocument(change.id);
        }
      }
    } catch (error) {
      console.error('Failed to apply remote changes:', error);
      throw error;
    }
  }

  private async mergeRemoteDocumentToLocal(remoteDoc: any): Promise<void> {
    try {
      const key = `doc_${remoteDoc._id}`;
      await AsyncStorage.setItem(key, JSON.stringify(remoteDoc));
    } catch (error) {
      console.error('Failed to merge remote document:', error);
    }
  }

  private async deleteLocalDocument(docId: string): Promise<void> {
    try {
      const key = `doc_${docId}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to delete local document:', error);
    }
  }

  // P2P Methods (stubbed for now)
  async startP2PListener(config: P2PConfig): Promise<DatabaseResult<boolean>> {
    return {
      success: false,
      error: 'P2P functionality requires native implementation',
      data: false
    };
  }

  async stopP2PListener(): Promise<DatabaseResult<boolean>> {
    this.connectedPeers = [];
    return { success: true, data: true };
  }

  async connectToPeers(peerUris: string[]): Promise<DatabaseResult<string[]>> {
    return {
      success: false,
      error: 'P2P functionality requires native implementation',
      data: []
    };
  }

  async disconnectFromPeer(peerUri: string): Promise<DatabaseResult<boolean>> {
    this.connectedPeers = this.connectedPeers.filter(peer => peer !== peerUri);
    return { success: true, data: true };
  }

  async handleConflictResolution(conflict: any): Promise<any> {
    const localDoc = conflict.localDocument;
    const remoteDoc = conflict.remoteDocument;

    if (!localDoc) return remoteDoc;
    if (!remoteDoc) return localDoc;

    const localTime = new Date(localDoc.updatedAt || localDoc.createdAt).getTime();
    const remoteTime = new Date(remoteDoc.updatedAt || remoteDoc.createdAt).getTime();

    return remoteTime > localTime ? remoteDoc : localDoc;
  }

  getReplicationStatus(): ReplicationStatus {
    return this.status;
  }

  onReplicationStatusChange(callback: (status: ReplicationStatus) => void): string {
    const id = `repl_listener_${Date.now()}_${Math.random()}`;
    this.listeners.set(id, callback);
    return id;
  }

  removeStatusChangeListener(listenerId: string): void {
    this.listeners.delete(listenerId);
  }

  getConnectedPeers(): string[] {
    return [...this.connectedPeers];
  }

  async forceSync(): Promise<DatabaseResult<boolean>> {
    if (!this.syncGatewayConfig) {
      return {
        success: false,
        error: 'No Sync Gateway configuration available',
        data: false
      };
    }

    try {
      await this.performSync();
      return { success: true, data: true };
    } catch (error) {
      return {
        success: false,
        error: `Force sync failed: ${error}`,
        data: false
      };
    }
  }

  private setStatus(newStatus: ReplicationStatus): void {
    this.status = newStatus;
    this.listeners.forEach(callback => {
      try {
        callback(newStatus);
      } catch (error) {
        console.error('Replication status callback error:', error);
      }
    });
  }
}

// Export singleton instance
export const replicationService = new ReplicationServiceImpl();

// For testing purposes, also export the class
export { ReplicationServiceImpl as ReplicationService };

import { ref, set, remove, onValue, get, Unsubscribe } from 'firebase/database';
import { rtdb } from './firebase';

export type SyncCollection = 
  | 'events'
  | 'crew'
  | 'eventCharges'
  | 'clients'
  | 'quotations'
  | 'invoices'
  | 'enquiries'
  | 'payments'
  | 'expenses'
  | 'planners'
  | 'partners'
  | 'locations'
  | 'companySettings';

export interface SyncStatus {
  isConnected: boolean;
  lastSyncedAt: Date | null;
  activeCollections: string[];
}

// Storage keys mapping
export const RTDB_STORAGE_KEYS: Record<SyncCollection, string> = {
  events: 'tmc_events_v2',
  crew: 'tmc_crew_roster_v2',
  eventCharges: 'tmc_event_charges',
  clients: 'tmc_clients',
  quotations: 'tmc_quotations',
  invoices: 'tmc_invoices_v1',
  enquiries: 'tmc_enquiries',
  payments: 'tmc_payments',
  expenses: 'tmc_expenses_v2',
  planners: 'tmc_planners_v1',
  partners: 'tmc_partners_v1',
  locations: 'tmc_locations',
  companySettings: 'tmc_company_settings_v1'
};

class RealtimeSyncManager {
  private isConnected = false;
  private lastSyncedAt: Date | null = null;
  private listeners: Unsubscribe[] = [];
  private isInitialized = false;
  private statusListeners: ((status: SyncStatus) => void)[] = [];
  private isSyncingFromRemote = false;

  public getStatus(): SyncStatus {
    return {
      isConnected: this.isConnected,
      lastSyncedAt: this.lastSyncedAt,
      activeCollections: Object.keys(RTDB_STORAGE_KEYS)
    };
  }

  public subscribeStatus(listener: (status: SyncStatus) => void): () => void {
    this.statusListeners.push(listener);
    listener(this.getStatus());
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== listener);
    };
  }

  private notifyStatus() {
    const status = this.getStatus();
    this.statusListeners.forEach(listener => {
      try {
        listener(status);
      } catch (err) {
        console.error('Error notifying sync listener:', err);
      }
    });
  }

  /**
   * Initializes the connection listeners and syncs all collections bidirectionally.
   */
  public initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    if (!rtdb) {
      console.warn('Realtime Database is not available on this platform.');
      return;
    }

    // 1. Listen for connection status changes via Firebase RTDB special path
    try {
      const connectedRef = ref(rtdb, '.info/connected');
      onValue(connectedRef, (snap) => {
        this.isConnected = !!snap.val();
        this.lastSyncedAt = new Date();
        this.notifyStatus();
      });
    } catch (err) {
      console.warn('Error listening to .info/connected:', err);
    }

    // 2. Setup bidirectional listeners for every collection
    const collections: SyncCollection[] = [
      'events',
      'crew',
      'eventCharges',
      'clients',
      'quotations',
      'invoices',
      'enquiries',
      'payments',
      'expenses',
      'planners',
      'partners',
      'locations',
      'companySettings'
    ];

    collections.forEach(col => {
      this.setupCollectionListener(col);
    });

    // 3. Initial check: Seed remote RTDB if empty, or hydrate local if RTDB has data
    this.initialBootstrap(collections);
  }

  /**
   * Listens to live changes on a specific collection node in RTDB.
   */
  private setupCollectionListener(col: SyncCollection) {
    if (!rtdb) return;
    const colRef = ref(rtdb, col);
    const storageKey = RTDB_STORAGE_KEYS[col];

    const unsubscribe = onValue(
      colRef,
      (snapshot) => {
        const val = snapshot.val();
        this.lastSyncedAt = new Date();
        this.notifyStatus();

        if (val === null || val === undefined) {
          return;
        }

        try {
          this.isSyncingFromRemote = true;

          if (col === 'companySettings') {
            // Singleton object
            const currentLocal = localStorage.getItem(storageKey);
            const valStr = JSON.stringify(val);
            if (currentLocal !== valStr) {
              localStorage.setItem(storageKey, valStr);
              window.dispatchEvent(new CustomEvent('tmc_storage_updated', { detail: { collection: col } }));
            }
          } else {
            // Collection array
            const items = Array.isArray(val) 
              ? val.filter(Boolean) 
              : Object.values(val).filter(Boolean);

            const itemsStr = JSON.stringify(items);
            const currentLocal = localStorage.getItem(storageKey);

            if (currentLocal !== itemsStr) {
              localStorage.setItem(storageKey, itemsStr);
              window.dispatchEvent(new CustomEvent('tmc_storage_updated', { detail: { collection: col } }));
            }
          }
        } finally {
          this.isSyncingFromRemote = false;
        }
      },
      (error) => {
        console.warn(`RTDB listener notice for ${col}:`, error.message);
      }
    );

    this.listeners.push(unsubscribe);
  }

  /**
   * Initial bootstrap: Checks each collection. If remote is empty, pushes local.
   * If remote has items, loads them into local storage.
   */
  private async initialBootstrap(collections: SyncCollection[]) {
    if (!rtdb) return;

    for (const col of collections) {
      try {
        const colRef = ref(rtdb, col);
        const snapshot = await get(colRef);
        const remoteVal = snapshot.val();
        const storageKey = RTDB_STORAGE_KEYS[col];
        const localRaw = localStorage.getItem(storageKey);

        if (remoteVal !== null && remoteVal !== undefined) {
          // Remote has data: hydrate local
          if (col === 'companySettings') {
            localStorage.setItem(storageKey, JSON.stringify(remoteVal));
          } else {
            const items = Array.isArray(remoteVal) 
              ? remoteVal.filter(Boolean) 
              : Object.values(remoteVal).filter(Boolean);
            if (items.length > 0) {
              localStorage.setItem(storageKey, JSON.stringify(items));
            }
          }
        } else if (localRaw) {
          // Remote is empty, seed from local
          try {
            const parsed = JSON.parse(localRaw);
            if (col === 'companySettings') {
              if (parsed && typeof parsed === 'object') {
                await set(colRef, parsed);
              }
            } else if (Array.isArray(parsed) && parsed.length > 0) {
              const dict: Record<string, any> = {};
              parsed.forEach((item: any, idx: number) => {
                const key = item.id || `item_${idx}`;
                dict[key] = item;
              });
              await set(colRef, dict);
            }
          } catch {
            // ignore JSON parse error on bad local
          }
        }
      } catch (err) {
        console.warn(`Bootstrap check error on ${col}:`, err);
      }
    }

    // Dispatch global update to refresh React UI with freshly bootstrapped data
    window.dispatchEvent(new CustomEvent('tmc_storage_updated', { detail: { source: 'bootstrap' } }));
  }

  /**
   * Save a single item in a collection to RTDB.
   */
  public async saveItem<T extends { id?: string }>(col: SyncCollection, item: T): Promise<void> {
    if (!rtdb || this.isSyncingFromRemote) return;
    const itemId = item.id;
    if (!itemId) {
      console.warn(`Cannot sync item without id in collection ${col}`);
      return;
    }
    try {
      const itemRef = ref(rtdb, `${col}/${itemId}`);
      await set(itemRef, item);
      this.lastSyncedAt = new Date();
      this.notifyStatus();
    } catch (err: any) {
      console.warn(`RTDB saveItem error on ${col}/${itemId}:`, err.message);
    }
  }

  /**
   * Remove a single item from RTDB.
   */
  public async removeItem(col: SyncCollection, itemId: string): Promise<void> {
    if (!rtdb || this.isSyncingFromRemote) return;
    try {
      const itemRef = ref(rtdb, `${col}/${itemId}`);
      await remove(itemRef);
      this.lastSyncedAt = new Date();
      this.notifyStatus();
    } catch (err: any) {
      console.warn(`RTDB removeItem error on ${col}/${itemId}:`, err.message);
    }
  }

  /**
   * Overwrite entire collection in RTDB with an array of items.
   */
  public async syncAllItems<T extends { id?: string }>(col: SyncCollection, items: T[]): Promise<void> {
    if (!rtdb || this.isSyncingFromRemote) return;
    try {
      const dict: Record<string, any> = {};
      items.forEach((item, idx) => {
        const key = item.id || `item_${idx}`;
        dict[key] = item;
      });
      const colRef = ref(rtdb, col);
      await set(colRef, dict);
      this.lastSyncedAt = new Date();
      this.notifyStatus();
    } catch (err: any) {
      console.warn(`RTDB syncAllItems error on ${col}:`, err.message);
    }
  }

  /**
   * Save singleton object (e.g. companySettings) to RTDB.
   */
  public async saveSingleton<T>(col: SyncCollection, data: T): Promise<void> {
    if (!rtdb || this.isSyncingFromRemote) return;
    try {
      const colRef = ref(rtdb, col);
      await set(colRef, data);
      this.lastSyncedAt = new Date();
      this.notifyStatus();
    } catch (err: any) {
      console.warn(`RTDB saveSingleton error on ${col}:`, err.message);
    }
  }

  public cleanup() {
    this.listeners.forEach(unsub => unsub());
    this.listeners = [];
    this.statusListeners = [];
    this.isInitialized = false;
  }
}

export const RealtimeSyncService = new RealtimeSyncManager();

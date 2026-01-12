export interface Store {
    id: string;
    name: string;
    url: string;
    syncStatus: 'PENDING' | 'SYNCING' | 'COMPLETED' | 'FAILED';
    lastSyncAt: string | null;
    startDate?: string;
    endDate?: string;
    tags: string[];
}

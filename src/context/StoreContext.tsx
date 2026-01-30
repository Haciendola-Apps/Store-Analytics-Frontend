import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Store } from '../types/store.types';

interface StoreContextType {
    stores: Store[];
    selectedStore: Store | null;
    selectStore: (storeId: string) => void;
    refreshStores: (filters?: Record<string, string>) => Promise<void>;
    isLoading: boolean;
    deleteStore: (id: string) => Promise<void>;
    retrySync: (id: string, force?: boolean) => Promise<void>;
    updateStore: (id: string, data: Partial<Store> & { accessToken?: string }) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
    const [stores, setStores] = useState<Store[]>([]);
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchStores = useCallback(async (filters?: Record<string, string>) => {
        try {
            let url = 'http://localhost:3000/stores';
            if (filters && Object.keys(filters).length > 0) {
                const queryParams = new URLSearchParams();
                Object.entries(filters).forEach(([key, value]) => {
                    if (value) queryParams.append(key, value);
                });
                const queryString = queryParams.toString();
                if (queryString) url += `?${queryString}`;
            }

            console.log('Fetching stores from:', url);
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                console.log(`Fetched ${data.length} stores`);
                setStores(data);

                // Determine target ID:
                const targetId = selectedStore?.id || localStorage.getItem('selectedStoreId');
                const foundStore = data.find((s: Store) => s.id === targetId);

                if (foundStore) {
                    setSelectedStore(foundStore);
                } else if (data.length > 0 && !selectedStore) {
                    // Only fallback to first store if no store is currently selected
                    setSelectedStore(data[0]);
                    localStorage.setItem('selectedStoreId', data[0].id);
                }
            }
        } catch (error) {
            console.error('Failed to fetch stores:', error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedStore]);

    useEffect(() => {
        fetchStores();
    }, []);

    const selectStore = (storeId: string) => {
        const store = stores.find(s => s.id === storeId);
        if (store) {
            setSelectedStore(store);
            localStorage.setItem('selectedStoreId', storeId);
        }
    };

    const deleteStore = async (id: string) => {
        try {
            await fetch(`http://localhost:3000/stores/${id}`, { method: 'DELETE' });
            if (selectedStore?.id === id) {
                setSelectedStore(null);
            }
            await fetchStores();
        } catch (error) {
            console.error('Failed to delete store:', error);
            throw error;
        }
    };

    const retrySync = async (id: string, force: boolean = false) => {
        try {
            const response = await fetch(`http://localhost:3000/stores/${id}/sync${force ? '?force=true' : ''}`, { method: 'POST' });
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Sync failed');
            }

            await fetchStores();
        } catch (error) {
            console.error('Failed to retry sync:', error);
            throw error;
        }
    };

    const updateStore = async (id: string, data: Partial<Store> & { accessToken?: string }) => {
        try {
            const response = await fetch(`http://localhost:3000/stores/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to update store');
            await fetchStores();
        } catch (error) {
            console.error('Failed to update store:', error);
            throw error;
        }
    };

    return (
        <StoreContext.Provider value={{ stores, selectedStore, selectStore, refreshStores: fetchStores, isLoading, deleteStore, retrySync, updateStore }}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => {
    const context = useContext(StoreContext);
    if (context === undefined) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
};

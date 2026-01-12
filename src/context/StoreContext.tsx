import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Store } from '../types/store.types';

interface StoreContextType {
    stores: Store[];
    selectedStore: Store | null;
    selectStore: (storeId: string) => void;
    refreshStores: () => Promise<void>;
    isLoading: boolean;
    deleteStore: (id: string) => Promise<void>;
    retrySync: (id: string) => Promise<void>;
    updateStore: (id: string, data: Partial<Store> & { accessToken?: string }) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
    const [stores, setStores] = useState<Store[]>([]);
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchStores = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:3000/stores');
            if (response.ok) {
                const data = await response.json();
                setStores(data);

                // Update selected store reference if it exists in the new list
                if (selectedStore) {
                    const updated = data.find((s: Store) => s.id === selectedStore.id);
                    if (updated) {
                        setSelectedStore(updated);
                    }
                } else if (data.length > 0 && !selectedStore) {
                    // Auto-select first store if none selected
                    setSelectedStore(data[0]);
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

    const retrySync = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:3000/stores/${id}/sync`, { method: 'POST' });
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

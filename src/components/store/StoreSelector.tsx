import { useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { useSettings } from '../../context/SettingsContext';
import { CheckCircle2, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import { clsx } from 'clsx';

export const StoreSelector = () => {
    const { stores, selectedStore, selectStore, refreshStores, retrySync } = useStore();
    const { t } = useSettings();

    // Poll for status updates if current store is syncing
    useEffect(() => {
        let interval: any;
        if (selectedStore?.syncStatus === 'SYNCING') {
            interval = setInterval(() => {
                refreshStores();
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [selectedStore?.syncStatus, refreshStores]);

    const handleManualSync = async () => {
        if (selectedStore) {
            await retrySync(selectedStore.id, true);
        }
    };

    if (stores.length === 0) {
        return (
            <div className="text-sm text-muted-foreground">
                No stores connected
            </div>
        );
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle2 size={16} className="text-green-500" />;
            case 'SYNCING': return <RefreshCw size={16} className="text-blue-500 animate-spin" />;
            case 'FAILED': return <AlertCircle size={16} className="text-red-500" />;
            default: return <Clock size={16} className="text-gray-400" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'COMPLETED': return t('status.synced');
            case 'SYNCING': return t('status.syncing');
            case 'FAILED': return t('status.failed');
            default: return 'Pending';
        }
    };

    return (
        <div id="store-selector-container" className="flex items-center gap-3 bg-card border border-border rounded-lg px-3 py-2 shadow-sm">
            <div className="flex flex-col">
                <label id="store-selector-label" className="text-xs text-muted-foreground font-medium mb-0.5">{t('selector.currentStore')}</label>
                <select
                    id="select-active-store"
                    value={selectedStore?.id || ''}
                    onChange={(e) => selectStore(e.target.value)}
                    className="bg-transparent font-semibold text-sm focus:outline-none cursor-pointer min-w-[150px] text-foreground [&>option]:bg-card [&>option]:text-foreground"
                >
                    {stores.map(store => (
                        <option key={store.id} value={store.id} className="bg-card text-foreground">
                            {store.name}
                        </option>
                    ))}
                </select>
            </div>

            {selectedStore && (
                <div id="selected-store-status-container" className="flex items-center gap-2">
                    <div id={`store-status-badge-${selectedStore.id}`} className={clsx(
                        "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap",
                        selectedStore.syncStatus === 'COMPLETED' && "bg-green-500/10 border-green-500/20 text-green-700",
                        selectedStore.syncStatus === 'SYNCING' && "bg-blue-500/10 border-blue-500/20 text-blue-700",
                        selectedStore.syncStatus === 'FAILED' && "bg-red-500/10 border-red-500/20 text-red-700",
                        selectedStore.syncStatus === 'PENDING' && "bg-gray-500/10 border-gray-500/20 text-gray-700",
                    )}>
                        {getStatusIcon(selectedStore.syncStatus)}
                        <span id="selected-store-status-text">{getStatusText(selectedStore.syncStatus)}</span>
                    </div>

                    {selectedStore.syncStatus !== 'SYNCING' && (
                        <button
                            id="btn-force-resync"
                            onClick={handleManualSync}
                            className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-all"
                            title="Force full re-sync (fixes missing product data)"
                        >
                            <RefreshCw size={14} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

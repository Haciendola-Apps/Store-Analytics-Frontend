import { useStore } from '../../context/StoreContext';
import type { Store } from '../../types/store.types';
import { Trash2, RefreshCw, AlertCircle, CheckCircle2, Clock, Edit } from 'lucide-react';
import { useState } from 'react';
import { EditStoreModal } from './EditStoreModal';
import { DateRangePicker } from '../common/DateRangePicker';
import { clsx } from 'clsx';

export const Stores = () => {
    const { stores, deleteStore, retrySync, updateStore, isLoading, refreshStores } = useStore();
    const [editingStore, setEditingStore] = useState<Store | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isFilterVisible, setIsFilterVisible] = useState(true);
    const [filters, setFilters] = useState({
        name: '',
        url: '',
        status: '',
        tags: '',
        startDate: '',
        endDate: '',
        themeName: '',
        themeVersion: ''
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        const activeFilters: Record<string, string> = {};
        Object.entries(filters).forEach(([key, value]) => {
            if (value) activeFilters[key] = value;
        });
        refreshStores(activeFilters);
    };

    const clearFilters = () => {
        setFilters({ 
            name: '', 
            url: '', 
            status: '', 
            tags: '', 
            startDate: '', 
            endDate: '',
            themeName: '',
            themeVersion: ''
        });
        refreshStores({});
    };

    // We don't want to show the full-screen loading if we already have stores (e.g. while filtering)
    const isInitialLoading = isLoading && stores.length === 0;

    if (isInitialLoading) {
        return <div className="flex items-center justify-center h-64">Loading...</div>;
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this store?')) {
            await deleteStore(id);
        }
    };

    const handleRetry = async (id: string) => {
        setError(null);
        try {
            await retrySync(id);
        } catch (err: any) {
            setError(err.message || 'Failed to sync store');
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle2 size={18} className="text-green-500" />;
            case 'SYNCING': return <RefreshCw size={18} className="text-blue-500 animate-spin" />;
            case 'FAILED': return <AlertCircle size={18} className="text-red-500" />;
            default: return <Clock size={18} className="text-gray-400" />;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Store Management</h1>
                <div className="flex bg-secondary/30 rounded-lg p-1 border border-border">
                    <button
                        onClick={() => setIsFilterVisible(!isFilterVisible)}
                        className={clsx(
                            "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                            isFilterVisible ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-secondary text-muted-foreground"
                        )}
                    >
                        Filters
                    </button>
                    {(Object.values(filters).some(v => v !== '')) && (
                        <button
                            onClick={clearFilters}
                            className="px-3 py-1.5 text-xs font-medium text-red-500 hover:text-red-400 transition-colors"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="text-red-500 mt-0.5" size={20} />
                    <div className="flex-1">
                        <h3 className="font-semibold text-red-700">Sync Failed</h3>
                        <p className="text-sm text-red-600 mt-1">{error}</p>
                    </div>
                    <button
                        onClick={() => setError(null)}
                        className="text-red-500 hover:text-red-700"
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-x-auto">
                <div className="relative">
                    {isLoading && stores.length > 0 && (
                        <div className="absolute inset-0 bg-background/40 flex items-center justify-center z-10 backdrop-blur-[1px]">
                             <RefreshCw size={24} className="text-primary animate-spin" />
                        </div>
                    )}
                    <table className="w-full min-w-max text-sm text-left">
                        <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
                            <tr>
                                <th className="px-4 py-4 min-w-[150px]">
                                    <div className="flex flex-col gap-2">
                                        <span>Store Name</span>
                                        {isFilterVisible && (
                                            <input
                                                type="text"
                                                name="name"
                                                value={filters.name}
                                                onChange={handleFilterChange}
                                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                                placeholder="Filter..."
                                                className="w-full bg-background border border-border rounded-md px-2 py-1 text-xs font-normal text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                            />
                                        )}
                                    </div>
                                </th>
                                <th className="px-4 py-4 min-w-[170px]">
                                    <div className="flex flex-col gap-2">
                                        <span>URL</span>
                                        {isFilterVisible && (
                                            <input
                                                type="text"
                                                name="url"
                                                value={filters.url}
                                                onChange={handleFilterChange}
                                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                                placeholder="Filter..."
                                                className="w-full bg-background border border-border rounded-md px-2 py-1 text-xs font-normal text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                            />
                                        )}
                                    </div>
                                </th>
                                <th className="px-4 py-4 min-w-[90px]">
                                    <div className="flex flex-col gap-2">
                                        <span>Theme</span>
                                        {isFilterVisible && (
                                            <input
                                                type="text"
                                                name="themeName"
                                                value={filters.themeName}
                                                onChange={handleFilterChange}
                                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                                placeholder="Filter..."
                                                className="w-full bg-background border border-border rounded-md px-2 py-1 text-[10px] font-normal text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                            />
                                        )}
                                    </div>
                                </th>
                                <th className="px-4 py-4 min-w-[65px]">
                                    <div className="flex flex-col gap-2">
                                        <span>Ver</span>
                                        {isFilterVisible && (
                                            <input
                                                type="text"
                                                name="themeVersion"
                                                value={filters.themeVersion}
                                                onChange={handleFilterChange}
                                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                                placeholder="v..."
                                                className="w-full bg-background border border-border rounded-md px-1 py-1 text-[10px] font-normal text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                            />
                                        )}
                                    </div>
                                </th>
                                <th className="px-4 py-4 min-w-[120px]">
                                    <div className="flex flex-col gap-2">
                                        <span>Tags</span>
                                        {isFilterVisible && (
                                            <input
                                                type="text"
                                                name="tags"
                                                value={filters.tags}
                                                onChange={handleFilterChange}
                                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                                placeholder="Filter..."
                                                className="w-full bg-background border border-border rounded-md px-2 py-1 text-xs font-normal text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                            />
                                        )}
                                    </div>
                                </th>
                                <th className="px-4 py-4 min-w-[110px]">
                                    <div className="flex flex-col gap-2">
                                        <span>Status</span>
                                        {isFilterVisible && (
                                            <select
                                                name="status"
                                                value={filters.status}
                                                onChange={(e) => {
                                                    handleFilterChange(e);
                                                    // Auto-apply for status select
                                                    const activeFilters: Record<string, string> = {};
                                                    Object.entries({ ...filters, status: e.target.value }).forEach(([key, value]) => {
                                                        if (value) activeFilters[key] = value;
                                                    });
                                                    refreshStores(activeFilters);
                                                }}
                                                className="w-full bg-background border border-border rounded-md px-2 py-1 text-xs font-normal text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                                            >
                                                <option value="">All</option>
                                                <option value="COMPLETED">Completed</option>
                                                <option value="SYNCING">Syncing</option>
                                                <option value="FAILED">Failed</option>
                                                <option value="PENDING">Pending</option>
                                            </select>
                                        )}
                                    </div>
                                </th>
                                <th className="px-4 py-4 min-w-[220px]">
                                    <div className="flex flex-col gap-2">
                                        <span>Reference Period</span>
                                        {isFilterVisible && (
                                            <div className="flex gap-1 items-center h-[26px]">
                                                <input
                                                    type="date"
                                                    name="startDate"
                                                    value={filters.startDate}
                                                    onChange={handleFilterChange}
                                                    className="flex-1 bg-background border border-border rounded-md px-1 py-1 text-[10px] font-normal text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                                />
                                                <span className="text-[10px]">to</span>
                                                <input
                                                    type="date"
                                                    name="endDate"
                                                    value={filters.endDate}
                                                    onChange={handleFilterChange}
                                                    className="flex-1 bg-background border border-border rounded-md px-1 py-1 text-[10px] font-normal text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </th>
                                <th className="px-4 py-4 text-right min-w-[100px]">
                                    <div className="flex flex-col gap-2">
                                        <span>Actions</span>
                                        {isFilterVisible && <div className="h-[26px]" aria-hidden="true" />}
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {stores.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                                        {Object.values(filters).some(v => v !== '') 
                                            ? "No stores match your search criteria." 
                                            : "No stores connected yet."}
                                    </td>
                                </tr>
                            ) : (
                                stores.map((store) => (
                                    <tr key={store.id} className="hover:bg-secondary/20 transition-colors">
                                        <td className="px-4 py-4 font-medium whitespace-nowrap">{store.name}</td>
                                        <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">{store.url}</td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            {store.themeName ? (
                                                <span className="text-sm font-medium text-primary/80">{store.themeName}</span>
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            {store.themeVersion ? (
                                                <span className="bg-secondary px-2 py-0.5 rounded text-[11px] font-mono">v{store.themeVersion}</span>
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {store.tags && store.tags.length > 0 ? (
                                                    store.tags.map(tag => (
                                                        <span key={tag} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-medium border border-primary/20 whitespace-nowrap">
                                                            {tag}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-muted-foreground text-xs italic">No tags</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div 
                                                className="flex items-center gap-2 group relative cursor-help"
                                                title={store.lastSyncAt ? `Last Sync: ${new Date(store.lastSyncAt).toLocaleString()}` : 'Never synced'}
                                            >
                                                {getStatusIcon(store.syncStatus)}
                                                <span className={clsx(
                                                    "capitalize",
                                                    store.syncStatus === 'COMPLETED' && "text-green-600",
                                                    store.syncStatus === 'FAILED' && "text-red-600",
                                                    store.syncStatus === 'SYNCING' && "text-blue-600",
                                                )}>{store.syncStatus.toLowerCase()}</span>
                                                
                                                {/* Tooltip detail (secondary way to see it) */}
                                                <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50">
                                                    <div className="bg-popover border border-border text-popover-foreground text-[10px] px-2 py-1 rounded shadow-md whitespace-nowrap">
                                                        {store.lastSyncAt ? `Sync: ${new Date(store.lastSyncAt).toLocaleString()}` : 'No sync data'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <DateRangePicker
                                                value={{
                                                    start: store.startDate ? new Date(store.startDate).toISOString().split('T')[0] : null,
                                                    end: store.endDate ? new Date(store.endDate).toISOString().split('T')[0] : null
                                                }}
                                                placeholder="Not set"
                                                onChange={(range) => updateStore(store.id, {
                                                    startDate: range.start,
                                                    endDate: range.end
                                                })}
                                            />
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleRetry(store.id)}
                                                    className="p-2 hover:bg-blue-500/10 text-blue-600 rounded-md transition-colors"
                                                    title="Retry Sync"
                                                >
                                                    <RefreshCw size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setEditingStore(store)}
                                                    className="p-2 hover:bg-yellow-500/10 text-yellow-600 rounded-md transition-colors"
                                                    title="Edit Store"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(store.id)}
                                                    className="p-2 hover:bg-red-500/10 text-red-600 rounded-md transition-colors"
                                                    title="Delete Store"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {editingStore && (
                <EditStoreModal
                    store={editingStore}
                    isOpen={!!editingStore}
                    onClose={() => setEditingStore(null)}
                    onSave={updateStore}
                />
            )}
        </div>
    );
};

import { useStore } from '../../context/StoreContext';
import type { Store } from '../../types/store.types';
import { Trash2, RefreshCw, AlertCircle, CheckCircle2, Clock, Edit } from 'lucide-react';
import { useState } from 'react';
import { EditStoreModal } from './EditStoreModal';
import { DateRangePicker } from '../common/DateRangePicker';
import { clsx } from 'clsx';

export const Stores = () => {
    const { stores, deleteStore, retrySync, updateStore, isLoading } = useStore();
    const [editingStore, setEditingStore] = useState<Store | null>(null);
    const [error, setError] = useState<string | null>(null);

    if (isLoading) {
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

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
                            <tr>
                                <th className="px-6 py-4">Store Name</th>
                                <th className="px-6 py-4">URL</th>
                                <th className="px-6 py-4">Tags</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Last Sync</th>
                                <th className="px-6 py-4">Reference Period</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {stores.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                        No stores connected yet.
                                    </td>
                                </tr>
                            ) : (
                                stores.map((store) => (
                                    <tr key={store.id} className="hover:bg-secondary/20 transition-colors">
                                        <td className="px-6 py-4 font-medium">{store.name}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{store.url}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {store.tags && store.tags.length > 0 ? (
                                                    store.tags.map(tag => (
                                                        <span key={tag} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium border border-primary/20">
                                                            {tag}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-muted-foreground text-xs italic">No tags</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(store.syncStatus)}
                                                <span className={clsx(
                                                    "capitalize",
                                                    store.syncStatus === 'COMPLETED' && "text-green-600",
                                                    store.syncStatus === 'FAILED' && "text-red-600",
                                                    store.syncStatus === 'SYNCING' && "text-blue-600",
                                                )}>{store.syncStatus.toLowerCase()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {store.lastSyncAt ? new Date(store.lastSyncAt).toLocaleString() : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <DateRangePicker
                                                value={{
                                                    start: store.startDate ? new Date(store.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                                                    end: store.endDate ? new Date(store.endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
                                                }}
                                                onChange={(range) => updateStore(store.id, {
                                                    startDate: range.start,
                                                    endDate: range.end
                                                })}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
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

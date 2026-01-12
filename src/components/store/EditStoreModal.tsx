import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Store } from '../../types/store.types';


interface EditStoreModalProps {
    store: Store;
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string, data: Partial<Store> & { accessToken?: string }) => Promise<void>;
}

export const EditStoreModal = ({ store, isOpen, onClose, onSave }: EditStoreModalProps) => {
    const [name, setName] = useState(store.name);
    const [accessToken, setAccessToken] = useState('');
    const [tags, setTags] = useState(store.tags?.join(', ') || '');

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setName(store.name);
            setAccessToken(''); // Don't show existing token for security, only allow update
            setTags(store.tags?.join(', ') || '');

        }
    }, [isOpen, store]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const updateData: any = {
                name,
                tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
            };
            if (accessToken) {
                updateData.accessToken = accessToken;
            }
            await onSave(store.id, updateData);
            onClose();
        } catch (error) {
            console.error('Failed to update store:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-lg p-6 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Edit Store</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Store Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">API Access Token</label>
                        <input
                            type="password"
                            value={accessToken}
                            onChange={(e) => setAccessToken(e.target.value)}
                            placeholder="Leave blank to keep current"
                            className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <p className="text-xs text-muted-foreground">Only enter if you want to update the token.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tags</label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="Accesorios Auto, Comida de animales"
                            className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <p className="text-xs text-muted-foreground">Separate multiple tags with commas.</p>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

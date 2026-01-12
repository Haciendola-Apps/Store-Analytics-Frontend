import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface StoreManagerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const StoreManager = ({ isOpen, onClose }: StoreManagerProps) => {
    const [url, setUrl] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [name, setName] = useState('');
    const [tags, setTags] = useState('');
    const [loading, setLoading] = useState(false);
    const { refreshStores } = useStore();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Ensure URL doesn't have protocol
            const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

            // Process tags
            const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

            const response = await fetch('http://localhost:3000/stores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: cleanUrl, accessToken, name, tags: tagsArray }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to add store');
            }

            // Success
            alert('Store connected successfully! Data sync started.');
            onClose();
            // Refresh store list
            await refreshStores();

            // Reset form
            setUrl('');
            setAccessToken('');
            setName('');
            setTags('');
        } catch (error: any) {
            console.error(error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-border w-full max-w-md rounded-xl shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-xl font-semibold">Add New Store</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Store Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="My Awesome Store"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Shopify URL</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="shop.myshopify.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Access Token</label>
                        <input
                            type="password"
                            required
                            className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="shpat_..."
                            value={accessToken}
                            onChange={(e) => setAccessToken(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Note: Token must have <code>read_orders</code>, <code>read_products</code> scopes.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tags (Optional)</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 rounded-md bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="Accesorios Auto, Comida de animales"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Separate tags with commas.
                        </p>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-md hover:bg-secondary transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            Connect Store
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

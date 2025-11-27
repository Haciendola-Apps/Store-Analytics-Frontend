import { useStore } from '../../context/StoreContext';
import { Store, ShoppingBag, AlertCircle, CheckCircle2 } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground text-sm font-medium">{title}</span>
            <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
                <Icon size={18} className={colorClass.replace('bg-', 'text-')} />
            </div>
        </div>
        <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-foreground">{value}</h3>
        </div>
    </div>
);

export const Overview = () => {
    const { stores, isLoading } = useStore();

    if (isLoading) {
        return <div className="flex items-center justify-center h-64">Loading...</div>;
    }

    const totalStores = stores.length;
    const activeStores = stores.filter(s => s.syncStatus === 'COMPLETED').length;
    const failedStores = stores.filter(s => s.syncStatus === 'FAILED').length;
    const syncingStores = stores.filter(s => s.syncStatus === 'SYNCING').length;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Global Overview</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Stores"
                    value={totalStores}
                    icon={Store}
                    colorClass="text-primary"
                />
                <StatCard
                    title="Active Synced Stores"
                    value={activeStores}
                    icon={CheckCircle2}
                    colorClass="text-green-500"
                />
                <StatCard
                    title="Syncing Now"
                    value={syncingStores}
                    icon={ShoppingBag}
                    colorClass="text-blue-500"
                />
                <StatCard
                    title="Failed Syncs"
                    value={failedStores}
                    icon={AlertCircle}
                    colorClass="text-red-500"
                />
            </div>

            <div className="bg-card border border-border rounded-xl p-8 text-center space-y-4">
                <h3 className="text-lg font-semibold">Bienvenido a Hagamos Ecommerce Analytics</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Selecciona una tienda desde el menu superior o ve a la pestaña <strong>Analytics</strong> para ver los detalles de las metricas de una tienda en particular.
                </p>
            </div>
        </div>
    );
};

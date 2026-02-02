import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Settings, Plus, LogOut, Calendar } from 'lucide-react';
import { clsx } from 'clsx';
import { StoreManager } from '../store/StoreManager';
import { StoreSelector } from '../store/StoreSelector';
import { DateRangePicker } from '../common/DateRangePicker';
import { useDateRange } from '../../context/DateRangeContext';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

const SidebarItem = ({ icon: Icon, label, to, active }: { icon: any, label: string, to: string, active: boolean }) => (
    <Link
        to={to}
        className={clsx(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
            active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
        )}
    >
        <Icon size={20} className={clsx("transition-colors", active ? "text-primary" : "group-hover:text-foreground")} />
        <span className="font-medium">{label}</span>
    </Link>
);

export const Layout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isStoreManagerOpen, setIsStoreManagerOpen] = useState(false);
    const { dateRange, setDateRange } = useDateRange();
    const { logout, user } = useAuth();
    const { selectedStore } = useStore();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const setRefPeriod = () => {
        if (selectedStore?.startDate && selectedStore?.endDate) {
            const startStr = typeof selectedStore.startDate === 'string' 
                ? selectedStore.startDate.split('T')[0] 
                : new Date(selectedStore.startDate).toISOString().split('T')[0];
            const endStr = typeof selectedStore.endDate === 'string' 
                ? selectedStore.endDate.split('T')[0] 
                : new Date(selectedStore.endDate).toISOString().split('T')[0];
            
            setDateRange({
                start: startStr,
                end: endStr
            });
        }
    };

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            <StoreManager isOpen={isStoreManagerOpen} onClose={() => setIsStoreManagerOpen(false)} />

                {/* Sidebar */}
                <aside className="w-56 border-r border-border bg-card/50 backdrop-blur-xl flex flex-col">
                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <BarChart3 className="text-primary-foreground" size={20} />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight">Hagamos Ecommerce</h1>
                        </div>

                        <nav className="space-y-1">
                            <SidebarItem icon={LayoutDashboard} label="Overview" to="/" active={location.pathname === '/'} />
                            {/* <SidebarItem icon={ShoppingBag} label="Products" to="/products" active={location.pathname === '/products'} /> */}
                            {/* <SidebarItem icon={Users} label="Customers" to="/customers" active={location.pathname === '/customers'} /> */}
                            <SidebarItem icon={BarChart3} label="Analytics" to="/analytics" active={location.pathname === '/analytics'} />
                        </nav>
                    </div>

                    <div className="mt-auto p-6 border-t border-border">
                        <nav className="space-y-1">
                            {/* <SidebarItem icon={Settings} label="Settings" to="/settings" active={location.pathname === '/settings'} /> */}
                            <SidebarItem icon={Settings} label="Stores" to="/stores" active={location.pathname === '/stores'} />
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto relative">
                    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10 px-8 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <h2 className="text-lg font-semibold">Dashboard</h2>
                            <StoreSelector />
                        </div>
                        <div className="flex items-center gap-4">
                            {selectedStore?.startDate && selectedStore?.endDate && (
                                <button
                                    onClick={setRefPeriod}
                                    className="flex items-center gap-2 px-3 py-2 border border-border rounded-md hover:bg-secondary/50 transition-colors text-xs font-medium text-muted-foreground"
                                    title="Set Reference Period"
                                >
                                    <Calendar size={14} />
                                    <span>Program Period</span>
                                </button>
                            )}
                            <DateRangePicker value={dateRange} onChange={setDateRange} />
                            <button
                                onClick={() => setIsStoreManagerOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium shadow-lg shadow-primary/20"
                            >
                                <Plus size={16} />
                                Add Store
                            </button>
                            <div className="flex items-center gap-3 px-4 py-2 border border-border rounded-md bg-card/50">
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground">Logged in as</span>
                                    <span className="text-sm font-medium">{user?.email}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
                                    title="Logout"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        </div>
                    </header>
                    <div className={clsx("p-8 mx-auto", location.pathname === '/stores' ? "w-full" : "max-w-7xl")}>
                        {children}
                    </div>
                </main>
            </div>
    );
};

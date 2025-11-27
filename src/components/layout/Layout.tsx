import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, BarChart3, Settings, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { StoreManager } from '../store/StoreManager';

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

import { StoreProvider } from '../../context/StoreContext';
import { StoreSelector } from '../store/StoreSelector';
import { DateRangePicker } from '../common/DateRangePicker';
import { useDateRange } from '../../context/DateRangeContext';

export const Layout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const [isStoreManagerOpen, setIsStoreManagerOpen] = useState(false);
    const { dateRange, setDateRange } = useDateRange();

    return (
        <StoreProvider>
            <div className="flex h-screen bg-background text-foreground overflow-hidden">
                <StoreManager isOpen={isStoreManagerOpen} onClose={() => setIsStoreManagerOpen(false)} />

                {/* Sidebar */}
                <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-xl flex flex-col">
                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <BarChart3 className="text-primary-foreground" size={20} />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight">Hagamos Ecommerce</h1>
                        </div>

                        <nav className="space-y-1">
                            <SidebarItem icon={LayoutDashboard} label="Overview" to="/" active={location.pathname === '/'} />
                            <SidebarItem icon={ShoppingBag} label="Products" to="/products" active={location.pathname === '/products'} />
                            <SidebarItem icon={Users} label="Customers" to="/customers" active={location.pathname === '/customers'} />
                            <SidebarItem icon={BarChart3} label="Analytics" to="/analytics" active={location.pathname === '/analytics'} />
                        </nav>
                    </div>

                    <div className="mt-auto p-6 border-t border-border">
                        <nav className="space-y-1">
                            <SidebarItem icon={Settings} label="Settings" to="/settings" active={location.pathname === '/settings'} />
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
                            <DateRangePicker value={dateRange} onChange={setDateRange} />
                            <button
                                onClick={() => setIsStoreManagerOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium shadow-lg shadow-primary/20"
                            >
                                <Plus size={16} />
                                Add Store
                            </button>
                        </div>
                    </header>
                    <div className="p-8 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </StoreProvider>
    );
};

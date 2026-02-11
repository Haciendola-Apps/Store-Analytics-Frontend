import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Zap, Settings, Plus, LogOut, Calendar } from 'lucide-react';
import { clsx } from 'clsx';
import { StoreManager } from '../store/StoreManager';
import { StoreSelector } from '../store/StoreSelector';
import { DateRangePicker } from '../common/DateRangePicker';
import { useDateRange } from '../../context/DateRangeContext';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

const SidebarItem = ({ icon: Icon, label, to, active }: { icon: any, label: string, to: string, active: boolean }) => (
    <Link
        id={`sidebar-item-${label.toLowerCase().replace(/\s+/g, '-')}`}
        to={to}
        className={clsx(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
            active
                ? "bg-[#FF0057] text-white shadow-lg shadow-[#FF0057]/20"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
        )}
    >
        <Icon size={20} className={clsx("transition-colors", active ? "text-white" : "group-hover:text-foreground")} />
        <span className="font-semibold">{label}</span>
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
        <div id="app-container" className="flex h-screen bg-background text-foreground overflow-hidden">
            <StoreManager isOpen={isStoreManagerOpen} onClose={() => setIsStoreManagerOpen(false)} />

                {/* Sidebar */}
                <aside id="sidebar-container" className="w-56 border-r border-border bg-card/50 backdrop-blur-xl flex flex-col">
                    <div className="p-6">
                        <div id="sidebar-logo" className="flex items-center gap-2.5 mb-8">
                            <div className="w-8 h-8 bg-[#FF0057] rounded-sm flex items-center justify-center shrink-0 shadow-lg shadow-[#FF0057]/20">
                                <span className="text-white font-black text-xl mb-0.5">H</span>
                            </div>
                            <h1 className="text-xl font-black tracking-tighter text-foreground">Haciéndola</h1>
                        </div>

                        <nav id="sidebar-nav-main" className="space-y-1">
                            <SidebarItem icon={LayoutDashboard} label="Overview" to="/" active={location.pathname === '/'} />
                            <SidebarItem icon={BarChart3} label="Analytics" to="/analytics" active={location.pathname === '/analytics'} />
                            <SidebarItem icon={Zap} label="Quick View" to="/quick-view" active={location.pathname === '/quick-view'} />
                        </nav>
                    </div>

                    <div className="mt-auto p-6 border-t border-border">
                        <nav id="sidebar-nav-footer" className="space-y-1">
                            <SidebarItem icon={Settings} label="Stores" to="/stores" active={location.pathname === '/stores'} />
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main id="main-content" className="flex-1 overflow-y-auto relative">
                    <header id="top-header" className="h-16 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10 px-8 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <h2 id="header-page-title" className="text-lg font-semibold">
                                {location.pathname === '/' ? 'Overview' : 
                                 location.pathname === '/analytics' ? 'Analytics Detail' : 
                                 location.pathname === '/quick-view' ? 'Quick View Summary' : 
                                 location.pathname === '/stores' ? 'Store Management' : 'Dashboard'}
                            </h2>
                        </div>
                        <div id="header-actions" className="flex items-center gap-4">
                            <button
                                id="btn-add-store"
                                onClick={() => setIsStoreManagerOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium shadow-lg shadow-primary/20"
                            >
                                <Plus size={16} />
                                Add Store
                            </button>
                            <div id="user-info-container" className="flex items-center gap-3 px-4 py-2 border border-border rounded-md bg-card/50">
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground">Logged in as</span>
                                    <span id="user-email-display" className="text-sm font-medium">{user?.email}</span>
                                </div>
                                <button
                                    id="btn-logout"
                                    onClick={handleLogout}
                                    className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
                                    title="Logout"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        </div>
                    </header>
                    <div id="page-content" className={clsx("p-8 mx-auto", location.pathname === '/stores' ? "w-full" : "max-w-7xl overflow-visible")}>
                        {children}
                    </div>
                </main>
            </div>
    );
};

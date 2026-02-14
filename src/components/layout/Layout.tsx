import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Zap, Settings, Plus, LogOut, Globe } from 'lucide-react';
import { clsx } from 'clsx';
import { StoreManager } from '../store/StoreManager';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

const SidebarItem = ({ icon: Icon, label, to, active, id }: { icon: any, label: string, to: string, active: boolean, id?: string }) => (
    <Link
        id={id || `sidebar-item-${to.replace('/', '') || 'home'}`}
        to={to}
        className={clsx(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
            active
                ? "bg-[#FF0057] text-white shadow-lg shadow-[#FF0057]/20 scale-[1.02]"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
        )}
    >
        <Icon size={18} className={clsx("transition-colors", active ? "text-white" : "group-hover:text-foreground")} />
        <span className="font-bold tracking-tight text-sm">{label}</span>
    </Link>
);

export const Layout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isStoreManagerOpen, setIsStoreManagerOpen] = useState(false);    
    const { logout, user } = useAuth();    
    const { settings, updateCurrency, updateLanguage, t } = useSettings();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };   

    const getPageTitle = () => {
        switch (location.pathname) {
            case '/': return t('nav.dashboard');
            case '/analytics': return t('nav.analytics');
            case '/quick-view': return t('quickview.title');
            case '/stores': return t('nav.stores');
            default: return t('nav.dashboard');
        }
    };

    return (
        <div id="app-container" className="flex h-screen bg-background text-foreground overflow-hidden">
            <StoreManager isOpen={isStoreManagerOpen} onClose={() => setIsStoreManagerOpen(false)} />

                {/* Sidebar */}
                <aside id="sidebar-container" className="w-60 border-r border-border bg-card/50 backdrop-blur-xl flex flex-col">
                    <div className="p-6">
                        <div id="sidebar-logo" className="flex items-center gap-3 mb-10">
                            <div className="w-10 h-10 bg-[#FF0057] rounded-xl flex items-center justify-center shrink-0 shadow-xl shadow-[#FF0057]/30 rotate-3 group-hover:rotate-0 transition-transform">
                                <span className="text-white font-black text-2xl mb-0.5 select-none">H</span>
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-xl font-black tracking-tighter text-foreground leading-none">Haciéndola</h1>
                                <span className="text-[10px] font-bold text-[#FF0057] tracking-[0.2em] uppercase mt-1">Analytics</span>
                            </div>
                        </div>

                        <nav id="sidebar-nav-main" className="space-y-1">
                            <SidebarItem icon={LayoutDashboard} label={t('nav.dashboard')} to="/" active={location.pathname === '/'} />
                            <SidebarItem icon={BarChart3} label={t('nav.analytics')} to="/analytics" active={location.pathname === '/analytics'} />
                            <SidebarItem icon={Zap} label={t('quickview.title')} to="/quick-view" active={location.pathname === '/quick-view'} />
                        </nav>
                    </div>

                    <div className="mt-auto p-6 border-t border-border">
                        <nav id="sidebar-nav-footer" className="space-y-1">
                            <SidebarItem icon={Settings} label={t('nav.stores')} to="/stores" active={location.pathname === '/stores'} />
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main id="main-content" className="flex-1 overflow-y-auto relative">
                    <header id="top-header" className="h-16 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10 px-8 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <h2 id="header-page-title" className="text-lg font-semibold">
                                {getPageTitle()}
                            </h2>
                        </div>
                        <div id="header-actions" className="flex items-center gap-4">
                            {/* Language Selector */}
                            <div className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-md bg-card/50">
                                <Globe size={14} className="text-muted-foreground" />
                                <select
                                    value={settings.language}
                                    onChange={(e) => updateLanguage(e.target.value as any)}
                                    className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer uppercase"
                                >
                                    <option value="en">EN</option>
                                    <option value="es">ES</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-md bg-card/50">
                                <span className="text-xs text-muted-foreground font-medium">Currency</span>
                                <select
                                    value={settings.currency}
                                    onChange={(e) => updateCurrency(e.target.value)}
                                    className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer"
                                >
                                    <option value="CLP">CLP</option>
                                    <option value="USD">USD</option>
                                </select>
                            </div>
                            <button
                                id="btn-add-store"
                                onClick={() => setIsStoreManagerOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium shadow-lg shadow-primary/20"
                            >
                                <Plus size={16} />
                                {t('header.addStore')}
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
                                    title={t('nav.logout')}
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

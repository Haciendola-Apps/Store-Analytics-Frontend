import { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import type { UserSettings, SettingsContextType } from '../types/settings.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const { token, isAuthenticated, logout } = useAuth();
    
    // Initialize from localStorage for immediate visual consistency
    const [settings, setSettings] = useState<UserSettings>(() => {
        const savedCurrency = localStorage.getItem('user_currency');
        return { 
            currency: savedCurrency || 'CLP', 
            preferences: {} 
        };
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            if (!isAuthenticated || !token) {
                setIsLoading(false);
                return;
            }

            try {
                const res = await fetch(`${API_URL}/users/settings`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.status === 401) {
                    console.warn('Session expired (401) loading settings - logging out');
                    logout();
                    return;
                }

                if (res.ok) {
                    const data = await res.json();
                    setSettings({ currency: data.currency, preferences: data.preferences });
                    // Sync localStorage with server truth
                    localStorage.setItem('user_currency', data.currency);
                }
            } catch (err) {
                console.error('Failed to fetch settings', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, [isAuthenticated, token]);

    const updateCurrency = useCallback(async (newCurrency: string) => {
        // 1. Optimistic Update (State + LocalStorage)
        const previousCurrency = settings.currency;
        console.log(`Optimistic update: ${previousCurrency} -> ${newCurrency}`);
        
        setSettings(prev => ({ ...prev, currency: newCurrency }));
        localStorage.setItem('user_currency', newCurrency);

        const activeToken = token || localStorage.getItem('auth_token');

        if (!activeToken) {
            console.warn('Cannot update currency: No auth token available');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/users/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${activeToken}`
                },
                body: JSON.stringify({ currency: newCurrency })
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error(`Status ${res.status}: ${errorText}`);
                // Revert only if server explicitly rejected it
                setSettings(prev => ({ ...prev, currency: previousCurrency }));
                localStorage.setItem('user_currency', previousCurrency);
            } else {
                console.log('Server update successful');
                const data = await res.json();
                // Ensure state matches server exactly
                setSettings({ currency: data.currency, preferences: data.preferences });
            }
        } catch (err) {
            console.error('Network error during update:', err);
            setSettings(prev => ({ ...prev, currency: previousCurrency }));
            localStorage.setItem('user_currency', previousCurrency);
        }
    }, [token, settings.currency]);

    const formatCurrency = useCallback((amount: number) => {
        const symbols: Record<string, string> = {
            'CLP': '$',
            'USD': '$',
            'EUR': '€',
            'MXN': '$',
            'COP': '$'
        };
        const symbol = symbols[settings.currency] || '$';
        
        // Handle decimals for USD/EUR vs CLP
        const options = (settings.currency === 'CLP' || settings.currency === 'COP') 
            ? { minimumFractionDigits: 0, maximumFractionDigits: 0 }
            : { minimumFractionDigits: 2, maximumFractionDigits: 2 };

        return `${symbol}${amount.toLocaleString(undefined, options)}`;
    }, [settings.currency]);

    const value = useMemo(() => ({ 
        settings, 
        updateCurrency, 
        isLoading, 
        formatCurrency 
    }), [settings, updateCurrency, isLoading, formatCurrency]);

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within SettingsProvider');
    }
    return context;
};

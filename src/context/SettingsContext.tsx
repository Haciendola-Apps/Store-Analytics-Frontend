import { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import type { UserSettings, SettingsContextType } from '../types/settings.types';
import { translations, type Language, type TranslationKey } from '../i18n/translations';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const { token, isAuthenticated, logout } = useAuth();
    
    // Initialize from localStorage for immediate visual consistency
    const [settings, setSettings] = useState<UserSettings>(() => {
        const savedCurrency = localStorage.getItem('user_currency');
        const savedLanguage = localStorage.getItem('user_language') as Language;
        return { 
            currency: savedCurrency || 'CLP', 
            language: savedLanguage || 'en',
            preferences: {} 
        };
    });
    const [isLoading, setIsLoading] = useState(true);

    // Helper for translations
    const t = useCallback((key: TranslationKey): string => {
        const lang = settings.language || 'en';
        // Fallback to English if translation missing in current language
        return translations[lang][key] || translations['en'][key] || key;
    }, [settings.language]);

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
                    setSettings({ 
                        currency: data.currency || 'CLP', 
                        language: (data.language as Language) || 'en',
                        preferences: data.preferences 
                    });
                    // Sync localStorage with server truth
                    localStorage.setItem('user_currency', data.currency || 'CLP');
                    localStorage.setItem('user_language', data.language || 'en');
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
                setSettings({ currency: data.currency, language: data.language as Language, preferences: data.preferences });
            }
        } catch (err) {
            console.error('Network error during update:', err);
            setSettings(prev => ({ ...prev, currency: previousCurrency }));
            localStorage.setItem('user_currency', previousCurrency);
        }
    }, [token, settings.currency]);

    const updateLanguage = useCallback(async (newLanguage: Language) => {
        const previousLanguage = settings.language;
        
        // Optimistic Update
        setSettings(prev => ({ ...prev, language: newLanguage }));
        localStorage.setItem('user_language', newLanguage);

        const activeToken = token || localStorage.getItem('auth_token');

        if (!activeToken) return;

        try {
            const res = await fetch(`${API_URL}/users/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${activeToken}`
                },
                body: JSON.stringify({ language: newLanguage })
            });

            if (!res.ok) {
                // Revert
                setSettings(prev => ({ ...prev, language: previousLanguage }));
                localStorage.setItem('user_language', previousLanguage);
            } else {
                const data = await res.json();
                setSettings(prev => ({ ...prev, language: data.language as Language }));
            }
        } catch (err) {
            console.error('Network error during language update:', err);
            setSettings(prev => ({ ...prev, language: previousLanguage }));
            localStorage.setItem('user_language', previousLanguage);
        }
    }, [token, settings.language]);

    const formatCurrency = useCallback((amount: number | string) => {
        const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        
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

        return `${symbol}${numericAmount.toLocaleString(undefined, options)}`;
    }, [settings.currency]);

    const value = useMemo(() => ({ 
        settings, 
        updateCurrency,
        updateLanguage, 
        isLoading, 
        formatCurrency,
        t 
    }), [settings, updateCurrency, updateLanguage, isLoading, formatCurrency, t]);

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

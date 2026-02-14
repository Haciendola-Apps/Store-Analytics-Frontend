export interface UserSettings {
    currency: string;
    language: 'en' | 'es';
    preferences: any;
}

export interface SettingsContextType {
    settings: UserSettings;
    updateCurrency: (currency: string) => Promise<void>;
    updateLanguage: (language: 'en' | 'es') => Promise<void>;
    isLoading: boolean;
    formatCurrency: (amount: number | string) => string;
    t: (key: any) => string; // Should be TranslationKey but kept simple for now
}

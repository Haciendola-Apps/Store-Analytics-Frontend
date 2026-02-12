export interface UserSettings {
    currency: string;
    preferences: any;
}

export interface SettingsContextType {
    settings: UserSettings;
    updateCurrency: (currency: string) => Promise<void>;
    isLoading: boolean;
    formatCurrency: (amount: number) => string;
}

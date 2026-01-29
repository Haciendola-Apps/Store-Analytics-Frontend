import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface DateRange {
    start: string;
    end: string;
}

export type ComparisonPeriod = 'none' | 'previous_period';

interface DateRangeContextType {
    dateRange: DateRange;
    setDateRange: (range: DateRange) => void;
    comparisonPeriod: ComparisonPeriod;
    setComparisonPeriod: (period: ComparisonPeriod) => void;
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

const STORAGE_KEYS = {
    DATE_RANGE: 'store-analytics-date-range',
    COMPARISON_PERIOD: 'store-analytics-comparison-period'
};

export const DateRangeProvider = ({ children }: { children: ReactNode }) => {
    const [dateRange, setDateRange] = useState<DateRange>(() => {
        // Try to load from localStorage first
        const saved = localStorage.getItem(STORAGE_KEYS.DATE_RANGE);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse saved date range:', e);
            }
        }

        // Default to first day of month to today
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
            start: firstDayOfMonth.toISOString().split('T')[0],
            end: today.toISOString().split('T')[0]
        };
    });

    const [comparisonPeriod, setComparisonPeriod] = useState<ComparisonPeriod>(() => {
        // Try to load from localStorage first
        const saved = localStorage.getItem(STORAGE_KEYS.COMPARISON_PERIOD);
        if (saved && (saved === 'none' || saved === 'previous_period')) {
            return saved as ComparisonPeriod;
        }
        return 'none';
    });

    // Persist dateRange to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.DATE_RANGE, JSON.stringify(dateRange));
    }, [dateRange]);

    // Persist comparisonPeriod to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.COMPARISON_PERIOD, comparisonPeriod);
    }, [comparisonPeriod]);

    return (
        <DateRangeContext.Provider value={{
            dateRange,
            setDateRange,
            comparisonPeriod,
            setComparisonPeriod
        }}>
            {children}
        </DateRangeContext.Provider>
    );
};

export const useDateRange = () => {
    const context = useContext(DateRangeContext);
    if (context === undefined) {
        throw new Error('useDateRange must be used within a DateRangeProvider');
    }
    return context;
};

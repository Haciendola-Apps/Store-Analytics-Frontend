import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DateRange {
    start: string;
    end: string;
}

export type ComparisonPeriod = 'none' | 'previous_period' | 'last_month' | 'last_year';

interface DateRangeContextType {
    dateRange: DateRange;
    setDateRange: (range: DateRange) => void;
    comparisonPeriod: ComparisonPeriod;
    setComparisonPeriod: (period: ComparisonPeriod) => void;
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

export const DateRangeProvider = ({ children }: { children: ReactNode }) => {
    const [dateRange, setDateRange] = useState<DateRange>(() => {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
            start: firstDayOfMonth.toISOString().split('T')[0],
            end: today.toISOString().split('T')[0]
        };
    });
    const [comparisonPeriod, setComparisonPeriod] = useState<ComparisonPeriod>('none');

    return (
        <DateRangeContext.Provider value={{ dateRange, setDateRange, comparisonPeriod, setComparisonPeriod }}>
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

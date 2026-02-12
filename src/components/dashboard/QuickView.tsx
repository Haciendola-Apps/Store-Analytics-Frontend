import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, ShoppingCart, DollarSign, Activity, Target, Calendar, Info, Search } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useSettings } from '../../context/SettingsContext';
import { clsx } from 'clsx';
import { SuccessBadge } from './SuccessBadge';
import { SuccessCaseBanner } from './SuccessCaseBanner';
import type { SuccessStatus } from './SuccessCaseBanner';

interface AnalyticsData {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    totalSessions: number;
    conversionRate: number;
    comparison: {
        totalRevenueChange: number | null;
        totalOrdersChange: number | null;
        averageOrderValueChange: number | null;
        totalSessionsChange: number | null;
        conversionRateChange: number | null;
        values?: {
            totalRevenue: number;
            totalOrders: number;
            averageOrderValue: number;
            totalSessions: number;
            conversionRate: number;
        };
        range?: {
            start: string;
            end: string;
        };
    } | null;
}

const MetricCard = ({ title, value, change, icon: Icon, id, prevValue, currentRange, prevRange, prefix = '', suffix = '', isCurrency = false }: any) => {
    const { formatCurrency } = useSettings();
    const isNeutral = change == null || Math.abs(change) < 0.1;
    const isPositive = change != null && change > 0;
    const colorClass = isNeutral ? 'text-foreground/70' : (isPositive ? 'text-green-500' : 'text-red-500');

    return (
        <div id={id} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground text-sm font-medium">{title}</span>
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon size={18} className="text-primary" />
                </div>
            </div>
            <div className="flex items-baseline justify-between w-full">
                <h3 className="text-2xl font-bold text-foreground">{value}</h3>
            </div>
            {change != null && (
                <div className="flex items-center gap-1 mt-2 text-sm tracking-tight relative group">
                    <div className={`flex items-center gap-1 font-medium ${colorClass}`}>
                        {change > 0 ? <TrendingUp size={14} /> : <TrendingUp size={14} className="rotate-180" />}
                        <span>{change > 0 ? '+' : ''}{parseFloat(change.toString()).toFixed(1)}%</span>
                    </div>
                    <span className="text-muted-foreground font-normal ml-1 cursor-help flex items-center gap-1">
                        vs last period
                        <Info size={12} className="opacity-50" />
                    </span>

                    {/* Tooltip */}
                    <div className="absolute left-0 top-full mt-2 w-56 p-3 bg-popover border border-border rounded-lg shadow-xl text-xs text-popover-foreground invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-50 normal-case font-normal leading-relaxed pointer-events-none">
                        <div className="space-y-3">
                            <div>
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    <span className="font-semibold text-foreground uppercase text-[10px]">Reference Period</span>
                                </div>
                                <div className="text-[10px] text-muted-foreground mb-1 italic">{currentRange}</div>
                                <div className="font-bold text-sm bg-secondary/30 px-2 py-1 rounded inline-block">
                                    {value}
                                </div>
                            </div>
                            
                            <div className="border-t border-border/50 pt-2">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                                    <span className="font-semibold text-foreground uppercase text-[10px]">Previous Period</span>
                                </div>
                                <div className="text-[10px] text-muted-foreground mb-1 italic">{prevRange}</div>
                                <div className="font-bold text-sm bg-secondary/30 px-2 py-1 rounded inline-block text-muted-foreground">
                                    {isCurrency ? formatCurrency(prevValue || 0) : `${prefix}${prevValue?.toLocaleString()}${suffix}`}
                                </div>
                            </div>

                            <div className={`pt-2 border-t border-border/50 flex items-center gap-1 font-bold ${colorClass}`}>
                                {change > 0 ? <TrendingUp size={14} /> : <TrendingUp size={14} className="rotate-180" />}
                                <span>{Math.abs(parseFloat(change.toString())).toFixed(1)}%</span>
                                <span className="text-muted-foreground font-normal ml-1 italic text-[10px]">from comparison</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const QuickView = () => {
    const { selectedStore, stores, selectStore } = useStore();
    const { formatCurrency } = useSettings();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [allSuccessStatuses, setAllSuccessStatuses] = useState<any[]>([]);
    const [selectedStoreSuccessStatus, setSelectedStoreSuccessStatus] = useState<SuccessStatus | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [viewDates, setViewDates] = useState({ start: '', end: '' });
    const [compDates, setCompDates] = useState({ start: '', end: '' });

    // Filter states
    const [quickFilters, setQuickFilters] = useState({
        name: '',
        url: '',
        tags: '',
        success: ''
    });

    // Fetch all success statuses on mount
    useEffect(() => {
        const fetchAllStatuses = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                const res = await fetch(`${apiUrl}/analytics/all/success-status`);
                if (res.ok) {
                    const statuses = await res.json();
                    setAllSuccessStatuses(statuses);
                }
            } catch (err) {
                console.error('Error fetching all success statuses:', err);
            }
        };
        fetchAllStatuses();
    }, []);

    const filteredStores = useMemo(() => {
        return stores.map(store => {
            const status = allSuccessStatuses.find(s => s.storeId === store.id);
            return {
                ...store,
                successData: status || null,
                successLevels: status ? {
                    fixed: status.fixedLevel,
                    percentage: status.percentageLevel
                } : null
            };
        }).filter(store => {
            // Multiple names logic (OR search)
            let nameMatch = true;
            if (quickFilters.name.trim() !== '') {
                const searchNames = quickFilters.name.split(',')
                    .map(n => n.trim().toLowerCase())
                    .filter(n => n !== '');
                
                nameMatch = searchNames.length === 0 || searchNames.some(searchName => 
                    store.name.toLowerCase().includes(searchName)
                );
            }

            const urlMatch = store.url.toLowerCase().includes(quickFilters.url.toLowerCase());
            
            // Multiple tags logic (OR search)
            let tagsMatch = true;
            if (quickFilters.tags.trim() !== '') {
                const searchTags = quickFilters.tags.split(',')
                    .map(t => t.trim().toLowerCase())
                    .filter(t => t !== '');
                
                tagsMatch = searchTags.length === 0 || searchTags.some(searchTag => 
                    store.tags?.some(storeTag => storeTag.toLowerCase().includes(searchTag))
                );
            }

            // Success filter logic
            let successMatch = true;
            if (quickFilters.success !== '') {
                const filter = quickFilters.success.toLowerCase();
                const fixed = store.successLevels?.fixed?.toLowerCase() || 'ninguno';
                const percentage = store.successLevels?.percentage?.toLowerCase() || 'ninguno';
                successMatch = fixed.includes(filter) || percentage.includes(filter);
            }
            
            return nameMatch && urlMatch && tagsMatch && successMatch;
        });
    }, [stores, quickFilters, allSuccessStatuses]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setQuickFilters(prev => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!selectedStore) return;

            setIsLoading(true);
            try {
                // Calculate Reference Period
                const today = new Date();
                const rawStartDate = selectedStore.startDate || new Date(new Date().setDate(today.getDate() - 30)).toISOString();
                const startDate = rawStartDate.split('T')[0];
                
                let rawEndDate = selectedStore.endDate || today.toISOString();
                let endDate = rawEndDate.split('T')[0];
                const storeEndDate = new Date(rawEndDate);
                
                // If today is before storeEndDate, we use today as reference
                if (today < storeEndDate) {
                    endDate = today.toISOString().split('T')[0];
                }

                setViewDates({ start: startDate, end: endDate });

                const queryParams = new URLSearchParams({
                    startDate: startDate,
                    endDate: endDate,
                    comparisonPeriod: 'previous_period',
                });

                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                
                // Fetch both analytics and specific success status in parallel
                const [analyticsRes, successRes] = await Promise.all([
                    fetch(`${apiUrl}/analytics/${selectedStore.id}?${queryParams}`),
                    fetch(`${apiUrl}/analytics/success-status/${selectedStore.id}`)
                ]);

                if (!analyticsRes.ok) throw new Error('Failed to fetch analytics');
                if (!successRes.ok) console.warn('Failed to fetch store success status');

                const result = await analyticsRes.json();
                const successResult = successRes.ok ? await successRes.json() : null;

                setData(result);
                setSelectedStoreSuccessStatus(successResult);

                if (result.comparison?.range) {
                    setCompDates({
                        start: result.comparison.range.start,
                        end: result.comparison.range.end
                    });
                }

                // Verification Debug Logs
                console.log('--- Quick View Verification ---');
                console.log(`Store: ${selectedStore.name}`);
                console.log(`Reference Period Calculated: ${startDate} to ${endDate}`);
                console.log('Metrics (Current):', {
                    totalRevenue: result.totalRevenue,
                    totalOrders: result.totalOrders,
                    averageOrderValue: result.averageOrderValue,
                    totalSessions: result.totalSessions,
                    conversionRate: `${result.conversionRate}%`
                });

                if (result.comparison && result.comparison.values) {
                    console.log(`Reference Period Previous: ${result.comparison.range?.start} to ${result.comparison.range?.end}`);
                    console.log('Metrics (Previous):', {
                        totalRevenue: result.comparison.values.totalRevenue,
                        totalOrders: result.comparison.values.totalOrders,
                        averageOrderValue: result.comparison.values.averageOrderValue,
                        totalSessions: result.comparison.values.totalSessions,
                        conversionRate: `${result.comparison.values.conversionRate}%`
                    });
                }
                console.log('-------------------------------');
            } catch (err) {
                console.error('Error fetching analytics:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, [selectedStore]);

    if (!selectedStore) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                <div className="p-4 bg-secondary/50 rounded-full">
                    <span className="text-4xl">⚡</span>
                </div>
                <div>
                    <h3 className="text-lg font-semibold">No Store Selected</h3>
                    <p className="text-muted-foreground">Select a store to see the quick view.</p>
                </div>
            </div>
        );
    }

    return (
        <div id="quickview-container" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            {isLoading && (
                <div id="quickview-loading-overlay" className="absolute inset-0 bg-background/20 backdrop-blur-[1px] flex items-center justify-center z-50 rounded-xl">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            )}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 id="quickview-title" className="text-2xl font-bold tracking-tight">Quick View: {selectedStore.name}</h1>
                    <div id="quickview-date-info" className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar size={14} />
                        <span>
                            Ref Period: <span className="font-medium text-foreground">{viewDates.start}</span> to <span className="font-medium text-foreground">{viewDates.end}</span>
                            {compDates.start && compDates.end && (
                                <>
                                    <span className="mx-1 italic">compared with</span>
                                    <span className="font-medium text-foreground">{compDates.start}</span> to <span className="font-medium text-foreground">{compDates.end}</span>
                                </>
                            )}
                        </span>
                        
                        <div id="auto-calculate-badge" className="group relative flex items-center">
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider cursor-help flex items-center gap-1">
                                Auto-Calculated
                                <Info size={10} />
                            </span>
                            
                            <div className="absolute left-0 top-full mt-2 w-80 p-4 bg-popover border border-border rounded-lg shadow-xl text-xs text-popover-foreground invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-50 normal-case font-normal leading-relaxed">
                                <p className="font-bold border-b border-border pb-1 mb-2 text-primary">Calculation Logic</p>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <p className="font-semibold text-foreground">Reference Period:</p>
                                        <ul className="space-y-1 ml-1 text-muted-foreground">
                                            <li>• <span className="font-medium text-foreground">Start Date:</span> Uses the store's configured start date.</li>
                                            <li>• <span className="font-medium text-foreground">End Date:</span> If the configured end date is in the future, today is used as the reference to avoid counting days without data.</li>
                                        </ul>
                                    </div>
                                    <div className="space-y-1 border-t border-border/50 pt-2">
                                        <p className="font-semibold text-foreground">Comparison Period:</p>
                                        <p className="text-muted-foreground">Based on the total number of days in the reference period, it automatically looks back the same duration, ending the day before the Start Date.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Case Analysis Banner */}
            {selectedStoreSuccessStatus && (
                <div className="mb-8">
                    <SuccessCaseBanner successStatus={selectedStoreSuccessStatus} />
                </div>
            )}

            {/* Metrics Grid */}
            <div id="quickview-metrics-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <MetricCard
                    id="metric-revenue"
                    title="Total Revenue"
                    value={formatCurrency(data?.totalRevenue ?? 0)}
                    change={data?.comparison?.totalRevenueChange}
                    icon={DollarSign}
                    prevValue={data?.comparison?.values?.totalRevenue}
                    currentRange={viewDates.start && viewDates.end ? `${viewDates.start} to ${viewDates.end}` : ''}
                    prevRange={compDates.start && compDates.end ? `${compDates.start} to ${compDates.end}` : ''}
                    isCurrency={true}
                />
                <MetricCard
                    id="metric-orders"
                    title="Total Orders"
                    value={(data?.totalOrders ?? 0).toLocaleString()}
                    change={data?.comparison?.totalOrdersChange}
                    icon={ShoppingCart}
                    prevValue={data?.comparison?.values?.totalOrders}
                    currentRange={viewDates.start && viewDates.end ? `${viewDates.start} to ${viewDates.end}` : ''}
                    prevRange={compDates.start && compDates.end ? `${compDates.start} to ${compDates.end}` : ''}
                />
                <MetricCard
                    id="metric-aov"
                    title="Average Order Value"
                    value={formatCurrency(data?.averageOrderValue ?? 0)}
                    change={data?.comparison?.averageOrderValueChange}
                    icon={Target}
                    prevValue={data?.comparison?.values?.averageOrderValue}
                    currentRange={viewDates.start && viewDates.end ? `${viewDates.start} to ${viewDates.end}` : ''}
                    prevRange={compDates.start && compDates.end ? `${compDates.start} to ${compDates.end}` : ''}
                    isCurrency={true}
                />
                <MetricCard
                    id="metric-sessions"
                    title="Total Sessions"
                    value={(data?.totalSessions ?? 0).toLocaleString()}
                    change={data?.comparison?.totalSessionsChange}
                    icon={Activity}
                    prevValue={data?.comparison?.values?.totalSessions}
                    currentRange={viewDates.start && viewDates.end ? `${viewDates.start} to ${viewDates.end}` : ''}
                    prevRange={compDates.start && compDates.end ? `${compDates.start} to ${compDates.end}` : ''}
                />
                <MetricCard
                    id="metric-conversion"
                    title="Conversion Rate"
                    value={`${(data?.conversionRate ?? 0).toFixed(1)}%`}
                    change={data?.comparison?.conversionRateChange}
                    icon={TrendingUp}
                    prevValue={data?.comparison?.values?.conversionRate}
                    currentRange={viewDates.start && viewDates.end ? `${viewDates.start} to ${viewDates.end}` : ''}
                    prevRange={compDates.start && compDates.end ? `${compDates.start} to ${compDates.end}` : ''}
                    suffix="%"
                />
            </div>

            {/* Stores List Section */}
            <div id="quickview-stores-section" className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-secondary/30">
                    <h2 id="quickview-stores-title" className="font-semibold text-lg">Stores Overview</h2>
                </div>
                <div className="overflow-x-auto">
                    <table id="quickview-stores-table" className="w-full text-sm text-left">
                        <thead className="bg-[#0a0c10] text-muted-foreground font-medium border-b border-border">
                            <tr>
                                <th className="px-6 py-3 min-w-[200px]">
                                    <div className="flex flex-col gap-2">
                                        <span>Store Name</span>
                                        <input
                                            type="text"
                                            name="name"
                                            value={quickFilters.name}
                                            onChange={handleFilterChange}
                                            placeholder="Ex: Store1, Store2..."
                                            className="w-full px-3 py-1.5 bg-[#0d1117] border border-border/50 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/30"
                                        />
                                    </div>
                                </th>
                                <th className="px-6 py-3 min-w-[250px]">
                                    <div className="flex flex-col gap-2">
                                        <span>URL</span>
                                        <input
                                            type="text"
                                            name="url"
                                            value={quickFilters.url}
                                            onChange={handleFilterChange}
                                            placeholder="Filter..."
                                            className="w-full px-3 py-1.5 bg-[#0d1117] border border-border/50 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/30"
                                        />
                                    </div>
                                </th>
                                <th className="px-6 py-3 min-w-[200px]">
                                    <div className="flex flex-col gap-2">
                                        <span>Tags</span>
                                        <input
                                            type="text"
                                            name="tags"
                                            value={quickFilters.tags}
                                            onChange={handleFilterChange}
                                            placeholder="Ex: Tag1, Tag2..."
                                            className="w-full px-3 py-1.5 bg-[#0d1117] border border-border/50 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/30"
                                        />
                                    </div>
                                </th>
                                <th className="px-6 py-3 min-w-[150px]">
                                    <div className="flex flex-col gap-2">
                                        <span>Success Status</span>
                                        <input
                                            type="text"
                                            name="success"
                                            value={quickFilters.success}
                                            onChange={handleFilterChange}
                                            placeholder="Ex: Alto, Medio..."
                                            className="w-full px-3 py-1.5 bg-[#0d1117] border border-border/50 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/30"
                                        />
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody id="quickview-stores-tbody" className="divide-y divide-border">
                            {filteredStores.map((store: any) => (
                                <tr 
                                    id={`quickview-store-row-${store.id}`}
                                    key={store.id} 
                                    onClick={() => selectStore(store.id)}
                                    className={clsx(
                                        "hover:bg-secondary/50 transition-colors cursor-pointer group",
                                        selectedStore.id === store.id ? "bg-primary/10" : "hover:bg-secondary/30"
                                    )}
                                >
                                    <td className="px-6 py-4 font-medium text-foreground group-hover:text-primary transition-colors">{store.name}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{store.url}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {store.tags?.map((tag: string, i: number) => (
                                                <span key={i} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-[10px] font-medium">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            {store.successLevels ? (
                                                <>
                                                    <SuccessBadge level={store.successLevels.fixed} label="Fixed" metrics={store.successData?.metrics} />
                                                    <SuccessBadge level={store.successLevels.percentage} label="Growth" metrics={store.successData?.metrics} />
                                                </>
                                            ) : (
                                                <span className="text-[10px] text-muted-foreground italic">No data</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredStores.length === 0 && (
                                <tr id="quickview-no-stores-row">
                                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search size={24} className="opacity-10" />
                                            <span>No stores found matching your filters.</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { TrendingUp, ShoppingCart, DollarSign, Activity, Target, Calendar, Info } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useDateRange } from '../../context/DateRangeContext';
import { useSettings } from '../../context/SettingsContext';
import { StoreSelector } from '../store/StoreSelector';
import { DateRangePicker } from '../common/DateRangePicker';
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
        range: {
            start: string;
            end: string;
        } | null;
        values: {
            totalRevenue: number;
            totalOrders: number;
            averageOrderValue: number;
            totalSessions: number;
            conversionRate: number;
        } | null;
    } | null;
    salesOverTime: { name: string; value: number }[];
    topProducts: { id: string; title: string; totalSales: number }[];
}

const MetricCard = ({ title, value, change, comparisonLabel, icon: Icon, id }: any) => {
    const isNeutral = change == null || Math.abs(change) < 0.1;
    const isPositive = change != null && change > 0;
    const colorClass = isNeutral ? 'text-foreground/70' : (isPositive ? 'text-green-500' : 'text-red-500');

    return (
        <div id={id} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground text-sm font-medium">{title}</span>
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon size={18} className="text-primary" />
                </div>
            </div>
            <div className="flex items-end justify-between">
                <div className="w-full">
                    <div className="flex items-baseline justify-between w-full">
                        <h3 className="text-2xl font-bold text-foreground">{value}</h3>
                    </div>
                    {change != null && (
                        <div className={`flex items-center gap-1 mt-1 text-sm ${colorClass} font-medium`}>
                            {change > 0 ? <TrendingUp size={14} /> : <TrendingUp size={14} className="rotate-180" />}
                            <span>{change > 0 ? '+' : ''}{parseFloat(change.toString()).toFixed(1)}%</span>
                            <span className="text-muted-foreground ml-1 text-xs">{comparisonLabel}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const Analytics = () => {
    const { selectedStore, isLoading: isStoreLoading } = useStore();
    const { dateRange, setDateRange, comparisonPeriod, setComparisonPeriod } = useDateRange();
    const { formatCurrency, t } = useSettings();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [successStatus, setSuccessStatus] = useState<SuccessStatus | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Force comparison to previous_period for this view
    useEffect(() => {
        if (comparisonPeriod !== 'previous_period') {
            setComparisonPeriod('previous_period');
        }
    }, [comparisonPeriod, setComparisonPeriod]);

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

    useEffect(() => {
        let isMounted = true;

        const fetchAnalytics = async () => {
            if (!selectedStore) return;

            setIsLoading(true);
            setError(null);
            try {
                const queryParams = new URLSearchParams({
                    startDate: dateRange.start,
                    endDate: dateRange.end,
                    comparisonPeriod: comparisonPeriod,
                });

                // Fetch analytics data
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                
                // Fetch both in parallel
                const [analyticsRes, successRes] = await Promise.all([
                    fetch(`${apiUrl}/analytics/${selectedStore.id}?${queryParams}`),
                    fetch(`${apiUrl}/analytics/success-status/${selectedStore.id}`)
                ]);

                if (!analyticsRes.ok) throw new Error('Failed to fetch analytics data');
                if (!successRes.ok) console.warn('Failed to fetch success status');

                const analyticsResult = await analyticsRes.json();
                const successResult = successRes.ok ? await successRes.json() : null;

                if (isMounted) {
                    setData(analyticsResult);
                    setSuccessStatus(successResult);
                }

            } catch (err) {
                if (isMounted) {
                    console.error('Error fetching analytics:', err);
                    setError('Failed to load analytics data');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchAnalytics();

        return () => {
            isMounted = false;
        };
    }, [selectedStore, dateRange, comparisonPeriod]);

    if (isStoreLoading) {
        return <div className="flex items-center justify-center h-64">Loading analytics...</div>;
    }

    if (!selectedStore) {
        return (
            <div className="space-y-8">
                <div id="analytics-controls" className="flex flex-wrap items-center gap-4 bg-card/30 p-4 rounded-xl border border-border/50">
                    <StoreSelector />
                </div>
                
                <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                    <div className="p-4 bg-secondary/50 rounded-full">
                        <span className="text-4xl">📊</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">{t('analytics.noStore.title')}</h3>
                        <p className="text-muted-foreground">{t('analytics.noStore.desc')}</p>
                    </div>
                </div>
            </div>
        );
    }

    const getGradientOffsets = () => {
        if (!selectedStore?.startDate || !selectedStore?.endDate || !data?.salesOverTime?.length) {
            return { start: 0, end: 0, startIndex: -1, endIndex: -1 };
        }

        const dataLength = data.salesOverTime.length;
        if (dataLength < 2) return { start: 0, end: 0, startIndex: -1, endIndex: -1 };

        const viewStart = new Date(dateRange.start).getTime();
        const viewEnd = new Date(dateRange.end).getTime();
        const refStart = new Date(selectedStore.startDate).getTime();
        const refEnd = new Date(selectedStore.endDate).getTime();

        if (isNaN(refStart) || isNaN(refEnd)) return { start: 0, end: 0, startIndex: -1, endIndex: -1 };

        const totalDuration = viewEnd - viewStart;
        if (totalDuration <= 0) return { start: 0, end: 0, startIndex: -1, endIndex: -1 };

        const startPercentTime = (refStart - viewStart) / totalDuration;
        const endPercentTime = (refEnd - viewStart) / totalDuration;

        let startIndex = Math.floor(startPercentTime * (dataLength - 1));
        let endIndex = Math.floor(endPercentTime * (dataLength - 1));

        // Clamp indices
        startIndex = Math.max(0, Math.min(dataLength - 1, startIndex));
        endIndex = Math.max(0, Math.min(dataLength - 1, endIndex));

        // Calculate offsets based on INDICES to align with the dots/grid
        const startOffset = startIndex / (dataLength - 1);
        const endOffset = endIndex / (dataLength - 1);

        return { start: startOffset, end: endOffset, startIndex, endIndex };
    };

    const gradientInfo = getGradientOffsets();


    return (
        <div id="analytics-container" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Analytics Controls Section */}
            <div id="analytics-controls" className="flex flex-wrap items-center justify-between gap-4 bg-card/30 p-4 rounded-xl border border-border/50">
                <div className="flex items-center gap-4">
                    <StoreSelector />
                </div>
                <div id="date-controls-group" className="flex items-center gap-3">
                    <DateRangePicker 
                        value={dateRange} 
                        onChange={setDateRange} 
                        secondaryAction={selectedStore?.startDate && selectedStore?.endDate ? {
                            label: t('period.setToRef'),
                            onClick: setRefPeriod,
                            icon: Calendar
                        } : undefined}
                    />

                    {/* Period Visualization */}
                    <div className="hidden lg:flex flex-col items-end mr-2 text-[10px] leading-tight">
                        <div className="flex items-center gap-1">
                            <span className="text-muted-foreground font-bold uppercase tracking-wider">{t('period.reference')}:</span>
                            <span className="text-foreground font-medium">
                                {dateRange.start} <span className="text-muted-foreground/50 mx-0.5 font-normal italic lowercase">to</span> {dateRange.end}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-muted-foreground font-bold uppercase tracking-wider">{t('metric.comparedWith')}:</span>
                            <span className="font-semibold tracking-tight">
                                {data?.comparison?.range ? (
                                    <>
                                        {data.comparison.range.start} <span className="text-muted-foreground/50 mx-0.5 font-normal italic lowercase">to</span> {data.comparison.range.end}
                                    </>
                                ) : '...'}
                            </span>
                        </div>
                    </div>

                    {/* Auto-Calculated Badge with Tooltip */}
                    <div className="relative group">
                        <div className="flex items-center gap-1.5 px-3 py-2 bg-primary/5 border border-primary/20 rounded-md text-[10px] font-bold text-primary cursor-help h-[38px] shadow-sm">
                            <Activity size={12} />
                            {t('period.autoCalculated').toUpperCase()}
                        </div>
                        
                        {/* Logic Tooltip */}
                        <div className="absolute right-0 top-full mt-2 w-64 p-4 bg-popover border border-border rounded-xl shadow-2xl text-xs text-popover-foreground invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-50 normal-case font-normal leading-relaxed">
                            <div className="space-y-3">
                                <div className="font-bold text-primary flex items-center gap-2 border-b border-border/50 pb-1 uppercase tracking-tight">
                                    <Info size={14} />
                                    {t('period.calculationLogic')}
                                </div>
                                <div className="space-y-2">
                                    <p className="font-semibold text-foreground underline decoration-primary/30 underline-offset-2">{t('tooltip.autoCalc.refDesc')}</p>
                                    <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                                        <li>{t('tooltip.autoCalc.refStart')}</li>
                                        <li>{t('tooltip.autoCalc.refEnd')}</li>
                                    </ul>
                                </div>
                                <div className="space-y-2 border-t border-border/50 pt-2">
                                    <p className="font-semibold text-foreground underline decoration-primary/30 underline-offset-2">{t('tooltip.autoCalc.compDesc')}</p>
                                    <p className="text-muted-foreground">
                                        {t('tooltip.autoCalc.compLogic')}
                                    </p>
                                </div>
                                <div className="text-[10px] bg-secondary/50 p-2 rounded text-muted-foreground italic">
                                    {t('tooltip.autoCalc.methodology')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isLoading && (
                <div id="analytics-loading-overlay" className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 rounded-xl">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            )}

            {error ? (
                <div id="analytics-error-display" className="flex items-center justify-center h-64 text-red-500">{error}</div>
            ) : (
                <>
                    {/* Success Case Summary */}
                    {successStatus && (
                        <div className="mb-8">
                            <SuccessCaseBanner successStatus={successStatus as any} />
                        </div>
                    )}

                    {/* Metrics Grid */}
                    <div id="analytics-metrics-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        <MetricCard
                            id="analytics-metric-revenue"
                            title={t('metric.revenue')}
                            value={formatCurrency(data?.totalRevenue ?? 0)}
                            change={data?.comparison?.totalRevenueChange}
                            comparisonLabel={comparisonPeriod === 'previous_period' ? `${t('common.vs')} ${t('analytics.lastPeriod')}` : ''}
                            icon={DollarSign}
                        />
                        <MetricCard
                            id="analytics-metric-orders"
                            title={t('metric.orders')}
                            value={(data?.totalOrders ?? 0).toLocaleString()}
                            change={data?.comparison?.totalOrdersChange}
                            comparisonLabel={comparisonPeriod === 'previous_period' ? `${t('common.vs')} ${t('analytics.lastPeriod')}` : ''}
                            icon={ShoppingCart}
                        />
                        <MetricCard
                            id="analytics-metric-aov"
                            title={t('metric.aov')}
                            value={formatCurrency(data?.averageOrderValue ?? 0)}
                            change={data?.comparison?.averageOrderValueChange}
                            comparisonLabel={comparisonPeriod === 'previous_period' ? `${t('common.vs')} ${t('analytics.lastPeriod')}` : ''}
                            icon={DollarSign}
                        />
                        <MetricCard
                            id="analytics-metric-sessions"
                            title={t('metric.sessions')}
                            value={(data?.totalSessions ?? 0).toLocaleString()}
                            change={data?.comparison?.totalSessionsChange}
                            comparisonLabel={comparisonPeriod === 'previous_period' ? `${t('common.vs')} ${t('analytics.lastPeriod')}` : ''}
                            icon={Activity}
                        />
                        <MetricCard
                            id="analytics-metric-conversion"
                            title={t('metric.conversion')}
                            value={`${(Math.floor((data?.conversionRate ?? 0) * 10) / 10).toFixed(1)}%`}
                            change={data?.comparison?.conversionRateChange}
                            comparisonLabel={comparisonPeriod === 'previous_period' ? `${t('common.vs')} ${t('analytics.lastPeriod')}` : ''}
                            icon={Target}
                        />
                    </div>

                    {/* Charts Section */}
                    <div id="analytics-charts-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Chart */}
                        <div id="analytics-revenue-chart-container" className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-semibold mb-6">{t('analytics.revenueOverview')}</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart 
                                        id="revenue-area-chart"
                                        data={data?.salesOverTime ?? []}
                                    >
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                            </linearGradient>

                                            {/* Stroke Gradient (Horizontal Switch) */}
                                            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset={`${(gradientInfo.start * 100)}%`} stopColor="hsl(var(--primary))" />
                                                <stop offset={`${(gradientInfo.start * 100)}%`} stopColor="#0d4a2d" />
                                                <stop offset={`${(gradientInfo.end * 100)}%`} stopColor="#0d4a2d" />
                                                <stop offset={`${(gradientInfo.end * 100)}%`} stopColor="hsl(var(--primary))" />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            stroke="hsl(var(--muted-foreground))"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            minTickGap={30}
                                        />
                                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value)} />
                                        <Tooltip
                                            formatter={(value: number) => [formatCurrency(value), t('metric.revenue')]}
                                            labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '8px', fontWeight: 'bold' }}
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--card))',
                                                borderColor: 'hsl(var(--border))',
                                                borderRadius: '12px',
                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                                border: '1px solid hsl(var(--border))'
                                            }}
                                            itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold', fontSize: '14px' }}
                                        />

                                        {/* Main Area (Primary Color with Gradient Stroke) */}
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="url(#strokeGradient)"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorValue)"
                                            isAnimationActive={false}
                                        />

                                        {gradientInfo.startIndex !== -1 && data?.salesOverTime[gradientInfo.startIndex] && (
                                            <ReferenceDot
                                                x={data.salesOverTime[gradientInfo.startIndex].name}
                                                y={data.salesOverTime[gradientInfo.startIndex].value}
                                                r={5}
                                                fill="#38bdf8"
                                                stroke="white"
                                                strokeWidth={2}
                                            />
                                        )}
                                        {gradientInfo.endIndex !== -1 && data?.salesOverTime[gradientInfo.endIndex] && (
                                            <ReferenceDot
                                                x={data.salesOverTime[gradientInfo.endIndex].name}
                                                y={data.salesOverTime[gradientInfo.endIndex].value}
                                                r={5}
                                                fill="#38bdf8"
                                                stroke="white"
                                                strokeWidth={2}
                                            />
                                        )}
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Top Products */}
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col min-h-[400px]">
                            <h3 className="text-lg font-semibold mb-6">{t('analytics.topProducts')}</h3>
                            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                                {(!data?.topProducts || data.topProducts.filter(p => p.totalSales > 0).length === 0) ? (
                                    <div className="h-full flex flex-col items-center justify-center py-8 text-center bg-secondary/10 rounded-xl border border-dashed border-border">
                                        <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-3">
                                            <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <p className="text-muted-foreground text-sm">{t('analytics.noProducts')}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{t('analytics.tryAdjustingDate')}</p>
                                    </div>
                                ) : (
                                    data.topProducts
                                        .filter(product => product.totalSales > 0)
                                        .map((product, index) => {
                                            const maxSales = data.topProducts[0]?.totalSales || 1;
                                            const percentage = (product.totalSales / maxSales) * 100;
                                            const rankColors = ['bg-yellow-500', 'bg-gray-400', 'bg-orange-600'];
                                            const rankColor = rankColors[index] || 'bg-primary';

                                            return (
                                                <div id={`top-product-item-${product.id}`} key={product.id} className="relative group">
                                                    <div className="flex items-center gap-3 p-3 hover:bg-secondary/30 rounded-lg transition-all cursor-pointer">
                                                        {/* Rank Badge */}
                                                        <div id={`top-product-rank-${index + 1}`} className={`w-6 h-6 ${rankColor} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                                            {index + 1}
                                                        </div>

                                                        {/* Product Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <p id={`top-product-title-${product.id}`} className="font-medium text-sm truncate" title={product.title}>
                                                                {product.title}
                                                            </p>
                                                            {/* Progress Bar */}
                                                            <div className="mt-1.5 h-1.5 bg-secondary rounded-full overflow-hidden">
                                                                <div
                                                                    id={`top-product-progress-${product.id}`}
                                                                    className="h-full bg-primary transition-all duration-500 rounded-full"
                                                                    style={{ width: `${percentage}%` }}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Sales Amount */}
                                                        <div id={`top-product-sales-${product.id}`} className="text-right flex-shrink-0">
                                                            <p className="font-semibold text-sm">
                                                                {formatCurrency(product.totalSales)}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {percentage.toFixed(0)}%
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { TrendingUp, ShoppingCart, DollarSign, Activity, Target } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useDateRange } from '../../context/DateRangeContext';

interface AnalyticsData {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    salesOverTime: { name: string; value: number }[];
    topProducts: { id: string; title: string; totalSales: number }[];
}

interface SessionMetrics {
    sessions: { date: string; sessions: number; conversionRate: number | null }[];
}

const MetricCard = ({ title, value, change, icon: Icon }: any) => (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground text-sm font-medium">{title}</span>
            <div className="p-2 bg-primary/10 rounded-lg">
                <Icon size={18} className="text-primary" />
            </div>
        </div>
        <div className="flex items-end justify-between">
            <div>
                <h3 className="text-2xl font-bold text-foreground">{value}</h3>
                {change && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-green-500 font-medium">
                        <TrendingUp size={14} />
                        <span>{change}</span>
                        <span className="text-muted-foreground ml-1">vs last month</span>
                    </div>
                )}
            </div>
        </div>
    </div>
);

export const Analytics = () => {
    const { selectedStore, isLoading: isStoreLoading } = useStore();
    const { dateRange } = useDateRange();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [sessionMetrics, setSessionMetrics] = useState<SessionMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!selectedStore) return;

            setIsLoading(true);
            setError(null);
            try {
                const queryParams = new URLSearchParams({
                    startDate: dateRange.start,
                    endDate: dateRange.end
                });

                // Fetch analytics data
                const response = await fetch(`http://localhost:3000/analytics/${selectedStore.id}?${queryParams}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch analytics data');
                }
                const result = await response.json();
                setData(result);

                // Fetch session metrics
                const sessionResponse = await fetch(`http://localhost:3000/analytics/${selectedStore.id}/sessions?${queryParams}`);
                if (sessionResponse.ok) {
                    const sessionResult = await sessionResponse.json();
                    setSessionMetrics(sessionResult);
                }
            } catch (err) {
                console.error('Error fetching analytics:', err);
                setError('Failed to load analytics data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, [selectedStore, dateRange]);

    if (isStoreLoading) {
        return <div className="flex items-center justify-center h-64">Loading analytics...</div>;
    }

    if (!selectedStore) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                <div className="p-4 bg-secondary/50 rounded-full">
                    <span className="text-4xl">📊</span>
                </div>
                <div>
                    <h3 className="text-lg font-semibold">No Store Selected</h3>
                    <p className="text-muted-foreground">Please select a store to view its analytics.</p>
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

    // Calculate session metrics
    const totalSessions = sessionMetrics?.sessions.reduce((sum, m) => sum + m.sessions, 0) || 0;
    const avgConversionRate = sessionMetrics?.sessions.length
        ? (sessionMetrics.sessions
            .filter(m => m.conversionRate !== null)
            .reduce((sum, m) => sum + (m.conversionRate || 0), 0) /
            sessionMetrics.sessions.filter(m => m.conversionRate !== null).length) * 100
        : 0;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Analytics: {selectedStore.name}</h1>
            </div>

            {isLoading && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 rounded-xl">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            )}

            {error ? (
                <div className="flex items-center justify-center h-64 text-red-500">{error}</div>
            ) : (
                <>
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        <MetricCard
                            title="Total Revenue"
                            value={`$${(data?.totalRevenue ?? 0).toLocaleString()}`}
                            change={null}
                            icon={DollarSign}
                        />
                        <MetricCard
                            title="Total Orders"
                            value={(data?.totalOrders ?? 0).toLocaleString()}
                            change={null}
                            icon={ShoppingCart}
                        />
                        <MetricCard
                            title="Average Order Value"
                            value={`$${(data?.averageOrderValue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                            change={null}
                            icon={DollarSign}
                        />
                        <MetricCard
                            title="Total Sessions"
                            value={totalSessions.toLocaleString()}
                            change={null}
                            icon={Activity}
                        />
                        <MetricCard
                            title="Conversion Rate"
                            value={`${avgConversionRate.toFixed(2)}%`}
                            change={null}
                            icon={Target}
                        />
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Chart */}
                        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-semibold mb-6">Revenue Overview</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data?.salesOverTime ?? []}>
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
                                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                            itemStyle={{ color: 'hsl(var(--foreground))' }}
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
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-semibold mb-6">Top Products</h3>
                            <div className="space-y-3">
                                {(!data?.topProducts || data.topProducts.length === 0) ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-3">
                                            <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <p className="text-muted-foreground text-sm">No products found</p>
                                        <p className="text-xs text-muted-foreground mt-1">Try selecting a different date range</p>
                                    </div>
                                ) : (
                                    data.topProducts.map((product, index) => {
                                        const maxSales = data.topProducts[0]?.totalSales || 1;
                                        const percentage = (product.totalSales / maxSales) * 100;
                                        const rankColors = ['bg-yellow-500', 'bg-gray-400', 'bg-orange-600'];
                                        const rankColor = rankColors[index] || 'bg-primary';

                                        return (
                                            <div key={product.id} className="relative group">
                                                <div className="flex items-center gap-3 p-3 hover:bg-secondary/30 rounded-lg transition-all cursor-pointer">
                                                    {/* Rank Badge */}
                                                    <div className={`w-6 h-6 ${rankColor} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                                        {index + 1}
                                                    </div>

                                                    {/* Product Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm truncate" title={product.title}>
                                                            {product.title}
                                                        </p>
                                                        {/* Progress Bar */}
                                                        <div className="mt-1.5 h-1.5 bg-secondary rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary transition-all duration-500 rounded-full"
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Sales Amount */}
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="font-semibold text-sm">
                                                            ${product.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

import { useSettings } from '../../context/SettingsContext';

interface SuccessBadgeProps {
    level: string;
    label: string;
    thresholds?: { low: number; medium: number; high: number } | null;
    type?: 'fixed' | 'percentage';
    metrics?: any;
    showThresholds?: boolean;
}

export const SuccessBadge = ({ level, label, thresholds, type, metrics, showThresholds = false }: SuccessBadgeProps) => {
    const { formatCurrency } = useSettings();
    const colors = {
        alto: 'bg-green-500/10 text-green-500 border-green-500/20',
        medio: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        leve: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        negativo: 'bg-red-500/10 text-red-500 border-red-500/20',
        ninguno: 'bg-muted/50 text-muted-foreground border-border/50',
    };

    const colorClass = colors[level as keyof typeof colors] || colors.ninguno;
    const isGrowth = type === 'percentage' || label.toLowerCase().includes('growth');

    return (
        <div className="relative group/badge">
            <div className={`px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wider cursor-help transition-all hover:brightness-110 group-hover/badge:border-primary/50 ${colorClass}`}>
                {label}: {level.toUpperCase()}
            </div>
            
            {/* Analytics Style Tooltip (Thresholds) */}
            {showThresholds && thresholds && (
                <div className="absolute left-0 bottom-full mb-2 w-48 p-3 bg-popover border border-border rounded-lg shadow-xl text-[10px] text-popover-foreground invisible group-hover/badge:visible opacity-0 group-hover/badge:opacity-100 transition-all z-50 normal-case font-normal pointer-events-none">
                    <p className="font-bold border-b border-border/50 pb-1 mb-2 uppercase tracking-tight">Thresholds ({label})</p>
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-green-500 font-medium">
                            <span>Alto:</span>
                            <span>{isGrowth ? '+' : ''}{isGrowth ? thresholds.high : formatCurrency(thresholds.high)}{isGrowth ? '%' : ''}</span>
                        </div>
                        <div className="flex justify-between items-center text-blue-500 font-medium">
                            <span>Medio:</span>
                            <span>{isGrowth ? '+' : ''}{isGrowth ? thresholds.medium : formatCurrency(thresholds.medium)}{isGrowth ? '%' : ''}</span>
                        </div>
                        <div className="flex justify-between items-center text-yellow-500 font-medium">
                            <span>Leve:</span>
                            <span>{isGrowth ? '+' : ''}{isGrowth ? thresholds.low : formatCurrency(thresholds.low)}{isGrowth ? '%' : ''}</span>
                        </div>
                        <div className="pt-1 mt-1 border-t border-border/30 flex justify-between items-center text-red-500 font-medium">
                            <span>Negativo:</span>
                            <span>{isGrowth ? '< 0%' : `< ${formatCurrency(0)}`}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* QuickView Style Tooltip (Detailed Metrics) */}
            {!showThresholds && metrics && (
                <div className="absolute right-0 bottom-full mb-2 w-64 p-4 bg-popover border border-border rounded-xl shadow-2xl text-[11px] text-popover-foreground invisible group-hover/badge:visible opacity-0 group-hover/badge:opacity-100 transition-all z-50 normal-case font-normal leading-relaxed pointer-events-none">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-border/50 pb-2">
                            <span className="font-bold text-primary uppercase tracking-tighter">{label} Analysis</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${colorClass}`}>{level}</span>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Reference Increase:</span>
                                <span className="font-bold text-foreground">
                                    {label.toLowerCase().includes('fixed') 
                                        ? formatCurrency(metrics.fixedIncrease)
                                        : `${metrics.percentageIncrease.toFixed(1)}%`}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-muted-foreground">Duration:</span>
                                <span className="text-foreground font-medium">{metrics.durationInDays} days</span>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-border/50 space-y-1 text-[10px]">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground italic">Current Period Rev:</span>
                                <span className="text-foreground">{formatCurrency(metrics.currentRevenue)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground italic">Previous Period Rev:</span>
                                <span className="text-foreground">{formatCurrency(metrics.prevRevenue)}</span>
                            </div>
                        </div>

                        <div className="bg-secondary/30 p-2 rounded text-[9px] text-muted-foreground italic">
                            Compares current accompaniment duration vs same duration prior to start date.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

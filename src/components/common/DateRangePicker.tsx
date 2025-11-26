import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import 'react-day-picker/style.css';

interface DateRangePickerProps {
    value: { start: string; end: string };
    onChange: (range: { start: string; end: string }) => void;
}

export const DateRangePicker = ({ value, onChange }: DateRangePickerProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedRange, setSelectedRange] = useState<{ from?: Date; to?: Date } | undefined>({
        from: new Date(value.start),
        to: new Date(value.end)
    });
    const popoverRef = useRef<HTMLDivElement>(null);

    // Close popover when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
        setSelectedRange(range);

        if (range?.from && range?.to) {
            onChange({
                start: format(range.from, 'yyyy-MM-dd'),
                end: format(range.to, 'yyyy-MM-dd')
            });
            // Close after selecting both dates
            setTimeout(() => setIsOpen(false), 300);
        }
    };

    const formatDateRange = () => {
        const start = new Date(value.start);
        const end = new Date(value.end);
        return `${format(start, 'MMM dd, yyyy')} - ${format(end, 'MMM dd, yyyy')}`;
    };

    return (
        <div className="relative" ref={popoverRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-secondary/50 transition-colors text-sm font-medium"
            >
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{formatDateRange()}</span>
            </button>

            {/* Popover */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 z-50 bg-card border border-border rounded-xl shadow-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="mb-3">
                        <h4 className="text-sm font-semibold mb-1">Select Date Range</h4>
                        <p className="text-xs text-muted-foreground">
                            Click to select start date, then end date
                        </p>
                    </div>

                    <DayPicker
                        mode="range"
                        selected={selectedRange as any}
                        onSelect={handleSelect as any}
                        numberOfMonths={2}
                        className="date-range-picker"
                        classNames={{
                            months: "flex gap-4",
                            month: "space-y-4",
                            caption: "flex justify-center pt-1 relative items-center mb-4",
                            caption_label: "text-sm font-medium",
                            nav: "space-x-1 flex items-center",
                            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md hover:bg-secondary transition-colors",
                            nav_button_previous: "absolute left-1",
                            nav_button_next: "absolute right-1",
                            table: "w-full border-collapse space-y-1",
                            head_row: "flex",
                            head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                            row: "flex w-full mt-2",
                            cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-secondary first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-secondary hover:text-foreground rounded-md transition-colors",
                            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                            day_today: "bg-accent text-accent-foreground font-semibold",
                            day_outside: "text-muted-foreground opacity-50",
                            day_disabled: "text-muted-foreground opacity-50",
                            day_range_middle: "aria-selected:bg-secondary aria-selected:text-foreground rounded-none",
                            day_hidden: "invisible",
                        }}
                    />
                </div>
            )}
        </div>
    );
};

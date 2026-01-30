import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import 'react-day-picker/style.css';

interface DateRangePickerProps {
    value: { start?: string | null; end?: string | null };
    onChange: (range: { start: string; end: string }) => void;
    placeholder?: string;
}

export const DateRangePicker = ({ value, onChange, placeholder = "Select dates" }: DateRangePickerProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedRange, setSelectedRange] = useState<{ from?: Date; to?: Date } | undefined>(() => {
        if (!value.start || !value.end) return undefined;
        return {
            from: new Date(value.start),
            to: new Date(value.end)
        };
    });

    // Update selectedRange when value prop changes
    useEffect(() => {
        if (value.start && value.end) {
            setSelectedRange({
                from: new Date(value.start),
                to: new Date(value.end)
            });
        } else {
            setSelectedRange(undefined);
        }
    }, [value.start, value.end]);
    const [popoverPos, setPopoverPos] = useState<{ top: number; right: number } | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Close popover when clicking outside or scrolling
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleScroll = () => {
            if (isOpen) setIsOpen(false);
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', handleScroll, true);
            window.addEventListener('resize', handleScroll);

            // Calculate position
            if (popoverRef.current) {
                const rect = popoverRef.current.getBoundingClientRect();
                setPopoverPos({
                    top: rect.bottom + 5,
                    right: window.innerWidth - rect.right
                });
            }
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
        };
    }, [isOpen]);

    const [isSelectingEnd, setIsSelectingEnd] = useState(false);

    const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
        setSelectedRange(range);

        if (range?.from) {
            // If we are in the second step (selecting end) and have a valid end date
            if (isSelectingEnd && range.to) {
                onChange({
                    start: format(range.from, 'yyyy-MM-dd'),
                    end: format(range.to, 'yyyy-MM-dd')
                });
                setTimeout(() => setIsOpen(false), 300);
                setIsSelectingEnd(false);
            } else {
                // First click (selecting start), move to next step
                setIsSelectingEnd(true);
            }
        } else {
            setIsSelectingEnd(false);
        }
    };

    const formatDateRange = () => {
        if (!value.start || !value.end) {
            return placeholder;
        }
        // Append T00:00:00 to ensure local time interpretation instead of UTC
        const start = new Date(`${value.start}T00:00:00`);
        const end = new Date(`${value.end}T00:00:00`);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return placeholder;
        }

        return `${format(start, 'MMM dd, yyyy')} - ${format(end, 'MMM dd, yyyy')}`;
    };

    return (
        <div className="relative" ref={popoverRef}>
            {/* Trigger Button */}
            <button
                onClick={() => {
                    if (!isOpen) {
                        setSelectedRange(undefined);
                        setIsSelectingEnd(false);
                    }
                    setIsOpen(!isOpen);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-secondary/50 transition-colors text-sm font-medium"
            >
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{formatDateRange()}</span>
            </button>

            {/* Popover */}
            {isOpen && popoverPos && (
                <div
                    className="fixed z-50 bg-[hsl(217.2,32.6%,25%)] border border-border rounded-xl shadow-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200"
                    style={{ top: popoverPos.top, right: popoverPos.right }}
                >
                    <div className="mb-3">
                        <h4 className="text-sm font-semibold mb-1 text-foreground">Select Date Range</h4>
                        <p className="text-xs text-muted-foreground">
                            Click start date, then end date
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
                            caption_label: "text-sm font-medium text-foreground",
                            nav: "space-x-1 flex items-center",
                            nav_button: "h-7 w-7 bg-transparent p-0 text-foreground/70 hover:text-foreground hover:bg-secondary/50 inline-flex items-center justify-center rounded-md transition-colors",
                            nav_button_previous: "absolute left-1",
                            nav_button_next: "absolute right-1",
                            table: "w-full border-collapse space-y-1",
                            head_row: "flex",
                            head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                            row: "flex w-full mt-2",
                            cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-[hsl(217.2,32.6%,30%)] first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                            day: "h-9 w-9 p-0 font-normal text-foreground aria-selected:opacity-100 hover:bg-accent/30 hover:text-foreground rounded-md transition-colors",
                            day_selected: "bg-[hsl(210,40%,50%)] text-white hover:bg-[hsl(210,40%,55%)] hover:text-white focus:bg-[hsl(210,40%,50%)] focus:text-white font-semibold",
                            day_today: "",
                            day_outside: "text-muted-foreground/40 opacity-50",
                            day_disabled: "text-muted-foreground/30 opacity-30",
                            day_range_middle: "aria-selected:bg-[hsl(217.2,32.6%,30%)] aria-selected:text-foreground rounded-none",
                            day_hidden: "invisible",
                        }}
                    />
                </div>
            )}
        </div>
    );
};

"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown } from "lucide-react";

export interface DateRange {
  from: string; // yyyy-mm-dd
  to: string;   // yyyy-mm-dd
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

function toDateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

function todayStr() {
  return toDateStr(new Date());
}

function getCurrentFYStartYear() {
  const now = new Date();
  return now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
}

export const QUICK_OPTIONS = [
  {
    label: "Current FY",
    getRange: (): DateRange => {
      const y = getCurrentFYStartYear();
      return { from: `${y}-04-01`, to: todayStr() };
    },
  },
  {
    label: "Last FY",
    getRange: (): DateRange => {
      const y = getCurrentFYStartYear();
      return { from: `${y - 1}-04-01`, to: `${y}-03-31` };
    },
  },
  {
    label: "Current Month",
    getRange: (): DateRange => {
      const now = new Date();
      return {
        from: toDateStr(new Date(now.getFullYear(), now.getMonth(), 1)),
        to: todayStr(),
      };
    },
  },
  {
    label: "Last Month",
    getRange: (): DateRange => {
      const now = new Date();
      return {
        from: toDateStr(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
        to: toDateStr(new Date(now.getFullYear(), now.getMonth(), 0)),
      };
    },
  },
  {
    label: "Last 3 Months",
    getRange: (): DateRange => {
      const now = new Date();
      return {
        from: toDateStr(new Date(now.getFullYear(), now.getMonth() - 3, 1)),
        to: todayStr(),
      };
    },
  },
  {
    label: "Last 6 Months",
    getRange: (): DateRange => {
      const now = new Date();
      return {
        from: toDateStr(new Date(now.getFullYear(), now.getMonth() - 6, 1)),
        to: todayStr(),
      };
    },
  },
  {
    label: "Last 12 Months",
    getRange: (): DateRange => {
      const now = new Date();
      return {
        from: toDateStr(new Date(now.getFullYear() - 1, now.getMonth(), 1)),
        to: todayStr(),
      };
    },
  },
];

export function formatRangeDisplay(from: string, to: string) {
  if (!from || !to) return "Select date range";
  const fmt = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  return `${fmt(from)} – ${fmt(to)}`;
}

export function getActiveQuickLabel(range: DateRange): string | undefined {
  return QUICK_OPTIONS.find(o => {
    const r = o.getRange();
    return r.from === range.from && r.to === range.to;
  })?.label;
}

export function defaultDateRange(): DateRange {
  const y = getCurrentFYStartYear();
  return { from: `${y}-04-01`, to: todayStr() };
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(value.from);
  const [customTo, setCustomTo] = useState(value.to);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCustomFrom(value.from);
    setCustomTo(value.to);
  }, [value]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const applyCustom = () => {
    if (customFrom && customTo) {
      onChange({ from: customFrom, to: customTo });
      setOpen(false);
    }
  };

  const activeLabel = getActiveQuickLabel(value);

  return (
    <div className="relative w-full sm:w-auto" ref={containerRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full sm:w-auto flex items-center gap-2 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm text-white hover:border-indigo-500/70 transition-all duration-150 shadow-sm"
      >
        <Calendar className="w-4 h-4 text-indigo-400 flex-shrink-0" />
        {activeLabel ? (
          <>
            <span className="font-medium text-neutral-100 sm:hidden">{activeLabel}</span>
            <span className="hidden sm:inline font-medium text-neutral-100">
              {formatRangeDisplay(value.from, value.to)}
            </span>
            <span className="hidden sm:inline text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full font-medium">
              {activeLabel}
            </span>
          </>
        ) : (
          <span className="font-medium text-neutral-100 truncate max-w-[180px] sm:max-w-none">
            {formatRangeDisplay(value.from, value.to)}
          </span>
        )}
        <ChevronDown
          className={`w-4 h-4 text-neutral-500 flex-shrink-0 transition-transform duration-200 ml-auto sm:ml-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 z-50 bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col sm:flex-row w-[calc(100vw-2rem)] sm:min-w-[480px] sm:w-auto max-h-[80vh] overflow-y-auto">
          {/* Quick select */}
          <div className="flex flex-col p-3 gap-0.5 border-b sm:border-b-0 sm:border-r border-neutral-800 sm:min-w-[160px]">
            <p className="text-[10px] text-neutral-500 font-semibold uppercase tracking-widest px-3 py-2">
              Quick Select
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-0.5">
              {QUICK_OPTIONS.map(o => {
                const isActive = activeLabel === o.label;
                return (
                  <button
                    key={o.label}
                    onClick={() => {
                      onChange(o.getRange());
                      setOpen(false);
                    }}
                    className={`text-left px-3 py-2.5 rounded-lg text-sm transition-colors font-medium ${
                      isActive
                        ? "bg-indigo-500/20 text-indigo-400"
                        : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom range */}
          <div className="flex flex-col p-5 gap-4 flex-1">
            <p className="text-[10px] text-neutral-500 font-semibold uppercase tracking-widest">
              Custom Range
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-neutral-400 mb-1.5">From</label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={e => setCustomFrom(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1.5">To</label>
                <input
                  type="date"
                  value={customTo}
                  onChange={e => setCustomTo(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
            <button
              onClick={applyCustom}
              disabled={!customFrom || !customTo}
              className="mt-auto w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
            >
              Apply Range
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

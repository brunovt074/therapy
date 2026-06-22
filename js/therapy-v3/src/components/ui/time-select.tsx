"use client";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

const selectClass =
  "px-2 py-2 bg-[var(--bg-canvas)] border border-[var(--border-color)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent";

interface TimeSelectProps {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}

export function TimeSelect({ value, onChange, className }: TimeSelectProps) {
  const [hh, mm] = value ? value.split(":") : ["", ""];

  function setHour(h: string) {
    onChange(`${h}:${mm || "00"}`);
  }

  function setMinute(m: string) {
    onChange(`${hh || "00"}:${m}`);
  }

  return (
    <div className={`flex items-center gap-1 ${className ?? ""}`}>
      <select value={hh || ""} onChange={(e) => setHour(e.target.value)} className={`flex-1 ${selectClass}`}>
        <option value="" disabled>HH</option>
        {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
      </select>
      <span className="text-[var(--text-tertiary)] font-medium select-none">:</span>
      <select value={mm || ""} onChange={(e) => setMinute(e.target.value)} className={`flex-1 ${selectClass}`}>
        <option value="" disabled>MM</option>
        {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>
    </div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex w-full flex-col gap-2 text-sm font-medium text-ink">
      <span className="flex items-center justify-between">
        <span>{label}</span>
        <span className="text-muted">{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        className="h-2 cursor-pointer appearance-none rounded-full bg-slate-200 accent-primary"
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

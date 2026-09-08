'use client';

interface ChipProps {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function Chip({ label, selected = false, disabled = false, onClick }: ChipProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-all ${
        selected
          ? 'border-brand-600 bg-brand-600 text-white'
          : 'border-neutral-300 bg-white text-neutral-700 hover:border-brand-400'
      } ${disabled ? 'cursor-not-allowed opacity-50' : 'active:scale-95'}`}
    >
      {label}
    </button>
  );
}

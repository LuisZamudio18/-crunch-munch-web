'use client';

import { clsx } from 'clsx';

interface ChipProps {
  label: string;
  count?: number;
  disabled?: boolean;
  maxReached?: boolean;
  onAdd: () => void;
  onRemove: () => void;
}

export default function Chip({
  label,
  count = 0,
  disabled = false,
  maxReached = false,
  onAdd,
  onRemove,
}: ChipProps) {
  const isSelected = count > 0;
  const canAdd = !maxReached && !disabled;

  // Unselected: the whole chip is a single button to add
  if (!isSelected) {
    return (
      <button
        onClick={canAdd ? onAdd : undefined}
        disabled={!canAdd}
        className={clsx(
          'inline-flex items-center rounded-full border text-sm px-3 py-1.5 transition-all duration-200 select-none',
          canAdd
            ? 'border-coffee-300 text-coffee-600 hover:border-coffee-600 hover:bg-cream-100 active:bg-cream-200'
            : 'border-cream-300 bg-cream-100 text-coffee-300 cursor-not-allowed'
        )}
      >
        {label}
      </button>
    );
  }

  // Selected: show − label [×n] + controls
  return (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-coffee-700 bg-coffee-700 text-cream-50 text-sm transition-all duration-200 select-none">
      <button
        onClick={onRemove}
        className="w-7 h-7 rounded-full flex items-center justify-center text-cream-200 hover:text-cream-50 hover:bg-coffee-600 transition-colors ml-0.5 shrink-0"
        aria-label={`Quitar ${label}`}
      >
        −
      </button>
      <span className="px-2 py-1.5 leading-none">
        {label}
        {count > 1 && (
          <span className="ml-1.5 text-xs font-bold bg-gold-400 text-coffee-900 rounded-full px-1.5 py-0.5">
            ×{count}
          </span>
        )}
      </span>
      <button
        onClick={canAdd ? onAdd : undefined}
        disabled={!canAdd}
        className={clsx(
          'w-7 h-7 rounded-full flex items-center justify-center transition-colors mr-0.5 shrink-0',
          canAdd
            ? 'text-cream-200 hover:text-cream-50 hover:bg-coffee-600'
            : 'text-coffee-500 cursor-not-allowed opacity-50'
        )}
        aria-label={canAdd ? `Agregar otro ${label}` : 'Límite alcanzado'}
      >
        +
      </button>
    </div>
  );
}

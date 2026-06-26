'use client';

import { clsx } from 'clsx';

interface ChipProps {
  label: string;
  count?: number;
  disabled?: boolean;    // chip visual grayed-out (unselected + limit hit)
  maxReached?: boolean;  // blocks + button even when chip is already selected
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

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-1 rounded-full border text-sm transition-all duration-200 select-none',
        {
          'border-coffee-700 bg-coffee-700 text-cream-50': isSelected,
          'border-coffee-300 bg-transparent text-coffee-600 hover:border-coffee-500':
            !isSelected && !disabled,
          'border-cream-300 bg-cream-100 text-coffee-300 cursor-not-allowed': disabled && !isSelected,
        }
      )}
    >
      {/* − button (always available when selected) */}
      {isSelected && (
        <button
          onClick={onRemove}
          className="w-6 h-6 rounded-full flex items-center justify-center text-cream-200 hover:text-cream-50 hover:bg-coffee-600 transition-colors ml-1 shrink-0"
          aria-label={`Quitar ${label}`}
        >
          −
        </button>
      )}

      {/* Label */}
      <span
        className={clsx('px-3 py-1.5 leading-none', {
          'cursor-not-allowed': disabled && !isSelected,
        })}
      >
        {label}
        {count > 1 && (
          <span className="ml-1.5 text-xs font-bold bg-gold-400 text-coffee-900 rounded-full px-1.5 py-0.5">
            ×{count}
          </span>
        )}
      </span>

      {/* + button */}
      <button
        onClick={canAdd ? onAdd : undefined}
        disabled={!canAdd}
        className={clsx(
          'w-6 h-6 rounded-full flex items-center justify-center transition-colors mr-1 shrink-0',
          isSelected
            ? canAdd
              ? 'text-cream-200 hover:text-cream-50 hover:bg-coffee-600'
              : 'text-coffee-500 cursor-not-allowed opacity-50'
            : canAdd
            ? 'text-coffee-500 hover:text-coffee-700 hover:bg-cream-200'
            : 'text-cream-300 cursor-not-allowed'
        )}
        aria-label={canAdd ? `Agregar ${label}` : 'Límite alcanzado'}
      >
        +
      </button>
    </div>
  );
}

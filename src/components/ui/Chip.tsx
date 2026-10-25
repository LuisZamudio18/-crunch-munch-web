'use client';

import Image from 'next/image';
import { clsx } from 'clsx';

interface ChipProps {
  label: string;
  count?: number;
  disabled?: boolean;
  maxReached?: boolean;
  onAdd: () => void;
  onRemove: () => void;
  /** Picture of the item. With it the chip becomes a small card with the product floating over it. */
  image?: string;
}

export default function Chip({
  label,
  count = 0,
  disabled = false,
  maxReached = false,
  onAdd,
  onRemove,
  image,
}: ChipProps) {
  const isSelected = count > 0;
  const canAdd = !maxReached && !disabled;

  if (image) {
    return (
      <div
        className={clsx(
          'relative flex w-[104px] sm:w-[112px] flex-col items-center rounded-xl bg-white pb-2 pt-12 text-center transition-all duration-200 select-none',
          'shadow-[0_8px_18px_-12px_rgba(74,53,40,0.55)]',
          isSelected ? 'ring-2 ring-gold-400' : canAdd ? 'hover:-translate-y-0.5 hover:shadow-[0_14px_22px_-12px_rgba(74,53,40,0.6)]' : 'opacity-50'
        )}
      >
        <button
          type="button"
          onClick={canAdd ? onAdd : undefined}
          disabled={!canAdd}
          aria-label={isSelected ? `Agregar otro ${label}` : `Agregar ${label}`}
          className="absolute inset-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 disabled:cursor-not-allowed"
        />
        <div className="pointer-events-none absolute -top-5 left-1/2 h-[68px] w-[84px] -translate-x-1/2">
          <Image
            src={image}
            alt=""
            fill
            sizes="90px"
            className="object-contain drop-shadow-[0_8px_8px_rgba(74,53,40,0.28)]"
          />
        </div>
        <span className="pointer-events-none px-1.5 font-sans text-[13px] font-semibold uppercase leading-tight tracking-[0.04em] text-coffee-800 line-clamp-2 min-h-[1.9em]">
          {label}
        </span>

        {isSelected && (
          <div className="relative z-10 mt-1.5 flex items-center gap-1 rounded-full bg-coffee-600 px-1 py-0.5 text-cream-50">
            <button
              type="button"
              onClick={onRemove}
              className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-coffee-500"
              aria-label={`Quitar ${label}`}
            >
              −
            </button>
            <span className="min-w-[1.25rem] text-center text-[13px] font-bold">×{count}</span>
            <button
              type="button"
              onClick={canAdd ? onAdd : undefined}
              disabled={!canAdd}
              className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-coffee-500 disabled:opacity-40"
              aria-label={canAdd ? `Agregar otro ${label}` : 'Límite alcanzado'}
            >
              +
            </button>
          </div>
        )}
      </div>
    );
  }

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
          <span className="ml-1.5 text-[13px] font-bold bg-gold-400 text-coffee-900 rounded-full px-1.5 py-0.5">
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

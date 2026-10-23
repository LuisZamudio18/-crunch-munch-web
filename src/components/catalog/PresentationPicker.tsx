'use client';

import { clsx } from 'clsx';
import { PRESENTATION_OPTIONS } from '@/data/services';
import { PRESENTATION_PHOTO_BY_OPTION } from '@/data/presentations';
import PresentationPhoto from './PresentationPhoto';

interface PresentationPickerProps {
  /** The chosen option, or null when none is chosen yet. */
  value: string | null;
  onChange: (value: string | null) => void;
}

/** Photo cards to choose how the drinks are served; used by the bar preview and by the configurator. */
export default function PresentationPicker({ value, onChange }: PresentationPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Presentación de las bebidas">
      {PRESENTATION_OPTIONS.map((item) => {
        const active = value === item;
        return (
          <button
            key={item}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(active ? null : item)}
            className={clsx(
              'rounded-2xl border p-2 text-left transition-all duration-200',
              active ? 'border-coffee-700 bg-coffee-700/5 ring-2 ring-coffee-700' : 'border-coffee-300 hover:border-coffee-500'
            )}
          >
            <PresentationPhoto photo={PRESENTATION_PHOTO_BY_OPTION[item]} caption={item} />
            <span
              className={clsx(
                'mt-2 block rounded-full px-3 py-1.5 text-center text-xs font-medium',
                active ? 'bg-coffee-700 text-cream-50' : 'bg-cream-100 text-coffee-600'
              )}
            >
              {active ? '✓ Elegida' : 'Elegir'}
            </span>
          </button>
        );
      })}
    </div>
  );
}

'use client';

import Image from 'next/image';
import { clsx } from 'clsx';
import type { Service, ServiceCategory } from '@/types';

/** Un color de acento de la guía de marca por tipo de servicio. */
const CATEGORY_TINT: Record<ServiceCategory, string> = {
  bebidas: 'bg-rosa',
  dulce: 'bg-lila',
  salado: 'bg-naranja',
  brunch: 'bg-amarillo',
};

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  bebidas: 'Bebidas',
  dulce: 'Dulce',
  salado: 'Salado',
  brunch: 'Brunch',
};

interface ServiceCardProps {
  service: Service;
  selected?: boolean;
  onSelect?: () => void;
}

export default function ServiceCard({ service, selected = false, onSelect }: ServiceCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`${service.name}: ver detalle`}
      className={clsx(
        'group relative block w-full text-left rounded-[1.75rem] bg-white p-3 transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-[0_24px_40px_-24px_rgba(74,53,40,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400',
        selected ? 'ring-2 ring-gold-400 shadow-lg' : 'shadow-[0_10px_30px_-22px_rgba(74,53,40,0.5)]'
      )}
    >
      <div className="relative aspect-[4/4.4] overflow-hidden rounded-[1.25rem] bg-cream-200">
        {service.image ? (
          <Image
            src={service.image}
            alt={`${service.name}: barra móvil de Crunch & Munch`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 70vw, 280px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl">{service.emoji}</div>
        )}

        <span
          className={clsx(
            'absolute left-3 top-3 rounded-full px-3 py-1 font-sans text-[13px] font-semibold uppercase tracking-[0.16em] text-coffee-800',
            CATEGORY_TINT[service.category]
          )}
        >
          {CATEGORY_LABELS[service.category]}
        </span>

        {selected && (
          <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-gold-400 shadow-md" aria-hidden="true">
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
              <path d="M1 5l3.5 3.5L11 1" stroke="#26231F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>

      <div className="px-2 pb-2 pt-4">
        <h3 className="font-serif italic text-[1.7rem] leading-[1.05] text-coffee-700 mb-2">{service.name}</h3>
        <p className="font-sans text-[13px] leading-relaxed text-coffee-500 line-clamp-2 mb-4">{service.description}</p>
        <div className="flex items-center justify-between gap-2 border-t border-gold-400/40 pt-3">
          <span className="font-sans text-[13px] uppercase tracking-[0.06em] text-coffee-500">Desde {service.minPersonas} personas</span>
          <span className="font-sans text-[13px] font-semibold uppercase tracking-[0.1em] text-gold-600 whitespace-nowrap group-hover:text-coffee-700 transition-colors">
            {selected ? 'Seleccionada' : 'Ver más'}
          </span>
        </div>
      </div>
    </button>
  );
}

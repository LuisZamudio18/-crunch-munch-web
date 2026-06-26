'use client';

import Image from 'next/image';
import { clsx } from 'clsx';
import type { Service, ServiceCategory } from '@/types';

const CATEGORY_GRADIENT: Record<ServiceCategory, string> = {
  bebidas: 'from-coffee-700 to-coffee-900',
  dulce: 'from-coffee-600 to-coffee-800',
  salado: 'from-coffee-800 to-coffee-900',
  brunch: 'from-coffee-500 to-coffee-700',
};

const CATEGORY_BADGE: Record<ServiceCategory, string> = {
  bebidas: 'bg-blue-900/60 text-blue-200',
  dulce: 'bg-pink-900/60 text-pink-200',
  salado: 'bg-orange-900/60 text-orange-200',
  brunch: 'bg-green-900/60 text-green-200',
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
  const selectionSummary = service.selectionGroups
    .filter((g) => g.type !== 'fixed-display')
    .map((g) => {
      if (g.type === 'choose-1') return `1 ${g.label.toLowerCase()}`;
      if (g.totalMax) return `Hasta ${g.totalMax} ${g.label.toLowerCase()}`;
      return g.label;
    })
    .join(' · ');

  return (
    <div
      onClick={onSelect}
      className={clsx(
        'relative group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300',
        'hover:scale-[1.02] hover:shadow-2xl',
        selected
          ? 'ring-2 ring-gold-400 ring-offset-2 ring-offset-cream-50 shadow-xl scale-[1.01]'
          : 'shadow-md hover:shadow-xl'
      )}
    >
      {/* Photo or gradient background */}
      <div className="relative min-h-[220px] flex flex-col justify-between">

        {service.image ? (
          <Image
            src={service.image}
            alt={service.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${CATEGORY_GRADIENT[service.category]}`} />
        )}

        {/* Overlay — heavier at bottom for text readability */}
        <div
          className={clsx(
            'absolute inset-0',
            service.image
              ? 'bg-gradient-to-t from-coffee-900/80 via-coffee-900/20 to-transparent'
              : 'bg-gradient-to-t from-black/40 to-transparent'
          )}
        />

        {/* Top row: category badge + checkmark */}
        <div className="relative z-10 p-5 flex items-start justify-between">
          <span className={clsx(
            'text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-medium',
            CATEGORY_BADGE[service.category]
          )}>
            {CATEGORY_LABELS[service.category]}
          </span>

          {selected && (
            <div className="w-6 h-6 rounded-full bg-gold-400 flex items-center justify-center shrink-0 shadow-md">
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                <path d="M1 5l3.5 3.5L11 1" stroke="#2C1A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>

        {/* Bottom: emoji (only when no photo) + name + description */}
        <div className="relative z-10 p-5">
          {!service.image && (
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
              {service.emoji}
            </div>
          )}
          <h3 className="text-display text-xl text-cream-50 leading-tight mb-1">
            {service.name}
          </h3>
          <p className="text-coffee-300 text-xs leading-relaxed line-clamp-2">
            {service.description}
          </p>
        </div>
      </div>

      {/* Footer bar */}
      <div className="bg-coffee-900/95 px-5 py-3 flex items-center justify-between">
        {selectionSummary ? (
          <p className="text-[10px] text-coffee-400 truncate max-w-[70%]">{selectionSummary}</p>
        ) : (
          <p className="text-[10px] text-coffee-400">Menú completo incluido</p>
        )}
        <span className={clsx(
          'text-[10px] font-semibold tracking-wider uppercase transition-colors',
          selected ? 'text-gold-400' : 'text-cream-400 group-hover:text-gold-400'
        )}>
          {selected ? 'Seleccionado ✓' : 'Ver más →'}
        </span>
      </div>
    </div>
  );
}

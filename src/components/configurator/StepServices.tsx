'use client';

import Image from 'next/image';
import { clsx } from 'clsx';
import { SERVICE_MAP } from '@/data/services';
import type { ServiceCategory } from '@/types';

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  bebidas: 'Bebidas',
  dulce: 'Dulce',
  salado: 'Salado',
  brunch: 'Brunch',
};

const CATEGORY_BADGE: Record<ServiceCategory, string> = {
  bebidas: 'bg-blue-100 text-blue-700',
  dulce: 'bg-pink-100 text-pink-700',
  salado: 'bg-orange-100 text-orange-700',
  brunch: 'bg-green-100 text-green-700',
};

interface StepServicesProps {
  selectedServices: string[];
  onToggle: (id: string) => void;
  onGoToCatalog: () => void;
}

export default function StepServices({ selectedServices, onToggle, onGoToCatalog }: StepServicesProps) {
  const selected = selectedServices.map((id) => SERVICE_MAP[id]).filter(Boolean);

  return (
    <div>
      <div className="mb-5">
        <h3 className="text-display text-2xl text-coffee-800 mb-1">Tu selección</h3>
        <p className="text-sm text-coffee-500">
          {selected.length > 0
            ? `${selected.length} barra${selected.length !== 1 ? 's' : ''} en tu cotización. Puedes quitar las que no quieras.`
            : 'Aún no tienes barras seleccionadas. Cierra este panel y elige del catálogo.'}
        </p>
      </div>

      {/* Add more / go to catalog */}
      <button
        onClick={onGoToCatalog}
        className="w-full flex items-center justify-center gap-2 border border-dashed border-coffee-300 rounded-2xl py-3 text-sm text-coffee-500 hover:border-coffee-500 hover:text-coffee-700 hover:bg-cream-100 transition-all duration-200 mb-4"
      >
        <span className="text-lg">+</span>
        {selected.length === 0 ? 'Ir al catálogo a elegir barras' : 'Añadir más barras desde el catálogo'}
      </button>

      {selected.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="text-4xl mb-3">🍃</div>
          <p className="text-coffee-400 text-sm">
            Aún no tienes barras. Usa el botón de arriba para ir al catálogo.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
          {selected.map((service) => (
            <div
              key={service.id}
              className="flex items-center gap-3 bg-white rounded-2xl border border-cream-200 overflow-hidden shadow-sm"
            >
              {/* Thumbnail */}
              <div className="relative w-20 h-20 shrink-0">
                {service.image ? (
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-coffee-700 to-coffee-900 flex items-center justify-center text-2xl">
                    {service.emoji}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 py-2">
                <span className={clsx(
                  'text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-medium',
                  CATEGORY_BADGE[service.category]
                )}>
                  {CATEGORY_LABELS[service.category]}
                </span>
                <p className="font-semibold text-coffee-800 text-sm mt-1 truncate">{service.name}</p>
              </div>

              {/* Remove button */}
              <button
                onClick={() => onToggle(service.id)}
                className="shrink-0 mr-4 w-7 h-7 rounded-full bg-cream-100 hover:bg-red-100 hover:text-red-600 flex items-center justify-center text-coffee-400 transition-colors text-sm"
                aria-label={`Quitar ${service.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

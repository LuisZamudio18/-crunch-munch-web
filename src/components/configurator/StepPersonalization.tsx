'use client';

import { clsx } from 'clsx';
import type { PersonalizationData } from '@/types';

const DECORACION_OPTIONS = ['Flores', 'Espejo selfie', 'Imágenes', 'Globos'];

const PRESENTACION_BEBIDAS = [
  'Cristalería premium',
  'Vasos desechables de acrílico',
  'Vasos desechables PU',
];

const DRINKS_BARS = ['drinks-bar', 'mocktails-bar'];

interface StepPersonalizationProps {
  personalization: PersonalizationData;
  selectedServices: string[];
  onChange: (data: PersonalizationData) => void;
}

export default function StepPersonalization({
  personalization,
  selectedServices,
  onChange,
}: StepPersonalizationProps) {
  const update = (field: keyof PersonalizationData, value: string | string[]) =>
    onChange({ ...personalization, [field]: value });

  const hasDrinksBars = selectedServices.some((id) => DRINKS_BARS.includes(id));
  const hasOtherBars = selectedServices.some((id) => !DRINKS_BARS.includes(id));

  const selectedDecoracion = personalization.decoracion[0] ?? null;
  const selectedPresentacion = personalization.presentacion[0] ?? null;

  return (
    <div>
      <div className="mb-5">
        <h3 className="text-display text-2xl text-coffee-800 mb-1">Personalización</h3>
        <p className="text-sm text-coffee-500">
          Cuéntanos sobre la estética de tu evento.
        </p>
      </div>

      <div className="max-h-[55vh] overflow-y-auto pr-1 space-y-6">

        {/* Decoración — single select, aplica a todas las barras */}
        <div>
          <p className="text-xs uppercase tracking-widest text-gold-500 mb-1">Decoración</p>
          <p className="text-xs text-coffee-400 mb-3">Elige una opción</p>
          <div className="flex flex-wrap gap-2">
            {DECORACION_OPTIONS.map((item) => (
              <button
                key={item}
                onClick={() => update('decoracion', selectedDecoracion === item ? [] : [item])}
                className={clsx(
                  'px-4 py-2 rounded-full border text-sm transition-all duration-200',
                  selectedDecoracion === item
                    ? 'bg-coffee-700 border-coffee-700 text-cream-50'
                    : 'border-coffee-300 text-coffee-600 hover:border-coffee-500'
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Presentación — condicional por tipo de barra */}
        <div>
          <p className="text-xs uppercase tracking-widest text-gold-500 mb-1">Presentación</p>

          {/* Barras normales → desechables fijo */}
          {hasOtherBars && (
            <div className="mb-3">
              {hasDrinksBars && (
                <p className="text-[11px] text-coffee-400 mb-2">Resto de barras</p>
              )}
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-cream-100 border border-cream-200 text-sm text-coffee-600">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-400 inline-block" />
                Desechables en general
              </span>
            </div>
          )}

          {/* Drinks Bar / Mocktails Bar → elegir entre 3 opciones */}
          {hasDrinksBars && (
            <div>
              {hasOtherBars && (
                <p className="text-[11px] text-coffee-400 mb-2">Drinks Bar / Mocktails Bar — elige una opción</p>
              )}
              {!hasOtherBars && (
                <p className="text-xs text-coffee-400 mb-3">Elige una opción</p>
              )}
              <div className="flex flex-wrap gap-2">
                {PRESENTACION_BEBIDAS.map((item) => (
                  <button
                    key={item}
                    onClick={() => update('presentacion', selectedPresentacion === item ? [] : [item])}
                    className={clsx(
                      'px-4 py-2 rounded-full border text-sm transition-all duration-200',
                      selectedPresentacion === item
                        ? 'bg-coffee-700 border-coffee-700 text-cream-50'
                        : 'border-coffee-300 text-coffee-600 hover:border-coffee-500'
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Colores del evento */}
        <div>
          <label className="block text-xs uppercase tracking-widest text-gold-500 mb-2">
            Colores / Paleta del evento
          </label>
          <input
            type="text"
            value={personalization.coloresEvento}
            onChange={(e) => update('coloresEvento', e.target.value)}
            placeholder="Ej: Blanco y dorado, Rosa y borgoña, Azul navy…"
            className="w-full border-b border-coffee-300 bg-transparent py-2 text-coffee-700 placeholder-coffee-300 focus:outline-none focus:border-coffee-600 text-sm transition-colors"
          />
        </div>

        {/* Notas adicionales */}
        <div>
          <label className="block text-xs uppercase tracking-widest text-gold-500 mb-2">
            Notas adicionales (opcional)
          </label>
          <textarea
            value={personalization.notas}
            onChange={(e) => update('notas', e.target.value)}
            placeholder="Cualquier detalle especial que debamos saber…"
            rows={3}
            className="w-full border border-cream-200 rounded-xl bg-cream-50 p-3 text-coffee-700 placeholder-coffee-300 focus:outline-none focus:border-coffee-400 text-sm resize-none transition-colors"
          />
        </div>
      </div>
    </div>
  );
}

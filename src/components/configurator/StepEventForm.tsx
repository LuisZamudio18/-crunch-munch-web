'use client';

import { SERVICE_MAP } from '@/data/services';
import type { EventFormData } from '@/types';

const EVENT_TYPES = [
  'Boda', 'Quinceañera', 'Baby shower', 'Gender reveal',
  'Cumpleaños', 'Corporativo', 'Graduación', 'Bautizo',
  'Comunión', 'Aniversario', 'Otro',
];

interface StepEventFormProps {
  eventForm: EventFormData;
  selectedServices: string[];
  onChange: (data: EventFormData) => void;
}

export default function StepEventForm({ eventForm, selectedServices, onChange }: StepEventFormProps) {
  const update = (field: keyof EventFormData, value: string) =>
    onChange({ ...eventForm, [field]: value });

  const inputClass =
    'w-full border-b border-coffee-300 bg-transparent py-2.5 text-coffee-700 placeholder-coffee-300 focus:outline-none focus:border-coffee-600 text-sm transition-colors';

  // Compute the highest minimum across all selected services
  const minRequired = selectedServices.reduce((max, id) => {
    const svc = SERVICE_MAP[id];
    return svc ? Math.max(max, svc.minPersonas) : max;
  }, 0);

  const personas = parseInt(eventForm.personas) || 0;
  const belowMinimum = personas > 0 && minRequired > 0 && personas < minRequired;

  // Which specific bars are below minimum
  const barrasBajoMinimo = selectedServices
    .map((id) => SERVICE_MAP[id])
    .filter((svc): svc is NonNullable<typeof svc> => !!svc && personas > 0 && personas < svc.minPersonas);

  return (
    <div>
      <div className="mb-5">
        <h3 className="text-display text-2xl text-coffee-800 mb-1">Datos del evento</h3>
        <p className="text-sm text-coffee-500">
          Esta información nos ayuda a preparar tu cotización personalizada.
        </p>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gold-500 mb-1.5">
              Nombre completo *
            </label>
            <input
              type="text"
              value={eventForm.nombre}
              onChange={(e) => update('nombre', e.target.value)}
              placeholder="Tu nombre"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gold-500 mb-1.5">
              Teléfono / WhatsApp *
            </label>
            <input
              type="tel"
              value={eventForm.telefono}
              onChange={(e) => update('telefono', e.target.value)}
              placeholder="10 dígitos"
              className={inputClass}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gold-500 mb-1.5">
              Fecha del evento *
            </label>
            <input
              type="date"
              value={eventForm.fecha}
              onChange={(e) => update('fecha', e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gold-500 mb-1.5">
              No. de personas *
            </label>
            <input
              type="number"
              value={eventForm.personas}
              onChange={(e) => update('personas', e.target.value)}
              placeholder={`Mín. ${minRequired} personas`}
              min={minRequired || 1}
              className={`${inputClass} ${belowMinimum ? 'border-red-400 focus:border-red-500' : ''}`}
              required
            />
            {/* Per-bar minimum hint when field is empty */}
            {!eventForm.personas && minRequired > 0 && (
              <p className="text-[11px] text-coffee-400 mt-1">
                Mínimo requerido: {minRequired} personas
              </p>
            )}
            {/* Warning when below minimum */}
            {belowMinimum && (
              <div className="mt-2 flex items-start gap-1.5 text-xs text-red-600">
                <span className="shrink-0">⚠️</span>
                <span>
                  El mínimo para{' '}
                  <strong>{barrasBajoMinimo.map((s) => s.name).join(', ')}</strong>{' '}
                  es de {barrasBajoMinimo.length === 1 ? `${barrasBajoMinimo[0].minPersonas}` : `${minRequired}`} personas.
                </span>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-gold-500 mb-1.5">
            Lugar del evento *
          </label>
          <input
            type="text"
            value={eventForm.lugar}
            onChange={(e) => update('lugar', e.target.value)}
            placeholder="Salón, dirección o ciudad"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-gold-500 mb-3">
            Tipo de evento *
          </label>
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => update('tipoEvento', type)}
                className={`px-3 py-1.5 rounded-full border text-sm transition-all duration-200 ${
                  eventForm.tipoEvento === type
                    ? 'bg-coffee-700 border-coffee-700 text-cream-50'
                    : 'border-coffee-300 text-coffee-600 hover:border-coffee-500'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-gold-500 mb-1.5">
            Comentarios adicionales
          </label>
          <textarea
            value={eventForm.comentarios}
            onChange={(e) => update('comentarios', e.target.value)}
            placeholder="Horario aproximado, necesidades especiales, preguntas…"
            rows={3}
            className="w-full border border-cream-200 rounded-xl bg-cream-50 p-3 text-coffee-700 placeholder-coffee-300 focus:outline-none focus:border-coffee-400 text-sm resize-none transition-colors"
          />
        </div>

        <p className="text-xs text-coffee-400 italic">
          * Al enviar recibirás respuesta con la cotización y tiempo de duración del servicio.
        </p>
      </div>
    </div>
  );
}

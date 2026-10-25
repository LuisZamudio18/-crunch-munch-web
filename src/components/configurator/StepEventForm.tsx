'use client';

import { SERVICE_MAP } from '@/data/services';
import { ESTIMATE_ENABLED, PRICING } from '@/data/pricing';
import type { EventFormData } from '@/types';
import { COMBO, guestsByBar, guestsFor, isCombo } from '@/lib/guests';
import { DiscountNudge, useEstimate } from './EstimateCard';

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
  const barrasBajoMinimo = selectedServices
    .map((id) => SERVICE_MAP[id])
    .filter((svc): svc is NonNullable<typeof svc> => !!svc && guestsFor(eventForm, svc.id) > 0 && guestsFor(eventForm, svc.id) < svc.minPersonas);
  const combo = isCombo(eventForm, selectedServices);
  const comboSum = selectedServices.reduce((sum, id) => sum + guestsFor(eventForm, id), 0);
  const belowMinimum = !combo && barrasBajoMinimo.length > 0;
  const guests = guestsByBar(eventForm, selectedServices);
  const { progress } = useEstimate(selectedServices, personas, undefined, guests, combo);
  const setBarGuests = (id: string, value: string) => {
    const personasPorBarra = { ...(eventForm.personasPorBarra ?? {}), [id]: value };
    // En la opción combinada el total del evento es la suma de las dos barras
    const total = combo ? selectedServices.reduce((sum, sid) => sum + (parseInt(personasPorBarra[sid] ?? '') || 0), 0) : null;
    onChange({ ...eventForm, personasPorBarra, ...(total !== null ? { personas: total > 0 ? String(total) : '' } : {}) });
  };
  const setCombo = (on: boolean) => onChange({ ...eventForm, combinada: on, personasPorBarra: {}, personas: '' });
  const showDiscountNudge = ESTIMATE_ENABLED && selectedServices.some((id) => PRICING.services[id]);

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
              placeholder={combo ? `Mín. ${COMBO.minTotal} entre las dos barras` : `Mín. ${minRequired} personas`}
              min={combo ? COMBO.minTotal : minRequired || 1}
              readOnly={combo}
              className={`${inputClass} ${belowMinimum ? 'border-red-400 focus:border-red-500' : ''}`}
              required
            />
            {/* Per-bar minimum hint when field is empty */}
            {!combo && !eventForm.personas && minRequired > 0 && (
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

        {selectedServices.length === 2 && (
          <label className="flex items-start gap-3 rounded-xl border border-gold-300 bg-gold-50 p-4 cursor-pointer">
            <input
              type="checkbox"
              checked={combo}
              onChange={(e) => setCombo(e.target.checked)}
              className="mt-1 h-4 w-4 accent-coffee-600"
            />
            <span className="text-sm text-coffee-700">
              <strong className="block text-coffee-800">Opción combinada para grupos pequeños</strong>
              Si son pocos invitados (por ejemplo 15 por barra), puedes juntar las dos barras: basta que sumen {COMBO.minTotal} invitados
              en total, con mínimo {COMBO.minPerBar} en cada una. Cada barra cuesta ${COMBO.extraPerPerson} más por persona.
            </span>
          </label>
        )}

        {selectedServices.length > 1 && (
          <div className="rounded-xl border border-cream-200 bg-cream-100/60 p-4">
            <p className="text-xs uppercase tracking-widest text-gold-500 mb-1">Personas por barra</p>
            <p className="text-xs text-coffee-400 mb-3">
              {combo
                ? `Escribe cuántos invitados tendrá cada barra. Suman ${comboSum} de ${COMBO.minTotal} (mínimo ${COMBO.minPerBar} por barra).`
                : 'Cada barra se calcula con su propio número de invitados. Si no cambias nada, usamos el total del evento.'}
            </p>
            <div className="space-y-3">
              {selectedServices.map((id) => {
                const svc = SERVICE_MAP[id];
                if (!svc) return null;
                const own = eventForm.personasPorBarra?.[id] ?? '';
                const effective = guestsFor(eventForm, id);
                const floor = combo ? COMBO.minPerBar : svc.minPersonas;
                const low = effective > 0 && effective < floor;
                return (
                  <div key={id}>
                    <div className="flex items-center justify-between gap-3">
                      <label htmlFor={`personas-${id}`} className="text-sm text-coffee-700">
                        {svc.emoji} {svc.name}
                      </label>
                      <input
                        id={`personas-${id}`}
                        type="number"
                        inputMode="numeric"
                        min={floor}
                        value={own}
                        onChange={(e) => setBarGuests(id, e.target.value)}
                        placeholder={combo ? `Mín. ${COMBO.minPerBar}` : eventForm.personas || `Mín. ${svc.minPersonas}`}
                        className={`w-28 border-b bg-transparent py-1.5 text-right text-sm text-coffee-700 placeholder-coffee-300 focus:outline-none transition-colors ${
                          low ? 'border-red-400 focus:border-red-500' : 'border-coffee-300 focus:border-coffee-600'
                        }`}
                      />
                    </div>
                    {low && (
                      <p className="mt-1 text-xs text-red-600">El mínimo para {svc.name} es de {floor} personas.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {showDiscountNudge && !combo && <DiscountNudge progress={progress} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
            <label className="block text-xs uppercase tracking-widest text-gold-500 mb-1.5">
              Horario del servicio *
            </label>
            <input
              type="time"
              value={eventForm.horario}
              onChange={(e) => update('horario', e.target.value)}
              className={inputClass}
              required
            />
          </div>
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
            placeholder="Necesidades especiales, preguntas…"
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

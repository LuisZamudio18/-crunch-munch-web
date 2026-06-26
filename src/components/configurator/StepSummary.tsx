'use client';

import Button from '@/components/ui/Button';
import { SERVICE_MAP } from '@/data/services';
import type { EventFormData, PersonalizationData } from '@/types';
import { buildWhatsAppMessage } from '@/lib/whatsapp';

interface StepSummaryProps {
  selectedServices: string[];
  serviceSelections: Record<string, Record<string, string[]>>;
  personalization: PersonalizationData;
  eventForm: EventFormData;
  onReset: () => void;
}

export default function StepSummary({
  selectedServices,
  serviceSelections,
  personalization,
  eventForm,
  onReset,
}: StepSummaryProps) {
  const waUrl = buildWhatsAppMessage({
    selectedServices,
    serviceSelections,
    personalization,
    eventForm,
  });

  const formatDate = (d: string) => {
    if (!d) return '—';
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  };

  return (
    <div>
      <div className="mb-5">
        <h3 className="text-display text-2xl text-coffee-800 mb-1">Resumen de tu cotización</h3>
        <p className="text-sm text-coffee-500">
          Revisa tu selección y envíanos la información para recibir tu cotización personalizada.
        </p>
      </div>

      <div className="space-y-4 mb-6">
        {/* Services */}
        <div className="bg-cream-100 rounded-xl p-4">
          <p className="text-xs uppercase tracking-widest text-gold-500 mb-3">Barras seleccionadas</p>
          {selectedServices.map((id) => {
            const svc = SERVICE_MAP[id];
            if (!svc) return null;
            const svcSelections = serviceSelections[id] || {};

            return (
              <div key={id} className="mb-3 last:mb-0">
                <p className="font-semibold text-coffee-800 text-sm">
                  {svc.emoji} {svc.name}
                </p>
                {svc.selectionGroups
                  .filter((g) => g.type !== 'fixed-display')
                  .map((g) => {
                    const sel = svcSelections[g.id] || [];
                    if (sel.length === 0) return null;
                    const counts = sel.reduce<Record<string, number>>((acc, item) => {
                      acc[item] = (acc[item] || 0) + 1;
                      return acc;
                    }, {});
                    const formatted = Object.entries(counts)
                      .map(([item, count]) => (count > 1 ? `${item} ×${count}` : item))
                      .join(', ');
                    return (
                      <p key={g.id} className="text-xs text-coffee-500 mt-0.5 ml-5">
                        <span className="font-medium text-coffee-600">{g.label}:</span> {formatted}
                      </p>
                    );
                  })}
              </div>
            );
          })}
        </div>

        {/* Personalization */}
        {(personalization.decoracion.length > 0 ||
          personalization.presentacion.length > 0 ||
          personalization.coloresEvento ||
          personalization.notas) && (
          <div className="bg-cream-100 rounded-xl p-4">
            <p className="text-xs uppercase tracking-widest text-gold-500 mb-3">Personalización</p>
            {personalization.decoracion.length > 0 && (
              <p className="text-sm text-coffee-600">
                <span className="font-medium">Decoración:</span> {personalization.decoracion.join(', ')}
              </p>
            )}
            {personalization.presentacion.length > 0 && (
              <p className="text-sm text-coffee-600">
                <span className="font-medium">Presentación:</span> {personalization.presentacion.join(', ')}
              </p>
            )}
            {personalization.coloresEvento && (
              <p className="text-sm text-coffee-600">
                <span className="font-medium">Colores:</span> {personalization.coloresEvento}
              </p>
            )}
            {personalization.notas && (
              <p className="text-sm text-coffee-600">
                <span className="font-medium">Notas:</span> {personalization.notas}
              </p>
            )}
          </div>
        )}

        {/* Event data */}
        <div className="bg-cream-100 rounded-xl p-4">
          <p className="text-xs uppercase tracking-widest text-gold-500 mb-3">Datos del evento</p>
          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-y-1 gap-x-4 text-sm text-coffee-600">
            {eventForm.nombre && <><span className="text-coffee-400">Nombre:</span><span>{eventForm.nombre}</span></>}
            {eventForm.telefono && <><span className="text-coffee-400">Teléfono:</span><span>{eventForm.telefono}</span></>}
            {eventForm.fecha && <><span className="text-coffee-400">Fecha:</span><span>{formatDate(eventForm.fecha)}</span></>}
            {eventForm.personas && <><span className="text-coffee-400">Personas:</span><span>{eventForm.personas}</span></>}
            {eventForm.lugar && <><span className="text-coffee-400 col-span-1">Lugar:</span><span className="col-span-1">{eventForm.lugar}</span></>}
            {eventForm.tipoEvento && <><span className="text-coffee-400">Tipo:</span><span>{eventForm.tipoEvento}</span></>}
          </div>
          {eventForm.comentarios && (
            <p className="text-sm text-coffee-600 mt-2">
              <span className="text-coffee-400">Comentarios:</span> {eventForm.comentarios}
            </p>
          )}
        </div>

        {/* Info note */}
        <div className="bg-gold-50 border border-gold-200 rounded-xl p-3 text-xs text-coffee-600">
          <p className="font-medium text-coffee-700 mb-1">¿Qué pasa después?</p>
          <p>Al presionar el botón te abriremos WhatsApp con toda tu información lista. Nuestro equipo te responderá con la <strong>cotización</strong> y el <strong>tiempo de duración</strong> del servicio.</p>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3">
        <a href={waUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button variant="gold" size="lg" className="w-full gap-2 justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.553 4.118 1.52 5.847L0 24l6.337-1.498A11.955 11.955 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.007-1.373l-.359-.213-3.762.988.988-3.65-.234-.376A9.818 9.818 0 0 1 2.182 12C2.182 6.578 6.578 2.182 12 2.182c5.422 0 9.818 4.396 9.818 9.818 0 5.422-4.396 9.818-9.818 9.818z"/>
            </svg>
            Solicitar Cotización por WhatsApp
          </Button>
        </a>
        <Button variant="outline" size="md" onClick={onReset}>
          Nueva cotización
        </Button>
      </div>
    </div>
  );
}

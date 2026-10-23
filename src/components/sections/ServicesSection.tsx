'use client';

import { useState } from 'react';
import ServiceCard from '@/components/catalog/ServiceCard';
import ServiceDetailModal from '@/components/catalog/ServiceDetailModal';
import Button from '@/components/ui/Button';
import { SERVICES, SERVICE_MAP } from '@/data/services';
import type { ServiceCategory } from '@/types';

const FILTERS: { label: string; value: 'all' | ServiceCategory }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Bebidas', value: 'bebidas' },
  { label: 'Dulce', value: 'dulce' },
  { label: 'Salado', value: 'salado' },
  { label: 'Brunch', value: 'brunch' },
];

interface ServicesSectionProps {
  onOpenConfigurator: () => void;
  onSelectService: (id: string, selections?: Record<string, string[]>, presentation?: string | null) => void;
  selectedServices: string[];
  serviceSelections: Record<string, Record<string, string[]>>;
  /** Drinks presentation already chosen in the quote, if any. */
  presentation: string | null;
}

export default function ServicesSection({ onOpenConfigurator, onSelectService, selectedServices, serviceSelections, presentation }: ServicesSectionProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | ServiceCategory>('all');
  const [detailId, setDetailId] = useState<string | null>(null);

  const detailService = detailId ? SERVICE_MAP[detailId] : null;

  const filtered = activeFilter === 'all'
    ? SERVICES
    : SERVICES.filter((s) => s.category === activeFilter);

  return (
    <section id="servicios" className="bg-cream-50 section-padding py-14 md:py-16">
      <div className="container-max">
        {/* Header + filters, side by side on desktop so the section opens denser */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
          <div className="text-center lg:text-left">
            <p className="text-xs uppercase tracking-widest text-gold-500 mb-3">Catálogo completo</p>
            <h2 className="text-display text-4xl md:text-5xl text-coffee-800">
              Nuestras <em className="gold-text">barras</em>
            </h2>
          </div>

          <div className="flex flex-wrap justify-center lg:justify-end gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`px-4 py-2 rounded-full text-xs tracking-wide transition-all duration-200 font-sans ${
                  activeFilter === f.value
                    ? 'bg-coffee-800 text-cream-50 shadow-md'
                    : 'bg-cream-100 text-coffee-600 hover:bg-cream-200 border border-cream-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Horizontal, scroll-snapping row — keeps the section a fixed height
            regardless of how many of the 24 bars are in view, instead of
            growing into several rows the visitor has to scroll past. */}
        <div className="flex gap-5 overflow-x-auto pb-3 -mx-5 px-5 md:-mx-10 md:px-10 lg:-mx-20 lg:px-20 snap-x snap-mandatory scroll-smooth">
          {filtered.map((service) => (
            <div key={service.id} className="flex-none w-[240px] snap-start">
              <ServiceCard
                service={service}
                selected={selectedServices.includes(service.id)}
                onSelect={() => setDetailId(service.id)}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-coffee-400 mt-3">
          Desliza para ver las {filtered.length} barras {activeFilter !== 'all' ? 'de esta categoría' : 'del catálogo'} →
        </p>

        {/* Service detail modal */}
        <ServiceDetailModal
          service={detailService}
          isSelected={detailId ? selectedServices.includes(detailId) : false}
          initialSelections={detailId ? (serviceSelections[detailId] ?? {}) : {}}
          initialPresentation={presentation}
          onClose={() => setDetailId(null)}
          onSelect={(selections, chosenPresentation) => {
            if (detailId) {
              onSelectService(detailId, selections, chosenPresentation);
              setDetailId(null);
            }
          }}
        />

        {/* CTA */}
        <div className="mt-10 text-center">
          <p className="text-coffee-500 mb-5 text-sm">
            ¿Ya sabes qué barras quieres? Arma tu cotización personalizada.
          </p>
          <Button variant="gold" size="lg" onClick={onOpenConfigurator}>
            Armar mi cotización ✦
          </Button>
        </div>
      </div>
    </section>
  );
}

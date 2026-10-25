'use client';

import { useState } from 'react';
import ServiceCard from '@/components/catalog/ServiceCard';
import ServiceDetailModal from '@/components/catalog/ServiceDetailModal';
import Button from '@/components/ui/Button';
import Sticker from '@/components/ui/Sticker';
import { SERVICES, SERVICE_MAP } from '@/data/services';
import type { ServiceCategory } from '@/types';

const FILTERS: { label: string; value: 'all' | ServiceCategory; tint: string }[] = [
  { label: 'Todas', value: 'all', tint: 'bg-coffee-600 text-cream-50' },
  { label: 'Bebidas', value: 'bebidas', tint: 'bg-rosa text-coffee-800' },
  { label: 'Dulce', value: 'dulce', tint: 'bg-lila text-coffee-800' },
  { label: 'Salado', value: 'salado', tint: 'bg-naranja text-coffee-800' },
  { label: 'Brunch', value: 'brunch', tint: 'bg-amarillo text-coffee-800' },
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
    <section id="servicios" className="relative overflow-x-clip bg-cream-200 section-padding py-16 md:py-24">
      <Sticker id="menu-drinks" size={68} mdSize={104} pos={{ top: '-44px', left: '10px' }} mdPos={{ top: '4%', right: '5%', left: 'auto' }} rotate={-7} motion="sway" duration={8} speed={0.035} />
      <Sticker id="popotes" size={50} mdSize={70} hideOnMobile pos={{ top: '12px', right: '14px' }} mdPos={{ top: '9%', right: '16%' }} rotate={-9} motion="float" duration={9} delay={1.4} speed={0.035} />
      <Sticker id="taza-latte" size={92} mdSize={120} pos={{ bottom: '-32px', right: '10px' }} mdPos={{ bottom: '-40px', right: '8%' }} rotate={-8} motion="bounce" duration={7} delay={0.4} speed={0.035} />
      <Sticker id="cheesecake" size={68} mdSize={90} pos={{ bottom: '-22px', left: '8px' }} mdPos={{ bottom: '-30px', left: '9%' }} rotate={7} motion="float" duration={8} delay={1.1} speed={0.035} />

      <div className="container-max relative">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-10">
          <div>
            <h2 className="font-bodoni text-5xl md:text-6xl lg:text-7xl leading-[0.98] text-coffee-600">
              Nuestras <em className="font-serif italic font-medium text-gold-500">barras</em>
            </h2>
            <p className="font-sans text-base leading-relaxed text-coffee-600 mt-5 max-w-lg">
              Veinticuatro conceptos para armar el evento a tu medida. Elige una para ver qué incluye y cómo se personaliza.
            </p>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar barras por tipo">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                aria-pressed={activeFilter === f.value}
                className={`px-5 py-2.5 rounded-full font-sans text-[13px] uppercase tracking-[0.16em] transition-all duration-200 ${
                  activeFilter === f.value
                    ? `${f.tint} shadow-md`
                    : 'bg-white text-coffee-600 hover:bg-cream-50 border border-gold-400/40'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fila con desplazamiento horizontal: la sección mantiene su altura sin importar cuántas barras haya. */}
        <div className="flex gap-6 overflow-x-auto pb-6 pt-1 -mx-5 px-5 md:-mx-10 md:px-10 lg:-mx-20 lg:px-20 snap-x snap-mandatory scroll-smooth">
          {filtered.map((service) => (
            <div key={service.id} className="flex-none w-[260px] md:w-[280px] snap-start">
              <ServiceCard
                service={service}
                selected={selectedServices.includes(service.id)}
                onSelect={() => setDetailId(service.id)}
              />
            </div>
          ))}
        </div>
        <p className="font-sans text-[13px] uppercase tracking-[0.16em] text-coffee-500 mt-2">
          Desliza para ver las {filtered.length} barras {activeFilter !== 'all' ? 'de esta categoría' : 'del catálogo'} →
        </p>

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

        <div className="mt-14 flex flex-col items-center text-center">
          <p className="font-serif italic text-3xl md:text-4xl text-coffee-600 mb-6">¿Ya sabes qué barras quieres?</p>
          <Button variant="dark" size="lg" onClick={onOpenConfigurator}>
            Armar mi cotización
          </Button>
        </div>
      </div>
    </section>
  );
}

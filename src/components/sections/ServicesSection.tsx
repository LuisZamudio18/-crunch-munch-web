'use client';

import { useState } from 'react';
import ServiceCard from '@/components/catalog/ServiceCard';
import ServiceDetailModal from '@/components/catalog/ServiceDetailModal';
import Button from '@/components/ui/Button';
import { SERVICES, SERVICE_MAP } from '@/data/services';
import type { ServiceCategory } from '@/types';

const FILTERS: { label: string; value: 'all' | ServiceCategory }[] = [
  { label: 'Todos', value: 'all' },
  { label: '☕ Bebidas', value: 'bebidas' },
  { label: '🍩 Dulce', value: 'dulce' },
  { label: '🌽 Salado', value: 'salado' },
  { label: '🍳 Brunch', value: 'brunch' },
];

interface ServicesSectionProps {
  onOpenConfigurator: () => void;
  onSelectService: (id: string, selections?: Record<string, string[]>) => void;
  selectedServices: string[];
  serviceSelections: Record<string, Record<string, string[]>>;
}

export default function ServicesSection({ onOpenConfigurator, onSelectService, selectedServices, serviceSelections }: ServicesSectionProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | ServiceCategory>('all');
  const [detailId, setDetailId] = useState<string | null>(null);

  const detailService = detailId ? SERVICE_MAP[detailId] : null;

  const filtered = activeFilter === 'all'
    ? SERVICES
    : SERVICES.filter((s) => s.category === activeFilter);

  return (
    <section id="servicios" className="bg-cream-50 section-padding">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-gold-500 mb-3">Catálogo completo</p>
          <h2 className="text-display text-4xl md:text-5xl text-coffee-800 mb-4">
            Nuestras <em className="gold-text">barras</em>
          </h2>
          <p className="text-coffee-500 max-w-xl mx-auto text-sm leading-relaxed">
            24 servicios premium para personalizar tu evento. Elige las barras que mejor complementen tu celebración.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`px-4 py-2 rounded-full text-sm transition-all duration-200 font-sans ${
                activeFilter === f.value
                  ? 'bg-coffee-700 text-cream-50 shadow-md'
                  : 'bg-cream-100 text-coffee-600 hover:bg-cream-200 border border-cream-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              selected={selectedServices.includes(service.id)}
              onSelect={() => setDetailId(service.id)}
            />
          ))}
        </div>

        {/* Service detail modal */}
        <ServiceDetailModal
          service={detailService}
          isSelected={detailId ? selectedServices.includes(detailId) : false}
          initialSelections={detailId ? (serviceSelections[detailId] ?? {}) : {}}
          onClose={() => setDetailId(null)}
          onSelect={(selections) => {
            if (detailId) {
              onSelectService(detailId, selections);
              setDetailId(null);
            }
          }}
        />

        {/* CTA */}
        <div className="mt-14 text-center">
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

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { clsx } from 'clsx';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';
import type { Service, ServiceCategory, SelectionGroup } from '@/types';

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  bebidas: 'Bebidas',
  dulce: 'Dulce',
  salado: 'Salado',
  brunch: 'Brunch',
};

const CATEGORY_COLORS: Record<ServiceCategory, string> = {
  bebidas: 'bg-blue-100 text-blue-700',
  dulce: 'bg-pink-100 text-pink-700',
  salado: 'bg-orange-100 text-orange-700',
  brunch: 'bg-green-100 text-green-700',
};

interface ServiceDetailModalProps {
  service: Service | null;
  isSelected: boolean;
  initialSelections: Record<string, string[]>;
  onClose: () => void;
  onSelect: (selections: Record<string, string[]>) => void;
}

function InteractiveGroup({
  group,
  selections,
  onChange,
}: {
  group: SelectionGroup;
  selections: string[];
  onChange: (updated: string[]) => void;
}) {
  const total = selections.length;
  const max = group.totalMax ?? Infinity;
  const totalReached = total >= max;

  function add(item: string) {
    if (totalReached) return;
    onChange([...selections, item]);
  }

  function remove(item: string) {
    const idx = [...selections].lastIndexOf(item);
    if (idx > -1) {
      const next = [...selections];
      next.splice(idx, 1);
      onChange(next);
    }
  }

  function chooseOne(item: string) {
    onChange(selections[0] === item ? [] : [item]);
  }

  // choose-1
  if (group.type === 'choose-1') {
    return (
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-semibold text-coffee-700 text-sm">{group.label}</h4>
          <span className="text-xs text-coffee-400 italic">{group.instruction}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {group.options?.map((item) => (
            <button
              key={item}
              onClick={() => chooseOne(item)}
              className={clsx(
                'px-4 py-2 rounded-full border text-sm transition-all duration-200',
                selections[0] === item
                  ? 'bg-coffee-700 border-coffee-700 text-cream-50'
                  : 'border-coffee-300 text-coffee-600 hover:border-coffee-500'
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // choose-n flat
  if (group.options && !group.categories) {
    return (
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-semibold text-coffee-700 text-sm">{group.label}</h4>
          <span className={clsx('text-xs font-mono', totalReached ? 'text-gold-500 font-bold' : 'text-coffee-400')}>
            {total}{max !== Infinity ? `/${max}` : ''}
          </span>
        </div>
        <p className="text-xs text-coffee-400 mb-2">{group.instruction}</p>
        <div className="flex flex-wrap gap-2">
          {group.options.map((item) => {
            const count = selections.filter((s) => s === item).length;
            return (
              <Chip
                key={item}
                label={item}
                count={count}
                disabled={totalReached && count === 0}
                maxReached={totalReached}
                onAdd={() => add(item)}
                onRemove={() => remove(item)}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // choose-n with categories
  if (group.categories) {
    const catCount = (catOptions: string[]) =>
      catOptions.reduce((acc, opt) => acc + selections.filter((s) => s === opt).length, 0);

    return (
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-semibold text-coffee-700 text-sm">{group.label}</h4>
          <span className={clsx('text-xs font-mono', totalReached ? 'text-gold-500 font-bold' : 'text-coffee-400')}>
            {total}{max !== Infinity ? `/${max}` : ''}
          </span>
        </div>
        <p className="text-xs text-coffee-400 mb-3">{group.instruction}</p>
        {group.categories.map((cat) => {
          const catTotal = catCount(cat.options);
          const catMax = cat.maxPerCategory ?? Infinity;
          const catReached = catTotal >= catMax;
          return (
            <div key={cat.name} className="mb-3">
              <p className="text-[10px] uppercase tracking-wider text-coffee-400 mb-2 flex items-center gap-2">
                {cat.name}
                {catMax !== Infinity && (
                  <span className={clsx('font-mono normal-case tracking-normal', catReached ? 'text-gold-500 font-bold' : '')}>
                    ({catTotal}/{catMax})
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {cat.options.map((item) => {
                  const count = selections.filter((s) => s === item).length;
                  const addBlocked = totalReached || catReached;
                  return (
                    <Chip
                      key={item}
                      label={item}
                      count={count}
                      disabled={addBlocked && count === 0}
                      maxReached={addBlocked}
                      onAdd={() => add(item)}
                      onRemove={() => remove(item)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
}

export default function ServiceDetailModal({
  service,
  isSelected,
  initialSelections,
  onClose,
  onSelect,
}: ServiceDetailModalProps) {
  const [localSelections, setLocalSelections] = useState<Record<string, string[]>>({});

  // Sync when modal opens for a new service
  useEffect(() => {
    if (service) {
      setLocalSelections(initialSelections ?? {});
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [service?.id]);

  if (!service) return null;

  const hasInteractiveGroups = service.selectionGroups.some((g) => g.type !== 'fixed-display');

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-coffee-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full sm:max-w-lg bg-cream-50 rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 max-h-[92vh] flex flex-col">

        {/* Header with photo */}
        <div className="relative rounded-t-3xl sm:rounded-t-3xl overflow-hidden shrink-0 min-h-[180px] flex flex-col justify-end">
          {service.image ? (
            <Image
              src={service.image}
              alt={service.name}
              fill
              className="object-cover pointer-events-none"
              sizes="(max-width: 640px) 100vw, 512px"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-coffee-700 to-coffee-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-coffee-900/85 via-coffee-900/25 to-transparent pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-cream-50 text-lg transition-colors z-20"
            aria-label="Cerrar"
          >
            ×
          </button>

          <div className="relative z-10 px-6 pt-14 pb-6">
            {!service.image && <div className="text-5xl mb-3">{service.emoji}</div>}
            <div className="flex items-center gap-2 mb-2">
              <span className={clsx('text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-medium', CATEGORY_COLORS[service.category])}>
                {CATEGORY_LABELS[service.category]}
              </span>
              {isSelected && (
                <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-medium bg-gold-400/90 text-coffee-900">
                  ✓ En tu cotización
                </span>
              )}
            </div>
            <h2 className="text-display text-3xl text-cream-50 leading-tight mb-1">{service.name}</h2>
            <p className="text-coffee-300 text-sm leading-relaxed">{service.description}</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-2">
          {hasInteractiveGroups && (
            <p className="text-xs text-coffee-400 italic mb-3">
              Puedes pre-seleccionar tus opciones antes de añadir a la cotización.
            </p>
          )}

          {service.selectionGroups.map((group) => {
            // Fixed display — read only
            if (group.type === 'fixed-display') {
              return (
                <div key={group.id} className="mb-5">
                  <h3 className="font-semibold text-coffee-800 text-sm mb-3">{group.label}</h3>
                  {group.fixedItems?.map((fi) => (
                    <div key={fi.label} className="mb-3">
                      <p className="text-[10px] uppercase tracking-widest text-gold-500 mb-1.5">{fi.label}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {fi.items.map((item) => (
                          <span key={item} className="bg-cream-100 border border-cream-200 rounded-full px-3 py-1 text-xs text-coffee-600">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            }

            // Interactive groups
            return (
              <InteractiveGroup
                key={group.id}
                group={group}
                selections={localSelections[group.id] ?? []}
                onChange={(updated) => setLocalSelections((prev) => ({ ...prev, [group.id]: updated }))}
              />
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="px-4 sm:px-6 pb-6 pt-3 border-t border-cream-200 shrink-0 flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
          <Button variant="ghost" size="md" onClick={onClose} className="text-coffee-600 sm:flex-none">
            Seguir viendo
          </Button>
          <Button
            variant="gold"
            size="md"
            className="flex-1"
            onClick={() => onSelect(localSelections)}
          >
            {isSelected ? '→ Ir a mi cotización' : '✦ Añadir a mi cotización'}
          </Button>
        </div>
      </div>
    </div>
  );
}

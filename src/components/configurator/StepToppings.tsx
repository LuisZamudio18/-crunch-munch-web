'use client';

import Chip from '@/components/ui/Chip';
import { SERVICE_MAP } from '@/data/services';
import type { SelectionGroup } from '@/types';
import { clsx } from 'clsx';
import { useState } from 'react';

interface StepToppingsProps {
  selectedServices: string[];
  serviceSelections: Record<string, Record<string, string[]>>;
  onAdd: (serviceId: string, groupId: string, item: string) => void;
  onRemove: (serviceId: string, groupId: string, item: string) => void;
  onChooseOne: (serviceId: string, groupId: string, item: string) => void;
}

function GroupPanel({
  serviceId,
  group,
  selections,
  onAdd,
  onRemove,
  onChooseOne,
}: {
  serviceId: string;
  group: SelectionGroup;
  selections: string[];
  onAdd: (item: string) => void;
  onRemove: (item: string) => void;
  onChooseOne: (item: string) => void;
}) {
  const total = selections.length;
  const max = group.totalMax ?? Infinity;
  const totalReached = total >= max;

  const countFor = (item: string) => selections.filter((s) => s === item).length;

  const catCount = (catName: string, options: string[]) =>
    options.reduce((acc, o) => acc + selections.filter((s) => s === o).length, 0);

  if (group.type === 'fixed-display') {
    return (
      <div className="mb-5">
        <h4 className="font-semibold text-coffee-700 text-sm mb-2">{group.label}</h4>
        {group.fixedItems?.map((fi) => (
          <div key={fi.label} className="mb-3">
            <p className="text-xs uppercase tracking-wider text-coffee-400 mb-1.5">{fi.label}</p>
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

  if (group.type === 'choose-1') {
    const selected = selections[0] ?? null;
    return (
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-coffee-700 text-sm">{group.label}</h4>
          <span className="text-xs text-coffee-400">{group.instruction}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {group.options?.map((item) => (
            <button
              key={item}
              onClick={() => onChooseOne(item)}
              className={clsx(
                'px-4 py-2 rounded-full border text-sm transition-all duration-200',
                selected === item
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

  // choose-n with flat options
  if (group.options && !group.categories) {
    return (
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-coffee-700 text-sm">{group.label}</h4>
          <span className={clsx('text-xs font-mono', totalReached ? 'text-gold-500 font-bold' : 'text-coffee-400')}>
            {total}{max !== Infinity ? `/${max}` : ''}
          </span>
        </div>
        <p className="text-xs text-coffee-400 mb-3">{group.instruction}</p>
        <div className="flex flex-wrap gap-2">
          {group.options.map((item) => {
            const count = countFor(item);
            return (
              <Chip
                key={item}
                label={item}
                count={count}
                disabled={totalReached && count === 0}
                maxReached={totalReached}
                onAdd={() => onAdd(item)}
                onRemove={() => onRemove(item)}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // choose-n with categories
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-coffee-700 text-sm">{group.label}</h4>
        <span className={clsx('text-xs font-mono', totalReached ? 'text-gold-500 font-bold' : 'text-coffee-400')}>
          {total}{max !== Infinity ? `/${max}` : ''}
        </span>
      </div>
      <p className="text-xs text-coffee-400 mb-3">{group.instruction}</p>
      {group.categories?.map((cat) => {
        const catTotal = catCount(cat.name, cat.options);
        const catMax = cat.maxPerCategory ?? Infinity;
        const catReached = catTotal >= catMax;
        return (
          <div key={cat.name} className="mb-4">
            <p className="text-xs uppercase tracking-wider text-coffee-400 mb-2 flex items-center gap-2">
              {cat.name}
              {catMax !== Infinity && (
                <span className={clsx('font-mono', catReached ? 'text-gold-500 font-bold' : '')}>
                  ({catTotal}/{catMax})
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {cat.options.map((item) => {
                const count = countFor(item);
                const addBlocked = totalReached || catReached;
                return (
                  <Chip
                    key={item}
                    label={item}
                    count={count}
                    disabled={addBlocked && count === 0}
                    maxReached={addBlocked}
                    onAdd={() => onAdd(item)}
                    onRemove={() => onRemove(item)}
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

export default function StepToppings({
  selectedServices,
  serviceSelections,
  onAdd,
  onRemove,
  onChooseOne,
}: StepToppingsProps) {
  const [activeServiceIdx, setActiveServiceIdx] = useState(0);

  if (selectedServices.length === 0) {
    return (
      <div className="text-center py-10 text-coffee-400">
        <p>No seleccionaste ninguna barra. Regresa al paso anterior.</p>
      </div>
    );
  }

  const activeId = selectedServices[activeServiceIdx];
  const service = SERVICE_MAP[activeId];
  const svcSelections = serviceSelections[activeId] || {};

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-display text-2xl text-coffee-800 mb-1">Personaliza tus barras</h3>
        <p className="text-sm text-coffee-500">Configura las opciones de cada barra seleccionada.</p>
      </div>

      {/* Service tabs */}
      {selectedServices.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-5">
          {selectedServices.map((id, idx) => {
            const svc = SERVICE_MAP[id];
            const interactiveGroups = svc?.selectionGroups.filter((g) => g.type !== 'fixed-display') ?? [];
            const svcSel = serviceSelections[id] ?? {};
            const incomplete = interactiveGroups.length > 0 &&
              !interactiveGroups.every((g) => (svcSel[g.id] ?? []).length > 0);
            return (
              <button
                key={id}
                onClick={() => setActiveServiceIdx(idx)}
                className={clsx(
                  'relative px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                  idx === activeServiceIdx
                    ? 'bg-coffee-700 text-cream-50 border-coffee-700'
                    : 'border-cream-300 text-coffee-600 hover:border-coffee-500'
                )}
              >
                {svc?.emoji} {svc?.shortName}
                {incomplete && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Active service config */}
      {service && (
        <div className="max-h-[55vh] overflow-y-auto pr-1">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-cream-200">
            <span className="text-2xl">{service.emoji}</span>
            <h4 className="text-display text-xl text-coffee-700">{service.name}</h4>
          </div>

          {service.selectionGroups.map((group) => (
            <GroupPanel
              key={group.id}
              serviceId={activeId}
              group={group}
              selections={svcSelections[group.id] || []}
              onAdd={(item) => onAdd(activeId, group.id, item)}
              onRemove={(item) => onRemove(activeId, group.id, item)}
              onChooseOne={(item) => onChooseOne(activeId, group.id, item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

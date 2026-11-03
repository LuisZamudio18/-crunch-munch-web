'use client';

import { useEffect, useState } from 'react';
import HomePage from '@/components/HomePage';
import { EditProvider } from '@/components/editor/EditContext';
import { applyDraftCatalog, looksLikeCatalog } from '@/lib/catalogRuntime';

/**
 * The page inside the agenda's editor (the agenda shows it in a frame). It listens for the draft the agenda sends and shows
 * the page with that draft, as a visitor would see it. While "touch to edit" is on, the parts that come from her catalog get
 * an outline and a label when pointed at, and touching one tells the agenda which one (nothing is saved here).
 * It only trusts the agenda: a message from any other address is ignored, and when the page is opened on its own (not inside
 * the agenda) it simply looks like the normal page.
 */

const AGENDA_URL = process.env.NEXT_PUBLIC_AGENDA_URL || 'https://crunch-munch-agenda.vercel.app';

function allowedParent(origin: string): boolean {
  if (origin === new URL(AGENDA_URL).origin) return true;
  // Working on this machine
  return typeof location !== 'undefined' && location.hostname === 'localhost' && /^http:\/\/localhost:\d+$/.test(origin);
}

const LABELS: Record<string, string> = { bar: 'Editar esta barra', group: 'Editar estas opciones', price: 'Editar el precio', faq: 'Editar esta pregunta', rules: 'Editar descuentos y avisos' };
const labelFor = (target: string) => LABELS[target.split(':')[0]] ?? 'Editar';
const findEditable = (node: EventTarget | null) => (node instanceof Element ? node.closest<HTMLElement>('[data-edit]') : null);

export default function EditorBridge() {
  const [version, setVersion] = useState(0);
  const [embedded, setEmbedded] = useState(false);
  const [editing, setEditing] = useState(true);

  useEffect(() => {
    let parentOrigin = '';
    try {
      parentOrigin = document.referrer ? new URL(document.referrer).origin : '';
    } catch {
      /* not embedded by anyone we know */
    }
    if (window.parent === window || !allowedParent(parentOrigin)) return;
    setEmbedded(true);

    const onMessage = (e: MessageEvent) => {
      if (e.origin !== parentOrigin || e.source !== window.parent) return;
      const msg = e.data as { source?: string; type?: string; doc?: unknown; editing?: boolean };
      if (msg?.source !== 'cm-agenda') return;
      if (msg.type === 'mode') {
        setEditing(msg.editing !== false);
        return;
      }
      if (msg.type !== 'draft') return;
      if (!looksLikeCatalog(msg.doc)) {
        window.parent.postMessage({ source: 'cm-editor', type: 'applied', ok: false }, parentOrigin);
        return;
      }
      applyDraftCatalog(msg.doc);
      setVersion((v) => v + 1);
      window.parent.postMessage({ source: 'cm-editor', type: 'applied', ok: true }, parentOrigin);
    };
    window.addEventListener('message', onMessage);
    window.parent.postMessage({ source: 'cm-editor', type: 'ready' }, parentOrigin);

    // Touching a marked part (while editing) tells the agenda which one, instead of doing what it normally does
    const onClick = (e: MouseEvent) => {
      const el = findEditable(e.target);
      if (!el || !document.documentElement.hasAttribute('data-editing')) return;
      e.preventDefault();
      e.stopPropagation();
      window.parent.postMessage({ source: 'cm-editor', type: 'select', target: el.dataset.edit }, parentOrigin);
    };
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('message', onMessage);
      document.removeEventListener('click', onClick, true);
    };
  }, []);

  // The outline and the label that follows the part she points at
  useEffect(() => {
    if (!embedded) return;
    const root = document.documentElement;
    if (!editing) {
      root.removeAttribute('data-editing');
      return;
    }
    root.setAttribute('data-editing', '');
    const style = document.createElement('style');
    style.textContent = '[data-editing] [data-edit]{cursor:pointer}[data-editing] [data-edit]:hover{outline:2px dashed #C49A2E;outline-offset:3px;border-radius:12px}';
    document.head.appendChild(style);
    const label = document.createElement('div');
    label.style.cssText = 'position:fixed;z-index:2147483647;display:none;pointer-events:none;background:#1C1008;color:#FEFDF9;font:600 12px/1 system-ui,sans-serif;padding:7px 10px;border-radius:999px;box-shadow:0 4px 14px rgba(0,0,0,.3)';
    document.body.appendChild(label);
    const over = (e: MouseEvent) => {
      const el = findEditable(e.target);
      if (!el) {
        label.style.display = 'none';
        return;
      }
      const r = el.getBoundingClientRect();
      label.textContent = `✎ ${labelFor(el.dataset.edit ?? '')}`;
      label.style.display = 'block';
      label.style.left = `${Math.max(4, Math.min(r.right - 150, window.innerWidth - 190))}px`;
      label.style.top = `${Math.max(4, r.top - 14)}px`;
    };
    const hide = () => (label.style.display = 'none');
    document.addEventListener('mouseover', over);
    document.addEventListener('scroll', hide, true);
    return () => {
      root.removeAttribute('data-editing');
      document.removeEventListener('mouseover', over);
      document.removeEventListener('scroll', hide, true);
      style.remove();
      label.remove();
    };
  }, [embedded, editing]);

  return (
    <EditProvider value={embedded}>
      <HomePage catalogVersion={version} />
    </EditProvider>
  );
}

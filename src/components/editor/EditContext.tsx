'use client';

import { createContext, useContext, type ReactNode } from 'react';

/**
 * In the editor preview (inside the agenda) the parts of the page that come from her catalog are marked, so she can touch one
 * and edit it. On the public page the context is off and nothing is added to the page.
 *
 * Targets: `bar:<id>`, `group:<barId>:<groupId>`, `price:<barId>`, `faq:<index>`, `rules`.
 */
const EditContext = createContext(false);
export const EditProvider = EditContext.Provider;

/** Attributes to spread on an element that can be edited ({} outside the editor). */
export function useEditAttr() {
  const on = useContext(EditContext);
  return (target: string): { 'data-edit'?: string } => (on ? { 'data-edit': target } : {});
}

/** Wraps a block that can be edited; outside the editor it renders the block as it is, with no wrapper. */
export function Editable({ target, children }: { target: string; children: ReactNode }) {
  const on = useContext(EditContext);
  return on ? <div data-edit={target}>{children}</div> : <>{children}</>;
}

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// The page the agenda shows inside its website editor: it is not linked anywhere and search engines must not index it
export const metadata: Metadata = { title: 'Editor', robots: { index: false, follow: false } };

export default function EditorLayout({ children }: { children: ReactNode }) {
  return children;
}

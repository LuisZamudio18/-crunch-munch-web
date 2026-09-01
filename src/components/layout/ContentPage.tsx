import StaticHeader from './StaticHeader';
import Footer from './Footer';
import type { PageContent } from '@/lib/pageContent';

export default function ContentPage({ content }: { content: PageContent }) {
  return (
    <>
      <StaticHeader />
      <main className="bg-cream-gradient min-h-[60vh]">
        <div className="container-max section-padding max-w-3xl">
          <p className="text-xs uppercase tracking-widest text-gold-500 mb-4">Crunch &amp; Munch</p>
          <h1 className="text-display text-4xl md:text-5xl text-coffee-800 leading-tight mb-6">
            {content.title}
          </h1>
          <p className="text-coffee-500 leading-relaxed mb-10 text-lg">{content.intro}</p>

          <div className="space-y-10">
            {content.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-sans font-semibold text-coffee-800 text-xl mb-3">
                  {section.heading}
                </h2>
                {section.paragraphs.map((p, i) => (
                  <p key={i} className="text-coffee-500 leading-relaxed mb-3">
                    {p}
                  </p>
                ))}
                {section.list && (
                  <ul className="space-y-2 list-disc list-inside text-coffee-500 leading-relaxed">
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

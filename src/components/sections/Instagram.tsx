import InstagramEmbedCard from './InstagramEmbedCard';
import { INSTAGRAM_POSTS } from '@/data/instagramPosts';
import { CONTACT } from '@/lib/siteConfig';

export default function Instagram() {
  const hasPosts = INSTAGRAM_POSTS.length > 0;

  return (
    <section id="instagram" className="bg-white section-padding py-16 md:py-24">
      <div className="container-max">
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <h2 className="font-serif italic text-5xl md:text-6xl leading-[1.02] text-coffee-600 mb-5">
            Así se ven nuestras barras <span className="text-gold-500">en vivo</span>
          </h2>
          <p className="font-sans text-base leading-relaxed text-coffee-600">
            Publicaciones reales de nuestro Instagram: lo que ves aquí es lo que pasa en cada evento.
          </p>
        </div>

        {hasPosts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {INSTAGRAM_POSTS.map((permalink) => (
              <InstagramEmbedCard key={permalink} permalink={permalink} />
            ))}
          </div>
        ) : (
          <p className="text-center font-sans text-coffee-500 text-sm mb-2">
            Muy pronto vas a ver aquí publicaciones reales. Visítanos directo en el perfil mientras tanto.
          </p>
        )}

        <div className="mt-10 text-center">
          <a
            href={CONTACT.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center font-sans font-medium uppercase tracking-[0.18em] text-[13px] px-8 py-4 rounded-full border border-coffee-600 text-coffee-600 hover:bg-coffee-600 hover:text-cream-50 transition-all duration-300"
          >
            Ver perfil
          </a>
        </div>
      </div>
    </section>
  );
}

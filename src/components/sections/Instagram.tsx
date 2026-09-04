import InstagramEmbedCard from './InstagramEmbedCard';
import { INSTAGRAM_POSTS } from '@/data/instagramPosts';
import { CONTACT } from '@/lib/siteConfig';

export default function Instagram() {
  const hasPosts = INSTAGRAM_POSTS.length > 0;

  return (
    <section id="instagram" className="bg-cream-100 section-padding">
      <div className="container-max">
        <div className="text-center mb-10 max-w-xl mx-auto">
          <p className="flex items-center justify-center gap-2 text-coffee-500 text-sm font-sans mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
            {CONTACT.instagramHandle}
          </p>
          <h2 className="text-display text-4xl md:text-5xl text-coffee-800 mb-4">
            Así se ven nuestras barras <em className="gold-text">en vivo</em>
          </h2>
          <p className="text-coffee-500 text-sm leading-relaxed">
            Publicaciones reales de nuestro Instagram — lo que ves aquí es lo que pasa en cada evento.
          </p>
        </div>

        {hasPosts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {INSTAGRAM_POSTS.map((permalink) => (
              <InstagramEmbedCard key={permalink} permalink={permalink} />
            ))}
          </div>
        ) : (
          <p className="text-center text-coffee-400 text-sm mb-2">
            Muy pronto vas a ver aquí publicaciones reales — visítanos directo en el perfil mientras tanto.
          </p>
        )}

        <div className="mt-10 text-center">
          <a
            href={CONTACT.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center font-sans font-medium tracking-wider text-sm px-6 py-3 rounded-full border border-coffee-400 text-coffee-600 hover:bg-coffee-50 hover:border-coffee-600 transition-all duration-300"
          >
            Ver perfil
          </a>
        </div>
      </div>
    </section>
  );
}

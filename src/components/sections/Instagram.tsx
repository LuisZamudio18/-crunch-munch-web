import InstagramEmbedCard from './InstagramEmbedCard';
import { INSTAGRAM_POSTS } from '@/data/instagramPosts';
import { CONTACT } from '@/lib/siteConfig';

import Sticker from '@/components/ui/Sticker';

export default function Instagram() {
  const hasPosts = INSTAGRAM_POSTS.length > 0;

  return (
    <section id="instagram" className="overflow-x-clip relative bg-white section-padding py-16 md:py-24">
      <Sticker id="pastel-frutos-rojos" size={80} mdSize={110} pos={{ top: '-34px', left: '12px' }} mdPos={{ top: '-40px', left: '8%' }} rotate={-8} motion="sway" duration={8} speed={0.035} />
      <Sticker id="frascos-matcha" size={84} mdSize={110} pos={{ bottom: '-30px', right: '14px' }} mdPos={{ bottom: '-40px', right: '7%' }} rotate={6} motion="bounce" duration={7} delay={0.8} speed={0.035} />
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
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-5 px-5 sm:mx-auto sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-5 sm:overflow-visible max-w-6xl">
            {INSTAGRAM_POSTS.map((permalink) => (
              <div key={permalink} className="flex-none w-[82%] snap-center sm:w-auto"><InstagramEmbedCard permalink={permalink} /></div>
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

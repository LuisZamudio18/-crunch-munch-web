import Link from 'next/link';
import Sticker from '@/components/ui/Sticker';
import BrandName from '@/components/ui/BrandName';
import { CONTACT } from '@/lib/siteConfig';

const SERVICE_LINKS = [
  'Coffee Bar', 'Snack Bar', 'Smoothie Bar', 'Frappes Bar',
  'Drinks Bar', 'Mocktails Bar', 'Charcutería', 'Crepas Bar',
  'Helados', 'Brunch', 'Dessert Bar', 'Bubble Tea',
];

export default function Footer() {
  return (
    <footer className="relative overflow-x-clip bg-coffee-900 text-cream-200 pt-20 pb-10">
      <Sticker id="barra" size={140} mdSize={230} pos={{ top: '-58px', left: 'calc(50% - 70px)' }} mdPos={{ top: '-100px', left: 'calc(50% - 115px)' }} rotate={-2} motion="float" duration={9} speed={0.04} />
      <div className="container-max px-5 md:px-10 lg:px-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1.2fr_1fr] gap-10 md:gap-12">
          <div>
            <p className="font-bodoni text-3xl uppercase leading-none text-cream-50"><BrandName ampClassName="text-gold-400" /></p>
            <p className="font-sans text-[13px] uppercase tracking-[0.3em] text-gold-400 mt-2 mb-5">Luxury mobile bars</p>
            <p className="font-sans text-base leading-relaxed text-cream-300 max-w-xs">
              Barras móviles de lujo para eventos únicos e inolvidables en todo Tabasco.
            </p>
          </div>

          <div>
            <h3 className="font-sans text-[13px] uppercase tracking-[0.28em] text-gold-400 mb-5">Contacto</h3>
            <ul className="space-y-3 font-sans text-base text-cream-200">
              <li>
                <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gold-300 transition-colors">
                  WhatsApp: {CONTACT.whatsappDisplay}
                </a>
              </li>
              <li>
                <a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gold-300 transition-colors">
                  Instagram: {CONTACT.instagramHandle}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-[13px] uppercase tracking-[0.28em] text-gold-400 mb-5">Barras</h3>
            <ul className="space-y-2 font-sans text-base text-cream-200 columns-2 gap-6">
              {SERVICE_LINKS.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-[13px] uppercase tracking-[0.28em] text-gold-400 mb-5">Empresa</h3>
            <ul className="space-y-3 font-sans text-base text-cream-200">
              <li><Link href="/about" className="hover:text-gold-300 transition-colors">Nosotros</Link></li>
              <li><Link href="/contact" className="hover:text-gold-300 transition-colors">Contacto</Link></li>
              <li><Link href="/privacy" className="hover:text-gold-300 transition-colors">Aviso de privacidad</Link></li>
              <li><Link href="/developers" className="hover:text-gold-300 transition-colors">Desarrolladores</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-coffee-600 flex flex-col sm:flex-row gap-2 items-center justify-between font-sans text-[13px] tracking-wide text-cream-400">
          <span>© {new Date().getFullYear()} Crunch &amp; Munch Snack Bar · Todos los derechos reservados</span>
          <span className="uppercase tracking-[0.2em]">Villahermosa · Tabasco</span>
        </div>
      </div>
    </footer>
  );
}

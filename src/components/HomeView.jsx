import { useState } from 'react';
import { categories } from '../store.js';
import site from '../data/site.json';
import { reveal } from './ui.jsx';

export default function HomeView() {
  const [failed, setFailed] = useState({});
  
  return (
    <div className="page-in">
      <section className="relative pb-8 pt-10 lg:pb-8 lg:pt-12">
        <div className="orb" aria-hidden="true" />
        <p className="rise text-xs uppercase tracking-[.3em] text-mute">Restaurante • Sushi • Bar</p>
        <h1 className="mt-2 font-serif text-6xl leading-none tracking-tight sm:text-7xl lg:text-8xl" aria-label="K-Sushi">
          {[...'K-Sushi'].map((c, i) => <span key={i} className="rise inline-block" aria-hidden="true" style={{ animationDelay: `${150 + i * 70}ms` }}>{c}</span>)}
        </h1>
        <p className="rise mt-3 text-mute" style={{ animationDelay: '700ms' }}>Escolha uma categoria para ver o menu.</p>
      </section>
      
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {categories.map((c, i) => (
          <a key={c.id} ref={reveal} href={`#${c.id}`} style={{ '--i': i }}
             className="reveal group relative h-36 overflow-hidden rounded-3xl border border-line sm:h-56 lg:h-[clamp(18rem,calc(100dvh-22rem),26rem)]">
            {!failed[c.id] && <img src={site.imageBase + c.products[0].image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover opacity-70 transition duration-700 group-hover:scale-110" onError={() => setFailed((f) => ({ ...f, [c.id]: true }))} />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
              <div><h2 className="font-serif text-xl sm:text-2xl lg:text-xl xl:text-2xl">{c.name}</h2><p className="text-xs text-mute">{c.products.length} itens</p></div>
              <span className="grid size-11 place-items-center rounded-full bg-white/10 backdrop-blur transition group-hover:translate-x-1 group-hover:bg-accent group-hover:text-bg">
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

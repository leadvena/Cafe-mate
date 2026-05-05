import { motion, AnimatePresence } from 'motion/react';
import { useParams } from 'react-router-dom';
import { Coffee, ChevronRight, Info, Search, MapPin, ArrowRight, Star, Share2, Heart } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot, orderBy, addDoc } from 'firebase/firestore';
import { Cafe, Category, MenuItem } from '../types';
import { cn, formatPrice } from '../lib/utils';
import { Helmet } from 'react-helmet-async';
import gsap from 'gsap';

export default function PublicMenuPage() {
  const { slug } = useParams<{ slug: string }>();
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slug) return;
    const q = query(collection(db, 'cafes'), where('slug', '==', slug));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setCafe({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Cafe);
      } else if (slug === 'your-cozy-cafe') {
        setCafe({
          id: 'demo',
          ownerId: 'demo',
          name: 'Morning Dew Coffee',
          slug: 'your-cozy-cafe',
          description: 'Ethically sourced beans, roasted in small batches. A sanctuary for coffee enthusiasts and morning seekers.'
        });
      }
    });
    return () => unsubscribe();
  }, [slug]);

  useEffect(() => {
    if (!cafe) return;
    const qCats = query(collection(db, 'categories'), where('cafeId', '==', cafe.id), orderBy('order', 'asc'));
    const qItems = query(collection(db, 'items'), where('cafeId', '==', cafe.id), orderBy('order', 'asc'));

    const unsubCats = onSnapshot(qCats, (snap) => {
      const cats = snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
      if (cafe.id === 'demo' && cats.length === 0) {
          setCategories([
            { id: 'c1', cafeId: 'demo', name: 'Signature Coffee', order: 0 },
            { id: 'c2', cafeId: 'demo', name: 'Artisan Pastries', order: 1 },
            { id: 'c3', cafeId: 'demo', name: 'Loose Leaf Tea', order: 2 },
          ]);
          setActiveCategory('c1');
      } else {
        setCategories(cats);
        if (cats.length > 0 && !activeCategory) setActiveCategory(cats[0].id);
      }
      setLoading(false);
    });

    const unsubItems = onSnapshot(qItems, (snap) => {
      const its = snap.docs.map(d => ({ id: d.id, ...d.data() } as MenuItem));
      if (cafe.id === 'demo' && its.length === 0) {
          setItems([
            { id: 'i1', categoryId: 'c1', cafeId: 'demo', name: 'Honey Lavender Latte', price: 185, description: 'Double shot espresso, organic honey, dried lavender buds.', isAvailable: true, order: 0, imageUrl: 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?q=80&w=400&auto=format&fit=crop' },
            { id: 'i2', categoryId: 'c1', cafeId: 'demo', name: 'Charcoal Oat Macchiato', price: 170, description: 'Activated charcoal, creamy oat milk, dark roast espresso.', isAvailable: true, order: 1, imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=400&auto=format&fit=crop' },
            { id: 'i3', categoryId: 'c2', cafeId: 'demo', name: 'Pistachio Rose Croissant', price: 220, description: 'Flaky butter croissant filled with pistachio cream and rose syrup.', isAvailable: true, order: 2, imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=400&auto=format&fit=crop' },
            { id: 'i4', categoryId: 'c3', cafeId: 'demo', name: 'Kyoto Matcha Ceremony', price: 210, description: 'Hand-whisked ceremonial grade matcha from Uji, Kyoto.', isAvailable: true, order: 3, imageUrl: 'https://images.unsplash.com/photo-1582733315364-84bb9995e3f2?q=80&w=400&auto=format&fit=crop' },
          ]);
      } else {
        setItems(its);
      }
    });

    return () => {
      unsubCats();
      unsubItems();
    };
  }, [cafe]);

  useEffect(() => {
    if (!loading && items.length > 0) {
      gsap.from('.menu-item-anim', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'expo.out',
        clearProps: 'all'
      });
      
      gsap.from('.header-reveal', {
        y: -20,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out'
      });
    }
  }, [loading, activeCategory]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: cafe?.name,
        text: cafe?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard');
    }
  };

  const logEvent = async (name: string, metadata: any = {}) => {
    if (!cafe) return;
    try {
      await addDoc(collection(db, 'analytics'), {
        cafeId: cafe.id,
        eventName: name,
        metadata,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error('Analytics failed:', e);
    }
  };

  useEffect(() => {
    if (cafe && !loading) {
      logEvent('menu_open');
    }
  }, [cafe, loading]);

  if (loading) return null;

  return (
    <div ref={containerRef} className="min-h-[100dvh] bg-cream selection:bg-brown-dark selection:text-white pb-32 overflow-x-hidden font-sans">
      <Helmet>
        <title>{cafe ? `${cafe.name} — Artisanal Digital Menu` : 'CafeMate Menu'}</title>
        <meta name="description" content={cafe?.description || 'View our artisanal digital menu.'} />
        <meta property="og:title" content={cafe?.name || 'CafeMate Menu'} />
        <meta property="og:description" content={cafe?.description || 'View our artisanal digital menu.'} />
        <meta property="og:type" content="website" />
      </Helmet>
      {/* Floating Dynamic Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-cream/60 backdrop-blur-xl border-b border-brown-dark/5">
         <div className="header-reveal w-10 h-10 bg-brown-dark rounded-xl flex items-center justify-center shadow-lg shadow-brown-dark/20">
            <Coffee className="text-cream w-6 h-6" />
         </div>
         <div className="header-reveal flex gap-3">
            <button 
              onClick={handleShare}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-brown-dark/5 shadow-sm active:scale-95 transition-transform"
            >
               <Share2 className="w-5 h-5 text-brown-dark" />
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-brown-dark/5 shadow-sm active:scale-95 transition-transform">
               <Search className="w-5 h-5 text-brown-dark" />
            </button>
         </div>
      </header>

      {/* Hero Brand Section */}
      <section className="pt-32 pb-12 px-8">
         <div className="max-w-xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-[10px] uppercase font-bold tracking-[0.3em] text-brown-dark/30 mb-6"
            >
              Artisanal Digital Menu
            </motion.div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-5xl md:text-7xl font-serif text-brown-dark mb-6 tracking-tighter"
            >
              {cafe?.name}
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-sm md:text-lg text-text-muted max-w-sm mx-auto leading-relaxed mb-10 font-light"
            >
              {cafe?.description}
            </motion.p>
            <div className="flex items-center justify-center gap-8 text-[10px] uppercase font-bold tracking-[0.2em] text-brown-dark/40">
               <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-brown-dark/20" />
                  San Lorenzo, MNL
               </div>
               <div className="flex items-center gap-2 text-green-accent">
                  <div className="w-2 h-2 bg-green-accent rounded-full animate-pulse" />
                  Open Now
               </div>
            </div>
         </div>
      </section>

      {/* Interactive Category Scroller */}
      <div className="sticky top-20 z-40 bg-cream/80 backdrop-blur-xl py-8 overflow-hidden border-b border-brown-dark/5">
         <div className="flex gap-4 px-8 overflow-x-auto no-scrollbar scroll-smooth">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  const el = document.getElementById(`category-${cat.id}`);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={cn(
                  "px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-700 whitespace-nowrap",
                  activeCategory === cat.id 
                    ? "bg-brown-dark text-cream shadow-2xl shadow-brown-dark/30 scale-105" 
                    : "bg-white text-brown-dark/40 border border-brown-dark/5 hover:border-brown-dark/20"
                )}
              >
                {cat.name}
              </button>
            ))}
         </div>
      </div>

      {/* Artisanal Menu Sections */}
      <main className="px-8 max-w-2xl mx-auto space-y-32 mt-20">
         {categories.map((cat) => (
           <section key={cat.id} id={`category-${cat.id}`} className="scroll-mt-56">
              <div className="flex items-center gap-8 mb-16">
                 <h2 className="text-4xl font-serif text-brown-dark italic tracking-tight">{cat.name}</h2>
                 <div className="h-[1px] flex-1 bg-brown-dark/10" />
              </div>

              <div className="space-y-20">
                 {items
                   .filter(item => item.categoryId === cat.id)
                   .map((item) => (
                     <div key={item.id} className="menu-item-anim">
                       <MenuItemCard item={item} />
                     </div>
                   ))}
              </div>
           </section>
         ))}
      </main>

      {/* Visual Experience Bar (Bottom) */}
      <AnimatePresence>
         <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-10 left-0 right-0 z-50 px-8 pointer-events-none"
         >
            <div className="max-w-lg mx-auto glass-pill p-3 rounded-[2.5rem] flex items-center justify-between pointer-events-auto shadow-[0_40px_80px_-20px_rgba(44,26,14,0.3)]">
               <div className="flex items-center gap-4 ml-4">
                  <div className="w-12 h-12 rounded-2xl bg-brown-dark flex items-center justify-center text-cream font-serif text-xl shadow-lg">
                    A1
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-brown-dark/40">Active Table</span>
                    <span className="text-sm font-bold text-brown-dark">Window View</span>
                  </div>
               </div>
               <button 
                onClick={() => logEvent('ready_to_order_click')}
                className="bg-brown-dark text-cream px-10 py-5 rounded-[2rem] font-bold text-sm flex items-center gap-4 active:scale-95 transition-all shadow-xl shadow-brown-dark/20 hover:bg-brown-mid"
               >
                  Ready to Order
                  <ArrowRight className="w-5 h-5" />
               </button>
            </div>
         </motion.div>
      </AnimatePresence>
    </div>
  );
}

function MenuItemCard({ item }: { item: MenuItem }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className={cn(
      "relative flex flex-col gap-8 group transition-all duration-1000",
      !item.isAvailable && "opacity-30 grayscale pointer-events-none"
    )}>
       <div className="w-full aspect-[4/3] rounded-[3rem] overflow-hidden bg-brown-dark/5 border border-brown-dark/5 shadow-sm relative">
          {item.imageUrl && (
            <img 
              src={item.imageUrl} 
              alt={item.name} 
              className="w-full h-full object-cover transition-transform duration-[2.5s] group-hover:scale-110" 
              referrerPolicy="no-referrer"
            />
          )}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-brown-dark/60 flex items-center justify-center">
              <span className="text-xs font-bold uppercase tracking-widest text-cream">Sold Out</span>
            </div>
          )}
          <button 
            onClick={() => setLiked(!liked)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full glass-pill flex items-center justify-center active:scale-90 transition-transform"
          >
            <Heart className={cn("w-6 h-6 transition-colors", liked ? "fill-red-500 text-red-500" : "text-brown-dark")} />
          </button>
       </div>
       
       <div className="px-2">
          <div className="flex justify-between items-start mb-4">
             <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-3xl font-serif text-brown-dark tracking-tight leading-none">{item.name}</h3>
                  {item.price > 200 && <Star className="w-4 h-4 text-green-accent fill-green-accent opacity-40" />}
                </div>
                <p className="text-base text-text-muted leading-relaxed font-light">
                  {item.description}
                </p>
             </div>
             <span className="font-bold text-brown-dark text-xl tabular-nums ml-8">
                {formatPrice(item.price)}
             </span>
          </div>
          
          <div className="flex items-center justify-between mt-10">
             <div className="flex items-center gap-5 bg-white p-2 rounded-full border border-brown-dark/5 shadow-sm">
                <button className="w-12 h-12 rounded-full bg-cream flex items-center justify-center text-brown-dark hover:bg-brown-dark hover:text-cream transition-all active:scale-90">
                  <span className="text-xl font-medium">−</span>
                </button>
                <span className="font-bold text-brown-dark tabular-nums text-lg px-2">0</span>
                <button className="w-12 h-12 rounded-full bg-brown-dark flex items-center justify-center text-cream hover:bg-brown-mid transition-all active:scale-90">
                   <PlusIcon className="w-5 h-5" />
                </button>
             </div>
             <div className="flex gap-4">
                <button className="text-[10px] font-bold uppercase tracking-[0.2em] text-brown-dark/40 hover:text-brown-dark transition-colors">
                   Details
                </button>
                <div className="w-[1px] h-4 bg-brown-dark/10" />
                <button className="text-[10px] font-bold uppercase tracking-[0.2em] text-brown-dark/40 hover:text-brown-dark transition-colors">
                   Customize
                </button>
             </div>
          </div>
       </div>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}

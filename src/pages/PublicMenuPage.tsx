import { motion, AnimatePresence } from 'motion/react';
import { useParams } from 'react-router-dom';
import { Coffee, ChevronRight, Info, Search, MapPin } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Cafe, Category, MenuItem } from '../types';
import { cn, formatPrice } from '../lib/utils';

export default function PublicMenuPage() {
  const { slug } = useParams<{ slug: string }>();
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const categoriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slug) return;
    const q = query(collection(db, 'cafes'), where('slug', '==', slug));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setCafe({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Cafe);
      } else if (slug === 'your-cozy-cafe') {
        // Fallback demo data
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
          // Demo categories
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
          // Demo items
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

  if (loading) return null;

  return (
    <div className="min-h-screen bg-cream selection:bg-brown-dark selection:text-white">
      {/* Search Header (Small) */}
      <div className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex justify-between items-center bg-cream/80 backdrop-blur-md">
         <Coffee className="w-6 h-6 text-brown-dark" />
         <div className="flex gap-4">
            <button className="w-10 h-10 rounded-full flex items-center justify-center bg-brown-dark/5">
               <Search className="w-5 h-5 text-brown-dark" />
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center bg-brown-dark/5">
               <Info className="w-5 h-5 text-brown-dark" />
            </button>
         </div>
      </div>

      {/* Hero Header */}
      <header className="pt-24 pb-12 px-6">
         <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 bg-brown-dark rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl"
            >
               <Coffee className="text-cream w-10 h-10" />
            </motion.div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-5xl font-serif text-brown-dark mb-4"
            >
              {cafe?.name}
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-sm text-text-muted max-w-sm mx-auto leading-relaxed"
            >
              {cafe?.description}
            </motion.p>
            <div className="flex items-center justify-center gap-2 mt-6 text-brown-dark/40">
               <MapPin className="w-4 h-4" />
               <span className="text-xs font-medium uppercase tracking-widest">San Lorenzo, Manila</span>
            </div>
         </div>
      </header>

      {/* Category Tabs */}
      <div className="sticky top-16 z-30 bg-cream/80 backdrop-blur-md py-6">
         <div 
          ref={categoriesRef}
          className="flex gap-3 px-6 overflow-x-auto no-scrollbar scroll-smooth"
         >
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  const el = document.getElementById(`category-${cat.id}`);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={cn(
                  "px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300",
                  activeCategory === cat.id 
                    ? "bg-brown-dark text-white shadow-lg shadow-brown-dark/20 scale-105" 
                    : "bg-white text-brown-dark/60 border border-brown-dark/5"
                )}
              >
                {cat.name}
              </button>
            ))}
         </div>
      </div>

      {/* Menu Sections */}
      <main className="px-6 pb-20 max-w-2xl mx-auto space-y-16">
         {categories.map((cat) => (
           <section key={cat.id} id={`category-${cat.id}`} className="scroll-mt-40">
              <div className="flex items-center gap-4 mb-8">
                 <h2 className="text-3xl font-serif text-brown-dark">{cat.name}</h2>
                 <div className="h-px flex-1 bg-brown-dark/5" />
              </div>

              <div className="space-y-8">
                 {items
                   .filter(item => item.categoryId === cat.id)
                   .map((item, idx) => (
                     <motion.div
                       key={item.id}
                       initial={{ opacity: 0, y: 30 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       viewport={{ once: true }}
                       transition={{ delay: idx * 0.1 }}
                     >
                       <MenuItemCard item={item} />
                     </motion.div>
                   ))}
              </div>
           </section>
         ))}
      </main>

      {/* Micro-Interaction Bar (Bottom) */}
      <AnimatePresence>
         <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-6 left-6 right-6 z-50 pointer-events-none"
         >
            <div className="max-w-md mx-auto bg-brown-dark p-4 rounded-[2rem] shadow-2xl flex items-center justify-between text-cream pointer-events-auto">
               <div className="flex flex-col ml-4">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40">Table No</span>
                  <span className="text-xl font-serif">A-12</span>
               </div>
               <button className="bg-white text-brown-dark px-8 py-3 rounded-full font-bold flex items-center gap-2 active:scale-95 transition-transform">
                  View Basket
                  <ChevronRight className="w-4 h-4" />
               </button>
            </div>
         </motion.div>
      </AnimatePresence>
    </div>
  );
}

function MenuItemCard({ item }: { item: MenuItem }) {
  return (
    <div className={cn(
      "relative flex gap-5 group transition-opacity",
      !item.isAvailable && "opacity-50 grayscale"
    )}>
       <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-[2rem] overflow-hidden bg-brown-dark/5 border border-brown-dark/5 shadow-sm">
          {item.imageUrl && (
            <img 
              src={item.imageUrl} 
              alt={item.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              referrerPolicy="no-referrer"
            />
          )}
       </div>
       <div className="flex-1 py-1 flex flex-col justify-between">
          <div>
             <div className="flex justify-between items-start mb-1">
                <h3 className="text-xl font-serif text-brown-dark leading-tight">{item.name}</h3>
                <span className="font-bold text-brown-dark text-sm whitespace-nowrap ml-4">
                   {formatPrice(item.price)}
                </span>
             </div>
             <p className="text-xs text-text-muted leading-relaxed line-clamp-2 md:line-clamp-none">
                {item.description}
             </p>
          </div>
          
          <div className="flex items-center justify-between mt-4">
             {item.isAvailable ? (
                <div className="text-[10px] uppercase font-bold tracking-widest text-green-accent flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 bg-green-accent rounded-full animate-pulse" />
                   Available Now
                </div>
             ) : (
                <div className="text-[10px] uppercase font-bold tracking-widest text-brown-dark/40">
                   Sold Out
                </div>
             )}
             <button className="w-8 h-8 rounded-full bg-brown-dark/5 flex items-center justify-center text-brown-dark hover:bg-brown-dark hover:text-white transition-colors">
                <PlusIcon className="w-4 h-4" />
             </button>
          </div>
       </div>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}

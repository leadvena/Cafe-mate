import React, { useState, useEffect } from 'react';
import { motion, Reorder } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Camera, ChevronRight, Save, Coffee, Image as ImageIcon, GripVertical } from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../services/firebase';
import { collection, query, where, onSnapshot, doc, addDoc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { Cafe, Category, MenuItem } from '../types';
import { cn, formatPrice } from '../lib/utils';

export default function EditorPage() {
  const navigate = useNavigate();
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Load Cafe
  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'cafes'), where('ownerId', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setCafe({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Cafe);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load Categories
  useEffect(() => {
    if (!cafe) return;
    const q = query(collection(db, 'categories'), where('cafeId', '==', cafe.id), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cats = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Category));
      setCategories(cats);
      if (cats.length > 0 && !activeCategoryId) {
        setActiveCategoryId(cats[0].id);
      }
    });
    return () => unsubscribe();
  }, [cafe]);

  // Load Items for active category
  useEffect(() => {
    if (!activeCategoryId) return;
    const q = query(collection(db, 'items'), where('categoryId', '==', activeCategoryId), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MenuItem)));
    });
    return () => unsubscribe();
  }, [activeCategoryId]);

  const addCategory = async () => {
    if (!cafe) return;
    setIsSaving(true);
    try {
      const newCat = {
        cafeId: cafe.id,
        name: 'New Category',
        order: categories.length
      };
      const docRef = await addDoc(collection(db, 'categories'), newCat);
      setActiveCategoryId(docRef.id);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'categories');
    } finally {
      setIsSaving(false);
    }
  };

  const addItem = async () => {
    if (!activeCategoryId || !cafe) return;
    setIsSaving(true);
    try {
      const newItem = {
        cafeId: cafe.id,
        categoryId: activeCategoryId,
        name: 'New Item',
        description: 'Describe your item...',
        price: 0,
        isAvailable: true,
        order: items.length
      };
      await addDoc(collection(db, 'items'), newItem);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'items');
    } finally {
      setIsSaving(false);
    }
  };

  const updateItem = async (id: string, updates: Partial<MenuItem>) => {
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'items', id), updates);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `items/${id}`);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteDoc(doc(db, 'items', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `items/${id}`);
    }
  };

  return (
    <div className="h-screen bg-cream flex flex-col">
      {/* Top Header */}
      <header className="px-6 py-4 bg-white border-b border-brown-dark/5 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-brown-dark/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-brown-dark" />
          </button>
          <div>
            <h1 className="font-serif text-xl font-bold text-brown-dark">Menu Editor</h1>
            <p className="text-xs text-text-muted">{cafe?.name} • Changes auto-save</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <div className={cn("flex items-center gap-2 text-xs font-medium text-text-muted transition-opacity", isSaving ? "opacity-100" : "opacity-0")}>
               <Save className="w-3 h-3 animate-pulse" />
               Saving...
            </div>
            <button 
              onClick={() => navigate(`/menu/${cafe?.slug}`)}
              className="bg-brown-dark text-white px-5 py-2 rounded-full text-sm font-medium"
            >
              Preview
            </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Categories Sidebar */}
        <aside className="w-72 border-r border-brown-dark/5 bg-white/50 flex flex-col">
          <div className="p-6 shrink-0 flex justify-between items-center">
            <h2 className="text-sm font-bold text-brown-dark uppercase tracking-widest">Categories</h2>
            <button 
              onClick={addCategory}
              className="w-8 h-8 rounded-lg bg-brown-dark text-white flex items-center justify-center hover:bg-brown-mid transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 space-y-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl text-left transition-all group",
                  activeCategoryId === cat.id ? "bg-brown-dark text-white shadow-lg" : "hover:bg-brown-dark/5 text-text-primary"
                )}
              >
                <span className="font-medium truncate">{cat.name}</span>
                <ChevronRight className={cn("w-4 h-4 opacity-0 transition-opacity", activeCategoryId === cat.id ? "opacity-40" : "group-hover:opacity-100")} />
              </button>
            ))}
          </div>
        </aside>

        {/* Items List */}
        <main className="flex-1 overflow-y-auto p-8">
           {activeCategoryId ? (
             <div className="max-w-3xl mx-auto">
                <div className="mb-12">
                   <input 
                    type="text"
                    defaultValue={categories.find(c => c.id === activeCategoryId)?.name}
                    onBlur={(e) => {
                      const newName = e.target.value;
                      if (!newName) return;
                      updateDoc(doc(db, 'categories', activeCategoryId), { name: newName });
                    }}
                    className="text-4xl font-serif bg-transparent border-none focus:outline-none focus:ring-0 w-full text-brown-dark"
                   />
                   <p className="text-text-muted mt-2">Manage items in this category</p>
                </div>

                <div className="space-y-6">
                   {items.map((item) => (
                      <ItemCard 
                        key={item.id} 
                        item={item} 
                        onUpdate={(updates) => updateItem(item.id, updates)} 
                        onDelete={() => deleteItem(item.id)}
                      />
                   ))}
                   
                   <button 
                    onClick={addItem}
                    className="w-full py-8 border-2 border-dashed border-brown-dark/10 rounded-[2rem] flex flex-col items-center justify-center gap-3 text-text-muted hover:border-brown-dark/20 hover:text-brown-dark transition-all"
                   >
                      <Plus className="w-6 h-6" />
                      <span className="font-medium">Add new item to {categories.find(c => c.id === activeCategoryId)?.name}</span>
                   </button>
                </div>
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-brown-dark/5 rounded-3xl flex items-center justify-center mb-6">
                   <Layout className="w-10 h-10 text-brown-dark/20" />
                </div>
                <h3 className="text-2xl font-serif text-brown-dark mb-2">No Category Selected</h3>
                <p className="text-text-muted max-w-xs">Select or create a category to start adding menu items.</p>
             </div>
           )}
        </main>
      </div>
    </div>
  );
}

interface ItemCardProps {
  key?: React.Key;
  item: MenuItem;
  onUpdate: (u: Partial<MenuItem>) => void | Promise<void>;
  onDelete: () => void | Promise<void>;
}

function ItemCard({ item, onUpdate, onDelete }: ItemCardProps) {
  const [localItem, setLocalItem] = useState(item);

  return (
    <motion.div 
      layout
      className="bg-white p-6 rounded-[2rem] border border-brown-dark/5 shadow-sm group"
    >
       <div className="flex gap-6">
          {/* Image Placeholder */}
          <div className="w-32 h-32 shrink-0 bg-cream rounded-[1.5rem] flex flex-col items-center justify-center border border-brown-dark/5 relative overflow-hidden group/img">
             {item.imageUrl ? (
               <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
             ) : (
               <div className="flex flex-col items-center text-brown-dark/20">
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <span className="text-[10px] uppercase font-bold tracking-widest">No Photo</span>
               </div>
             )}
             <div className="absolute inset-0 bg-brown-dark/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                <button className="text-white">
                   <Camera className="w-6 h-6" />
                </button>
             </div>
          </div>

          <div className="flex-1 space-y-4">
             <div className="flex justify-between items-start">
                <div className="flex-1">
                   <input 
                    type="text"
                    value={localItem.name}
                    onChange={(e) => setLocalItem({...localItem, name: e.target.value})}
                    onBlur={() => onUpdate({ name: localItem.name })}
                    className="text-xl font-serif text-brown-dark bg-transparent border-none focus:outline-none w-full"
                   />
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-1 bg-cream px-3 py-1 rounded-full border border-brown-dark/5">
                      <span className="text-xs font-bold text-brown-dark opacity-40">PHP</span>
                      <input 
                        type="number"
                        value={localItem.price}
                        onChange={(e) => setLocalItem({...localItem, price: parseFloat(e.target.value) || 0})}
                        onBlur={() => onUpdate({ price: localItem.price })}
                        className="w-16 bg-transparent border-none focus:outline-none text-sm font-bold text-brown-dark text-right"
                      />
                   </div>
                   <button 
                    onClick={onDelete}
                    className="text-text-muted hover:text-red-500 transition-colors p-1"
                   >
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>
             </div>

             <textarea 
                value={localItem.description}
                onChange={(e) => setLocalItem({...localItem, description: e.target.value})}
                onBlur={() => onUpdate({ description: localItem.description })}
                className="w-full bg-cream/30 border-none rounded-xl p-3 text-sm text-text-muted focus:ring-1 focus:ring-brown-dark/10 h-20 resize-none"
                placeholder="Item description..."
             />

             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div 
                    onClick={() => onUpdate({ isAvailable: !item.isAvailable })}
                    className={cn(
                      "w-10 h-5 rounded-full relative transition-colors cursor-pointer",
                      item.isAvailable ? "bg-green-accent" : "bg-brown-dark/10"
                    )}
                   >
                      <div className={cn(
                        "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                        item.isAvailable ? "left-6" : "left-1"
                      )} />
                   </div>
                   <span className="text-xs font-medium text-text-muted">
                      {item.isAvailable ? 'In Stock' : 'Sold Out'}
                   </span>
                </div>
                
                <div className="text-brown-dark/20">
                   <GripVertical className="w-5 h-5 cursor-grab" />
                </div>
             </div>
          </div>
       </div>
    </motion.div>
  );
}

function Layout({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="3" y1="9" x2="21" y2="9"></line>
      <line x1="9" y1="21" x2="9" y2="9"></line>
    </svg>
  );
}

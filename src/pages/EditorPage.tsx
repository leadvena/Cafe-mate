import React, { useState, useEffect } from 'react';
import { motion, Reorder, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Camera, ChevronRight, Coffee, Image as ImageIcon, GripVertical, Check, RefreshCcw, Layout, FileText, Upload, Sparkles, Loader2 } from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../services/firebase';
import { collection, query, where, onSnapshot, doc, addDoc, updateDoc, deleteDoc, orderBy, writeBatch } from 'firebase/firestore';
import { Cafe, Category, MenuItem } from '../types';
import { cn } from '../lib/utils';
import { uploadMenuItemImage } from '../services/upload';

export default function EditorPage() {
  const navigate = useNavigate();
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !cafe) return;

    setIsSaving(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        let importedItems: any[] = [];

        if (file.name.endsWith('.json')) {
          importedItems = JSON.parse(text);
        } else {
          // Simple CSV Parser
          const lines = text.split('\n');
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          
          importedItems = lines.slice(1).filter(line => line.trim()).map(line => {
            const values = line.split(',').map(v => v.trim());
            const item: any = {};
            headers.forEach((header, i) => {
              item[header] = values[i];
            });
            return item;
          });
        }

        // Process imports
        const batch = writeBatch(db);
        for (const item of importedItems) {
          // Find or create category
          let categoryId = activeCategoryId;
          if (item.category) {
            const existingCat = categories.find(c => c.name.toLowerCase() === item.category.toLowerCase());
            if (existingCat) {
              categoryId = existingCat.id;
            } else {
              const catRef = await addDoc(collection(db, 'categories'), {
                cafeId: cafe.id,
                name: item.category,
                order: categories.length
              });
              categoryId = catRef.id;
            }
          }

          if (!categoryId) continue;

          const newItemRef = doc(collection(db, 'items'));
          batch.set(newItemRef, {
            cafeId: cafe.id,
            categoryId,
            name: item.name || 'Imported Item',
            description: item.description || '',
            price: parseFloat(item.price) || 0,
            isAvailable: true,
            order: 999 // Let them reorder later
          });
        }

        await batch.commit();
        alert(`Successfully imported ${importedItems.length} items!`);
      } catch (err) {
        console.error('Import failed:', err);
        alert('Import failed. Please check your file format.');
      } finally {
        setIsSaving(false);
      }
    };
    reader.readAsText(file);
  };

  // Load Cafe
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/');
        return;
      }
      const q = query(collection(db, 'cafes'), where('ownerId', '==', user.uid));
      const unsubscribeDb = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          setCafe({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Cafe);
        }
      });
      return () => unsubscribeDb();
    });
    
    return () => unsubscribeAuth();
  }, [navigate]);

  // Load Categories
  useEffect(() => {
    if (!cafe) return;
    const qCats = query(collection(db, 'categories'), where('cafeId', '==', cafe.id), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(qCats, (snapshot) => {
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
    const qItems = query(collection(db, 'items'), where('categoryId', '==', activeCategoryId), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(qItems, (snapshot) => {
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

  const handleReorder = async (newItems: MenuItem[]) => {
    setItems(newItems);
    const batch = writeBatch(db);
    newItems.forEach((item, index) => {
      const ref = doc(db, 'items', item.id);
      batch.update(ref, { order: index });
    });
    await batch.commit();
  };

  return (
    <div className="h-screen bg-cream flex flex-col overflow-hidden font-sans">
      {/* Editorial Header */}
      <header className="px-8 py-6 bg-cream/80 backdrop-blur-xl border-b border-brown-dark/5 flex justify-between items-center z-40">
        <div className="flex items-center gap-8">
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-12 h-12 rounded-2xl bg-white border border-brown-dark/5 flex items-center justify-center hover:bg-brown-dark hover:text-cream transition-all group shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="font-serif text-3xl font-bold text-brown-dark tracking-tight leading-none">{cafe?.name || 'Artisanal Menu'}</h1>
            <div className="flex items-center gap-4 mt-2">
               <div className="flex items-center gap-2">
                  {isSaving ? (
                    <RefreshCcw className="w-3.5 h-3.5 text-brown-dark/40 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5 text-green-accent" />
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brown-dark/40">
                    {isSaving ? 'Curation in progress' : 'Workspace Synchronized'}
                  </span>
               </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleBulkImport} 
            className="hidden" 
            accept=".csv,.json"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brown-dark/40 hover:text-brown-dark transition-colors px-4"
          >
            <Upload className="w-4 h-4" />
            Bulk Import
          </button>
          <button 
            onClick={() => navigate(`/menu/${cafe?.slug}`)}
            className="btn-secondary py-3.5 px-8 text-sm font-bold shadow-sm"
          >
            View Live Menu
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Category Rails */}
        <aside className="w-80 bg-white/50 border-r border-brown-dark/5 flex flex-col overflow-hidden">
          <div className="p-10 shrink-0 flex justify-between items-center">
            <h2 className="text-[11px] font-bold text-brown-dark/30 uppercase tracking-[0.3em]">Collections</h2>
            <button 
              onClick={addCategory}
              className="w-10 h-10 rounded-xl bg-brown-dark/5 text-brown-dark flex items-center justify-center hover:bg-brown-dark hover:text-white transition-all shadow-sm"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-12 space-y-3 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={cn(
                  "w-full flex items-center justify-between p-5 rounded-[1.5rem] text-left transition-all group",
                  activeCategoryId === cat.id 
                    ? "bg-brown-dark text-white shadow-2xl shadow-brown-dark/30 translate-x-3" 
                    : "hover:bg-brown-dark/5 text-brown-dark/60 hover:text-brown-dark"
                )}
              >
                <span className="font-bold text-sm tracking-tight truncate">{cat.name}</span>
                <ChevronRight className={cn("w-4 h-4 opacity-0 transition-all", activeCategoryId === cat.id ? "opacity-40" : "group-hover:opacity-100")} />
              </button>
            ))}
          </div>
        </aside>

        {/* Curation Area */}
        <main className="flex-1 overflow-y-auto p-16 no-scrollbar bg-cream/20">
           <AnimatePresence mode="wait">
             {activeCategoryId ? (
               <motion.div 
                 key={activeCategoryId}
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -30 }}
                 className="max-w-4xl mx-auto pb-40"
               >
                  <div className="mb-20 flex justify-between items-end">
                     <div className="flex-1">
                        <input 
                          type="text"
                          defaultValue={categories.find(c => c.id === activeCategoryId)?.name}
                          onBlur={(e) => {
                            const newName = e.target.value;
                            if (!newName) return;
                            updateDoc(doc(db, 'categories', activeCategoryId), { name: newName });
                          }}
                          className="text-7xl font-serif bg-transparent border-none focus:outline-none focus:ring-0 w-full text-brown-dark tracking-tighter"
                        />
                        <p className="text-sm text-brown-dark/30 mt-4 font-medium uppercase tracking-widest">Editing Collection — {items.length} Items</p>
                     </div>
                     <div className="flex gap-4 mb-4">
                        <button className="w-12 h-12 rounded-full border border-brown-dark/5 bg-white flex items-center justify-center text-brown-dark/40 hover:text-brown-dark transition-all">
                           <Sparkles className="w-5 h-5" />
                        </button>
                     </div>
                  </div>

                  <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-8">
                    {items.map((item) => (
                      <Reorder.Item key={item.id} value={item}>
                        <ItemCard 
                          item={item} 
                          onUpdate={(updates) => updateItem(item.id, updates)} 
                          onDelete={() => deleteItem(item.id)}
                        />
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                   
                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={addItem}
                    className="w-full mt-16 py-16 border-2 border-dashed border-brown-dark/10 rounded-[4rem] flex flex-col items-center justify-center gap-6 text-brown-dark/30 hover:border-brown-dark/20 hover:text-brown-dark hover:bg-white transition-all group bg-white/30"
                  >
                    <div className="w-16 h-16 rounded-full bg-brown-dark/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                      <Plus className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <span className="font-bold text-sm tracking-[0.2em] uppercase block mb-1">Add New Item</span>
                      <span className="text-[10px] text-brown-dark/20 uppercase font-bold tracking-widest">or drag & drop images here</span>
                    </div>
                  </motion.button>
               </motion.div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-40 h-40 bg-brown-dark/5 rounded-[3.5rem] flex items-center justify-center mb-10 shadow-inner">
                     <Layout className="w-16 h-16 text-brown-dark/10" />
                  </div>
                  <h3 className="text-4xl font-serif text-brown-dark mb-4 tracking-tight">Select a Collection</h3>
                  <p className="text-text-muted max-w-sm mx-auto leading-relaxed font-light text-lg">Choose an artisanal collection from the left rail to begin curating your digital menu experience.</p>
               </div>
             )}
           </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function ItemCard({ item, onUpdate, onDelete }: { item: MenuItem; onUpdate: (u: Partial<MenuItem>) => void; onDelete: () => void }) {
   const [localItem, setLocalItem] = useState(item);
   const [isUploading, setIsUploading] = useState(false);
   const imageInputRef = React.useRef<HTMLInputElement>(null);

   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;

     setIsUploading(true);
     try {
       const url = await uploadMenuItemImage(file);
       onUpdate({ imageUrl: url });
     } catch (err) {
       console.error('Upload failed:', err);
       alert('Image upload failed. Please try again.');
     } finally {
       setIsUploading(false);
     }
   };

   return (
     <div className="card-tactile p-8 bg-white flex gap-10 items-start group shadow-lg hover:shadow-2xl transition-all duration-700">
        <div className="w-40 h-40 shrink-0 bg-cream rounded-[2.5rem] flex flex-col items-center justify-center border border-brown-dark/5 relative overflow-hidden group/img shadow-inner">
           {isUploading ? (
             <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-brown-dark/20 animate-spin" />
                <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-brown-dark/20">Uploading...</span>
             </div>
           ) : item.imageUrl ? (
             <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover/img:scale-110" referrerPolicy="no-referrer" />
           ) : (
             <div className="flex flex-col items-center text-brown-dark/20">
                <ImageIcon className="w-10 h-10 mb-3" />
                <span className="text-[9px] uppercase font-bold tracking-[0.2em]">Upload Photo</span>
             </div>
           )}
           <div className="absolute inset-0 bg-brown-dark/70 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <input 
                type="file" 
                ref={imageInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*"
              />
              <button 
                onClick={() => imageInputRef.current?.click()}
                className="text-white hover:scale-110 transition-transform bg-white/20 p-4 rounded-full"
              >
                 <Camera className="w-8 h-8" />
              </button>
           </div>
        </div>

       <div className="flex-1 min-w-0 pt-2">
          <div className="flex justify-between items-start mb-8">
             <div className="flex-1 mr-8">
                <input 
                  type="text"
                  value={localItem.name}
                  onChange={(e) => setLocalItem({...localItem, name: e.target.value})}
                  onBlur={() => onUpdate({ name: localItem.name })}
                  className="text-3xl font-serif text-brown-dark bg-transparent border-none focus:outline-none w-full p-0 leading-none mb-2 tracking-tight"
                />
                <div className="h-[2px] w-0 group-hover:w-full bg-green-accent opacity-30 transition-all duration-1000" />
             </div>
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-cream px-5 py-3 rounded-2xl border border-brown-dark/5 shadow-inner">
                   <span className="text-[10px] font-bold text-brown-dark/30 uppercase tracking-widest">PHP</span>
                   <input 
                     type="number"
                     value={localItem.price}
                     onChange={(e) => setLocalItem({...localItem, price: parseFloat(e.target.value) || 0})}
                     onBlur={() => onUpdate({ price: localItem.price })}
                     className="w-20 bg-transparent border-none focus:outline-none text-base font-bold text-brown-dark text-right tabular-nums"
                   />
                </div>
                <button 
                  onClick={onDelete}
                  className="w-12 h-12 rounded-2xl bg-brown-dark/5 text-brown-dark/20 hover:text-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center shadow-sm"
                >
                   <Trash2 className="w-5 h-5" />
                </button>
             </div>
          </div>

          <textarea 
             value={localItem.description}
             onChange={(e) => setLocalItem({...localItem, description: e.target.value})}
             onBlur={() => onUpdate({ description: localItem.description })}
             className="w-full bg-transparent border-none p-0 text-base text-text-muted focus:ring-0 h-16 resize-none leading-relaxed font-light"
             placeholder="Describe the essence of this item..."
          />

          <div className="flex items-center justify-between mt-10">
             <div className="flex items-center gap-5">
                <div 
                  onClick={() => onUpdate({ isAvailable: !item.isAvailable })}
                  className={cn(
                    "w-14 h-7 rounded-full relative transition-all cursor-pointer p-1.5 shadow-inner",
                    item.isAvailable ? "bg-green-accent" : "bg-brown-dark/10"
                  )}
                >
                   <div className={cn(
                     "w-4 h-4 bg-white rounded-full transition-all shadow-md",
                     item.isAvailable ? "translate-x-7" : "translate-x-0"
                   )} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brown-dark/40">
                   {item.isAvailable ? 'Currently Serving' : 'Temporarily Out'}
                </span>
             </div>
             
             <div className="cursor-grab active:cursor-grabbing text-brown-dark/5 hover:text-brown-dark/30 transition-all p-2">
                <GripVertical className="w-7 h-7" />
             </div>
          </div>
       </div>
    </div>
  );
}

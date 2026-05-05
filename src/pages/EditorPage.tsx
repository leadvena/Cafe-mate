import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Camera, ChevronRight, Check, RefreshCcw, Layout, Upload, Sparkles, Loader2, Edit2, X, Image as ImageIcon } from 'lucide-react';
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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

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

        const batch = writeBatch(db);
        for (const item of importedItems) {
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
            order: 999 
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

  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteDoc(doc(db, 'items', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `items/${id}`);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const saveProduct = async (productData: Partial<MenuItem>) => {
    if (!activeCategoryId || !cafe) return;
    setIsSaving(true);
    
    try {
      if (editingItem) {
        // Update
        await updateDoc(doc(db, 'items', editingItem.id), productData);
      } else {
        // Create
        await addDoc(collection(db, 'items'), {
          ...productData,
          cafeId: cafe.id,
          categoryId: activeCategoryId,
          order: items.length
        });
      }
      closeModal();
    } catch (e) {
      handleFirestoreError(e, editingItem ? OperationType.UPDATE : OperationType.CREATE, 'items');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen bg-cream flex flex-col overflow-hidden font-sans">
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
                    {isSaving ? 'Saving Changes' : 'Workspace Synchronized'}
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

        <main className="flex-1 overflow-y-auto p-12 no-scrollbar bg-cream/20">
           <AnimatePresence mode="wait">
             {activeCategoryId ? (
               <motion.div 
                 key={activeCategoryId}
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -30 }}
                 className="max-w-6xl mx-auto pb-40"
               >
                  <div className="mb-12 flex justify-between items-end">
                     <div className="flex-1">
                        <input 
                          type="text"
                          defaultValue={categories.find(c => c.id === activeCategoryId)?.name}
                          onBlur={(e) => {
                            const newName = e.target.value;
                            if (!newName) return;
                            updateDoc(doc(db, 'categories', activeCategoryId), { name: newName });
                          }}
                          className="text-5xl font-serif bg-transparent border-none focus:outline-none focus:ring-0 w-full text-brown-dark tracking-tighter"
                        />
                        <p className="text-sm text-brown-dark/30 mt-2 font-medium uppercase tracking-widest">{items.length} Products in Collection</p>
                     </div>
                     <div>
                        <button 
                          onClick={openAddModal}
                          className="btn-primary py-3 px-6 shadow-xl shadow-brown-dark/20 flex items-center gap-2"
                        >
                           <Plus className="w-5 h-5" />
                           Add Product
                        </button>
                     </div>
                  </div>

                  <div className="bg-white rounded-3xl shadow-sm border border-brown-dark/5 overflow-hidden">
                     <table className="w-full text-left">
                       <thead className="bg-brown-dark/5 text-[10px] uppercase font-bold tracking-widest text-brown-dark/40 border-b border-brown-dark/5">
                         <tr>
                           <th className="px-8 py-5 w-24">Image</th>
                           <th className="px-8 py-5">Product Details</th>
                           <th className="px-8 py-5 w-32 text-right">Price</th>
                           <th className="px-8 py-5 w-40 text-center">Status</th>
                           <th className="px-8 py-5 w-32 text-right">Actions</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-brown-dark/5">
                         {items.length === 0 ? (
                           <tr>
                             <td colSpan={5} className="py-20 text-center">
                               <p className="text-text-muted mb-4">No products in this collection yet.</p>
                               <button onClick={openAddModal} className="text-brown-dark font-bold hover:underline">Add your first product</button>
                             </td>
                           </tr>
                         ) : (
                           items.map((item) => (
                             <tr key={item.id} className="group hover:bg-brown-dark/[0.02] transition-colors">
                               <td className="px-8 py-4">
                                 <div className="w-16 h-16 rounded-xl bg-cream border border-brown-dark/5 overflow-hidden flex items-center justify-center">
                                   {item.imageUrl ? (
                                     <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                   ) : (
                                     <ImageIcon className="w-6 h-6 text-brown-dark/20" />
                                   )}
                                 </div>
                               </td>
                               <td className="px-8 py-4">
                                 <p className="font-serif text-lg text-brown-dark tracking-tight">{item.name}</p>
                                 <p className="text-xs text-text-muted mt-1 truncate max-w-sm">{item.description || 'No description'}</p>
                               </td>
                               <td className="px-8 py-4 text-right">
                                 <span className="font-bold text-brown-dark">₱{item.price.toFixed(2)}</span>
                               </td>
                               <td className="px-8 py-4 text-center">
                                 <span className={cn(
                                   "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                                   item.isAvailable ? "bg-green-accent/20 text-green-accent" : "bg-brown-dark/10 text-brown-dark/40"
                                 )}>
                                   {item.isAvailable ? 'Available' : 'Sold Out'}
                                 </span>
                               </td>
                               <td className="px-8 py-4 text-right">
                                 <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button 
                                     onClick={() => openEditModal(item)}
                                     className="w-10 h-10 rounded-xl bg-white border border-brown-dark/10 flex items-center justify-center text-brown-dark hover:bg-brown-dark hover:text-white transition-all shadow-sm"
                                   >
                                     <Edit2 className="w-4 h-4" />
                                   </button>
                                   <button 
                                     onClick={() => deleteItem(item.id)}
                                     className="w-10 h-10 rounded-xl bg-white border border-brown-dark/10 flex items-center justify-center text-brown-dark/40 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"
                                   >
                                     <Trash2 className="w-4 h-4" />
                                   </button>
                                 </div>
                               </td>
                             </tr>
                           ))
                         )}
                       </tbody>
                     </table>
                  </div>
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

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <ProductModal 
            item={editingItem} 
            onClose={closeModal} 
            onSave={saveProduct} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ----------------------------------------------------
// PRODUCT MODAL COMPONENT
// ----------------------------------------------------
function ProductModal({ item, onClose, onSave }: { item: MenuItem | null; onClose: () => void; onSave: (data: Partial<MenuItem>) => void }) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || 0,
    isAvailable: item?.isAvailable ?? true,
    imageUrl: item?.imageUrl || ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadMenuItemImage(file);
      setFormData(prev => ({ ...prev, imageUrl: url }));
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-brown-dark/80 backdrop-blur-sm p-6"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="w-full max-w-2xl bg-cream rounded-[3rem] overflow-hidden shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-10 h-10 bg-white rounded-full flex items-center justify-center text-brown-dark hover:bg-brown-dark hover:text-white transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-12">
          <h2 className="text-4xl font-serif text-brown-dark mb-8 tracking-tight">
            {item ? 'Edit Product' : 'New Product'}
          </h2>

          <div className="space-y-6">
            <div className="flex gap-8">
              {/* Image Uploader */}
              <div className="w-48 h-48 shrink-0 bg-white rounded-[2rem] border-2 border-dashed border-brown-dark/10 flex flex-col items-center justify-center relative overflow-hidden group">
                {isUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-brown-dark/20 animate-spin" />
                  </div>
                ) : formData.imageUrl ? (
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-brown-dark/20">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Add Photo</span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-brown-dark/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <input 
                    type="file" 
                    ref={imageInputRef} 
                    onChange={handleImageUpload} 
                    className="hidden" 
                    accept="image/*"
                  />
                  <button 
                    onClick={() => imageInputRef.current?.click()}
                    className="text-white bg-white/20 p-4 rounded-full hover:scale-110 transition-transform"
                  >
                    <Camera className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Core Details */}
              <div className="flex-1 space-y-6">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-brown-dark/40 block mb-2 ml-2">Product Name</label>
                  <input 
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Pour Over Coffee"
                    className="input-field"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-brown-dark/40 block mb-2 ml-2">Price (PHP)</label>
                  <input 
                    type="number"
                    value={formData.price || ''}
                    onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                    className="input-field font-bold tabular-nums"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-brown-dark/40 block mb-2 ml-2">Description</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the flavor profile, ingredients, or origin..."
                className="input-field min-h-[100px] resize-none py-4 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-brown-dark/5">
              <div className="flex items-center gap-4">
                <div 
                  onClick={() => setFormData({...formData, isAvailable: !formData.isAvailable})}
                  className={cn(
                    "w-14 h-7 rounded-full relative transition-all cursor-pointer p-1.5 shadow-inner",
                    formData.isAvailable ? "bg-green-accent" : "bg-brown-dark/10"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 bg-white rounded-full transition-all shadow-md",
                    formData.isAvailable ? "translate-x-7" : "translate-x-0"
                  )} />
                </div>
                <div>
                  <p className="text-sm font-bold text-brown-dark tracking-tight">Available to Order</p>
                  <p className="text-[10px] text-text-muted">Turn off if item is out of stock</p>
                </div>
              </div>

              <button 
                onClick={() => onSave(formData)}
                disabled={!formData.name}
                className="btn-primary px-10 py-4 shadow-xl shadow-brown-dark/20 disabled:opacity-50"
              >
                Save Product
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

import { motion, AnimatePresence } from 'motion/react';
import { X, Check, ArrowRight, Smartphone, Camera } from 'lucide-react';
import { useState } from 'react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (referenceNumber: string) => Promise<void>;
  isSubmitting: boolean;
}

export default function UpgradeModal({ isOpen, onClose, onSubmit, isSubmitting }: UpgradeModalProps) {
  const [referenceNumber, setReferenceNumber] = useState('');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-brown-dark/40 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="relative w-full max-w-xl bg-cream rounded-[3rem] shadow-2xl overflow-hidden border border-brown-dark/10"
        >
           {/* Header */}
           <div className="p-8 border-b border-brown-dark/5 flex justify-between items-start bg-white/50">
             <div>
               <h2 className="text-3xl font-serif text-brown-dark">Upgrade to Pro</h2>
               <p className="text-text-muted mt-2">Unlock unlimited artisanal curation.</p>
             </div>
             <button onClick={onClose} className="p-2 bg-white rounded-full text-brown-dark/40 hover:text-brown-dark transition-colors border border-brown-dark/5 shadow-sm">
               <X className="w-5 h-5" />
             </button>
           </div>

           {/* Content */}
           <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Payment Info */}
              <div className="space-y-6">
                 <div className="bg-white p-5 rounded-3xl border border-brown-dark/5 shadow-sm">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brown-dark/40 block mb-2">Total Due Today</span>
                    <div className="flex items-end gap-3">
                       <span className="text-3xl font-bold text-brown-dark tabular-nums tracking-tight">₱599</span>
                       <span className="text-lg text-brown-dark/30 line-through tabular-nums mb-1">₱1,499</span>
                    </div>
                    <span className="text-xs text-green-accent font-bold uppercase tracking-wider block mt-2">Special Early Access Rate</span>
                 </div>

                 <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                       <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-1">
                          <Smartphone className="w-4 h-4 text-blue-500" />
                       </div>
                       <div>
                          <h4 className="font-bold text-sm text-brown-dark">1. Scan with GCash</h4>
                          <p className="text-xs text-text-muted mt-1 leading-relaxed">Open your GCash app and scan the QR code to send payment.</p>
                       </div>
                    </div>
                    <div className="flex gap-4 items-start">
                       <div className="w-8 h-8 rounded-full bg-green-accent/10 flex items-center justify-center shrink-0 mt-1">
                          <Check className="w-4 h-4 text-green-accent" />
                       </div>
                       <div>
                          <h4 className="font-bold text-sm text-brown-dark">2. Enter Reference No.</h4>
                          <p className="text-xs text-text-muted mt-1 leading-relaxed">Copy the 13-digit reference number from your receipt.</p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* QR Code Area */}
              <div className="flex flex-col items-center justify-center">
                 <div className="w-48 h-48 bg-white p-4 rounded-3xl shadow-lg border border-brown-dark/5 relative overflow-hidden group">
                    {/* Placeholder for QR Code */}
                    <div className="w-full h-full bg-brown-dark/5 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-brown-dark/10">
                       <Camera className="w-8 h-8 text-brown-dark/20 mb-2" />
                       <span className="text-[10px] font-bold text-center text-brown-dark/40 uppercase tracking-widest px-4">Place your GCash QR here</span>
                    </div>
                 </div>
                 <span className="text-xs font-bold text-brown-dark/40 mt-4 tracking-widest uppercase">Registered to: J***n D.</span>
              </div>
           </div>

           {/* Footer Action */}
           <div className="p-8 bg-brown-dark text-cream relative">
              <div className="max-w-md mx-auto space-y-4 relative z-10">
                 <label className="text-xs font-bold uppercase tracking-widest text-cream/60">GCash Reference Number</label>
                 <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      placeholder="e.g. 1000293847589"
                      className="flex-1 bg-white/10 border-none rounded-2xl px-5 text-white placeholder:text-white/20 focus:ring-2 focus:ring-green-accent transition-all font-mono tracking-wider"
                    />
                    <button 
                      onClick={() => onSubmit(referenceNumber)}
                      disabled={isSubmitting || referenceNumber.length < 5}
                      className="bg-green-accent text-white px-6 rounded-2xl font-bold flex items-center gap-2 hover:bg-green-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Verifying...' : 'Verify'}
                      {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                    </button>
                 </div>
              </div>
           </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

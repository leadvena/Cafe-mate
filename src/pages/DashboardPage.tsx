import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Edit3, Share2, Download, ExternalLink, Coffee, LogOut, Layout, ArrowRight, CheckCircle2 } from 'lucide-react';
import { auth, logOut } from '../services/firebase';
import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc } from 'firebase/firestore';
import { Cafe } from '../types';
import { cn } from '../lib/utils';
import UpgradeModal from '../components/UpgradeModal';
import { sendUpgradeRequestEmail } from '../services/email';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isSubmittingUpgrade, setIsSubmittingUpgrade] = useState(false);

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
        } else {
          // If no cafe found, redirect to onboarding
          navigate('/onboarding');
        }
        setLoading(false);
      });

      return () => unsubscribeDb();
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await logOut();
    navigate('/');
  };

  const shareUrl = `${window.location.origin}/menu/${cafe?.slug}`;

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${cafe?.slug}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleUpgradeSubmit = async (referenceNumber: string) => {
    if (!cafe) return;
    setIsSubmittingUpgrade(true);
    try {
      // Save request to Firestore
      await addDoc(collection(db, 'upgrade_requests'), {
        cafeId: cafe.id,
        cafeName: cafe.name,
        referenceNumber,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      // Update cafe document to show pending status
      const cafeRef = doc(db, 'cafes', cafe.id);
      await updateDoc(cafeRef, { upgradePending: true });

      // Trigger the backend email notification to the admin
      await sendUpgradeRequestEmail(cafe.name, referenceNumber);

      setIsUpgradeModalOpen(false);
      alert('Payment submitted! We are verifying your transaction. Your account will be upgraded shortly.');
    } catch (e) {
      console.error('Upgrade request failed', e);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmittingUpgrade(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center">
        <div className="w-40 h-40 mb-8 animate-pulse">
          <img src="/cafemate.png" alt="CafeMate" className="w-full h-full object-contain" />
        </div>
        <p className="text-sm font-bold uppercase tracking-widest text-brown-dark/40 animate-pulse">Loading Workspace</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex overflow-hidden">
      {/* Refined Sidebar */}
      <aside className="w-24 md:w-80 bg-brown-dark hidden md:flex flex-col p-8 text-cream transition-all border-r border-white/5">
        <div className="flex items-center gap-4 mb-16">
          <div className="w-12 h-12 bg-cream rounded-2xl flex items-center justify-center shadow-lg shadow-black/20 p-2.5">
            <img src="/favicon.svg" alt="CafeMate Logo" className="w-full h-full object-contain brightness-0" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight">CafeMate</span>
        </div>

        <nav className="flex-1 space-y-3">
          <button className="w-full flex items-center gap-4 bg-white/10 p-4 rounded-[1.5rem] font-bold text-lg">
            <Layout className="w-6 h-6" />
            Dashboard
          </button>
          <button 
            onClick={() => navigate('/editor')}
            className="w-full flex items-center gap-4 hover:bg-white/5 p-4 rounded-[1.5rem] font-bold text-lg transition-all text-cream/60 hover:text-cream"
          >
            <Edit3 className="w-6 h-6" />
            Menu Editor
          </button>
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 text-cream/40 hover:text-cream transition-all p-4 font-bold"
        >
          <LogOut className="w-6 h-6" />
          Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto no-scrollbar pb-24">
        {/* Header */}
        <header className="sticky top-0 z-30 px-8 py-8 md:px-12 md:py-10 bg-cream/80 backdrop-blur-xl flex justify-between items-center">
           <div className="reveal-up" style={{ opacity: 1, transform: 'none' }}>
              <h1 className="text-4xl md:text-5xl font-serif text-brown-dark">Morning, {auth.currentUser?.displayName?.split(' ')[0] || 'Guest'}</h1>
              <p className="text-text-muted mt-2 font-medium">Your digital experience is live.</p>
           </div>
           <div className="flex items-center gap-4">
              <button 
                onClick={() => window.open(shareUrl, '_blank')}
                className="hidden md:flex btn-secondary py-3 px-6 text-sm"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Menu
              </button>
              <div className="md:hidden">
                <button onClick={handleLogout} className="w-12 h-12 bg-brown-dark/5 rounded-full flex items-center justify-center text-brown-dark">
                  <LogOut className="w-6 h-6" />
                </button>
              </div>
           </div>
        </header>

        <div className="px-8 md:px-12 grid grid-cols-1 xl:grid-cols-12 gap-10">
           {/* QR Hero Section */}
           <div className="xl:col-span-7 space-y-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-tactile p-10 md:p-14 flex flex-col items-center text-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-green-accent opacity-20" />
                <h2 className="text-3xl md:text-4xl font-serif text-brown-dark mb-4">The Gateway</h2>
                <p className="text-text-muted mb-12 max-w-sm mx-auto">This QR code is the bridge between your physical space and your digital artisanal menu.</p>
                
                <div className="relative group">
                  <div className="absolute -inset-8 bg-brown-dark/5 rounded-[3.5rem] scale-95 group-hover:scale-100 transition-transform duration-700" />
                  <div className="bg-white p-10 rounded-[3rem] shadow-2xl relative z-10 border border-brown-dark/5">
                     <QRCodeSVG 
                      id="qr-code-svg"
                      value={shareUrl} 
                      size={280} 
                      level="H"
                      includeMargin={false}
                     />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 w-full mt-16 max-w-md">
                   <button 
                    onClick={downloadQR}
                    className="btn-primary flex-1 py-5 shadow-2xl shadow-brown-dark/20"
                   >
                      <Download className="w-5 h-5 mr-3" />
                      Download Assets
                   </button>
                   <button 
                    onClick={() => window.print()}
                    className="btn-secondary flex-1 py-5"
                   >
                      Print for Tables
                   </button>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="card-tactile p-8 bg-brown-dark text-cream relative overflow-hidden">
                  <div className="relative z-10">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cream/40 block mb-4">Quick Link</span>
                    <div className="flex items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                      <span className="text-sm font-medium truncate opacity-60">{shareUrl}</span>
                      <button onClick={copyToClipboard} className="text-xs font-bold uppercase tracking-widest hover:text-green-accent transition-colors">
                        {copySuccess ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <Coffee className="absolute -bottom-10 -right-10 w-40 h-40 text-cream/5 rotate-12" />
                </div>

                <div className="card-tactile p-8 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brown-dark/40 block mb-4">Analytics</span>
                    <h3 className="text-4xl font-serif text-brown-dark">128</h3>
                    <p className="text-sm text-text-muted mt-1">Scans this week</p>
                  </div>
                  <div className="flex items-center gap-2 text-green-accent font-bold text-xs mt-6">
                    <ArrowRight className="w-4 h-4 -rotate-45" />
                    +12% from last week
                  </div>
                </div>
              </div>

              {/* Pro Status Block */}
              <div className={cn(
                "card-tactile p-8 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6",
                (cafe as any)?.isPremium ? "bg-green-accent/10 border-green-accent/20" : 
                (cafe as any)?.upgradePending ? "bg-yellow-500/10 border-yellow-500/20" : "bg-brown-dark/5"
              )}>
                 <div>
                    <h3 className="text-xl font-serif text-brown-dark mb-1">
                      {(cafe as any)?.isPremium ? 'The Roastery Plan' : (cafe as any)?.upgradePending ? 'Upgrade Processing' : 'The Soloist Plan'}
                    </h3>
                    <p className="text-sm text-text-muted">
                      {(cafe as any)?.isPremium ? 'Unlimited menu items & priority support active.' : 
                       (cafe as any)?.upgradePending ? 'Verifying GCash payment. This usually takes a few hours.' : 
                       'Limited to 10 menu items.'}
                    </p>
                 </div>
                 {!(cafe as any)?.isPremium && !(cafe as any)?.upgradePending && (
                   <button 
                    onClick={() => setIsUpgradeModalOpen(true)}
                    className="btn-primary px-8 py-3 whitespace-nowrap shadow-xl shadow-brown-dark/20"
                   >
                     Upgrade to Pro
                   </button>
                 )}
                 {(cafe as any)?.isPremium && (
                   <div className="px-4 py-2 bg-green-accent/20 text-green-accent rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                     <CheckCircle2 className="w-4 h-4" />
                     Active
                   </div>
                 )}
              </div>
           </div>

           {/* Preview Column */}
           <div className="xl:col-span-5">
              <div className="sticky top-40 flex flex-col items-center">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brown-dark/40 mb-8">Live Preview</div>
                
                {/* iPhone Mockup */}
                <div className="relative w-[320px] aspect-[9/19] bg-brown-dark rounded-[3.5rem] p-3 shadow-[0_50px_100px_-20px_rgba(44,26,14,0.3)] border-[8px] border-brown-dark">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-brown-dark rounded-b-2xl z-20" />
                  <div className="w-full h-full bg-cream rounded-[2.5rem] overflow-hidden relative">
                    <iframe 
                      src={shareUrl} 
                      className="w-full h-full border-none"
                      title="Menu Preview"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/editor')}
                  className="mt-10 btn-primary px-10 shadow-xl shadow-brown-dark/20"
                >
                  <Edit3 className="w-5 h-5 mr-3" />
                  Customize Menu
                </button>
              </div>
           </div>
        </div>

        {/* Progress Footer */}
        <section className="mt-24 px-8 md:px-12">
           <div className="max-w-4xl mx-auto">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-serif text-brown-dark">Your Setup Journey</h3>
                <span className="text-sm font-bold text-brown-dark/40">2 / 3 Steps Completed</span>
             </div>
             <div className="space-y-4">
                <ProgressItem title="Artisanal Cafe Profile" completed />
                <ProgressItem title="Digital Menu Curated" completed />
                <ProgressItem title="Print & Launch Experience" completed={false} />
             </div>
           </div>
        </section>
      </main>

      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
        onSubmit={handleUpgradeSubmit}
        isSubmitting={isSubmittingUpgrade}
      />
    </div>
  );
}

function ProgressItem({ title, completed }: { title: string; completed: boolean }) {
  return (
    <div className={cn(
      "p-6 rounded-[2rem] border transition-all flex items-center justify-between group",
      completed ? "bg-white border-brown-dark/5" : "bg-white/40 border-dashed border-brown-dark/10"
    )}>
       <div className="flex items-center gap-4">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
            completed ? "bg-green-accent text-white" : "bg-brown-dark/5 text-brown-dark/20"
          )}>
             {completed ? <CheckCircle2 className="w-6 h-6" /> : <div className="w-2 h-2 bg-current rounded-full" />}
          </div>
          <span className={cn(
            "font-bold tracking-tight",
            completed ? "text-brown-dark" : "text-brown-dark/40"
          )}>{title}</span>
       </div>
       {!completed && <ArrowRight className="w-5 h-5 text-brown-dark/20 group-hover:text-brown-dark group-hover:translate-x-1 transition-all" />}
    </div>
  );
}

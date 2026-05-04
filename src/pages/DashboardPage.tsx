import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Edit3, Share2, Download, ExternalLink, Coffee, LogOut, Layout } from 'lucide-react';
import { auth, logOut } from '../services/firebase';
import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Cafe } from '../types';
import { cn } from '../lib/utils';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(collection(db, 'cafes'), where('ownerId', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setCafe({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Cafe);
      } else {
        // Create initial cafe if not exists? For now just mock or navigate to setup
        setCafe({
          id: 'initial',
          ownerId: auth.currentUser?.uid || '',
          name: 'Your Cozy Cafe',
          slug: 'your-cozy-cafe',
          description: 'A beautiful place for coffee.'
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-brown-dark hidden md:flex flex-col p-6 text-cream">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-cream rounded-xl flex items-center justify-center">
            <Coffee className="text-brown-dark w-6 h-6" />
          </div>
          <span className="font-serif text-xl font-bold">CafeMate</span>
        </div>

        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-3 bg-white/10 p-3 rounded-xl font-medium">
            <Layout className="w-5 h-5" />
            Dashboard
          </button>
          <button 
            onClick={() => navigate('/editor')}
            className="w-full flex items-center gap-3 hover:bg-white/5 p-3 rounded-xl font-medium transition-colors"
          >
            <Edit3 className="w-5 h-5" />
            Menu Editor
          </button>
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 text-cream/40 hover:text-cream transition-colors p-3"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
           <div>
              <h1 className="text-4xl font-serif text-brown-dark">Dashboard</h1>
              <p className="text-text-muted">Welcome back, {auth.currentUser?.displayName?.split(' ')[0]}</p>
           </div>
           <div className="md:hidden">
              <button 
                onClick={handleLogout}
                className="w-10 h-10 bg-brown-dark/5 rounded-full flex items-center justify-center text-brown-dark"
              >
                <LogOut className="w-5 h-5" />
              </button>
           </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* QR Code Card */}
           <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-10 rounded-[3rem] shadow-sm border border-brown-dark/5 flex flex-col items-center text-center"
           >
              <h2 className="text-2xl font-serif text-brown-dark mb-2">My Menu QR Code</h2>
              <p className="text-sm text-text-muted mb-8 italic">Your gateway to a beautiful digital experience</p>
              
              <div className="bg-cream p-8 rounded-[2rem] mb-8 border border-brown-dark/5">
                 <QRCodeSVG 
                  id="qr-code-svg"
                  value={shareUrl} 
                  size={200} 
                  level="H"
                  includeMargin={false}
                  imageSettings={{
                    src: "https://www.google.com/favicon.ico", // Placeholder logo
                    x: undefined,
                    y: undefined,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                 />
              </div>

              <div className="flex gap-4 w-full">
                 <button 
                  onClick={downloadQR}
                  className="flex-1 flex items-center justify-center gap-2 bg-brown-dark text-white py-4 rounded-2xl font-medium hover:bg-brown-mid transition-colors"
                 >
                    <Download className="w-5 h-5" />
                    Download PNG
                 </button>
                 <button 
                  onClick={() => window.print()}
                  className="px-6 py-4 rounded-2xl border border-brown-dark/10 text-brown-dark hover:bg-brown-dark/5 transition-colors"
                 >
                    Print
                 </button>
              </div>
           </motion.div>

           {/* Quick Actions / Preview */}
           <div className="space-y-8">
              <div className="bg-brown-dark rounded-[3rem] p-10 text-cream relative overflow-hidden h-full flex flex-col justify-between">
                 <div className="relative z-10">
                    <h2 className="text-3xl font-serif mb-4">{cafe?.name}</h2>
                    <p className="text-cream/60 leading-relaxed mb-8 max-w-sm">
                       {cafe?.description}
                    </p>
                    <div className="flex flex-wrap gap-4">
                       <button 
                        onClick={() => navigate('/editor')}
                        className="bg-cream text-brown-dark px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-white transition-colors"
                       >
                          <Edit3 className="w-4 h-4" />
                          Edit Menu
                       </button>
                       <a 
                        href={`/menu/${cafe?.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-white/10 text-cream px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-white/20 transition-colors"
                       >
                          <ExternalLink className="w-4 h-4" />
                          Live Preview
                       </a>
                    </div>
                 </div>
                 
                 <div className="relative z-10 mt-12 bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                       <Share2 className="w-5 h-5 text-cream/40 flex-shrink-0" />
                       <span className="text-sm text-cream/60 truncate">{shareUrl}</span>
                    </div>
                    <button 
                      onClick={() => navigator.clipboard.writeText(shareUrl)}
                      className="text-xs uppercase tracking-widest font-bold text-cream hover:text-white"
                    >
                      Copy
                    </button>
                 </div>

                 {/* Decorative background element */}
                 <Coffee className="absolute -bottom-20 -right-20 w-80 h-80 text-cream/5 rotate-12" />
              </div>
           </div>
        </div>

        <section className="mt-16">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-serif text-brown-dark">Setup Progress</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ProgressCard title="Account Verified" completed />
              <ProgressCard title="Cafe Profile" completed />
              <ProgressCard title="Add 5+ Menu Items" completed={false} />
           </div>
        </section>
      </main>
    </div>
  );
}

function ProgressCard({ title, completed }: { title: string; completed: boolean }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-brown-dark/5 flex items-center justify-between">
       <span className="font-medium text-brown-dark">{title}</span>
       <div className={cn(
         "w-6 h-6 rounded-full flex items-center justify-center",
         completed ? "bg-green-accent text-white" : "border-2 border-brown-dark/10"
       )}>
          {completed && <div className="w-2 h-2 bg-white rounded-full" />}
       </div>
    </div>
  );
}

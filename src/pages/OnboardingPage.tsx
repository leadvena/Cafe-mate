import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Coffee, ArrowRight, Check, MapPin, Palette, Sparkles, Loader2 } from 'lucide-react';
import { db, auth } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { sendWelcomeEmail } from '../services/email';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    industry: 'Coffee & Roastery',
    theme: 'Artisanal'
  });
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        // If they aren't logged in, kick them back to the login page
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      if (!auth.currentUser) return;
      setIsSubmitting(true);
      try {
        // 1. Save Cafe to Firestore
        const cafeRef = await addDoc(collection(db, 'cafes'), {
          ownerId: auth.currentUser.uid,
          name: formData.name,
          location: formData.location,
          industry: formData.industry,
          theme: formData.theme,
          slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          isPremium: false,
          createdAt: new Date().toISOString()
        });

        // 2. Send Welcome Email via our Vercel Serverless Function
        if (auth.currentUser.email) {
          try {
             await sendWelcomeEmail(auth.currentUser.email, formData.name);
          } catch (e) {
             console.error("Welcome email failed, but cafe was created", e);
          }
        }

        // 3. Navigate to Dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Error creating cafe:', error);
        alert('Failed to create your workspace. Please try again.');
        setIsSubmitting(false);
      }
    }
  };

  const steps = [
    { title: 'The Identity', icon: Coffee },
    { title: 'The Vibe', icon: Palette },
    { title: 'The Craft', icon: Sparkles }
  ];

  return (
    <div className="min-h-[100dvh] bg-cream flex flex-col items-center justify-center p-6 overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-accent/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brown-dark/5 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-16 px-4">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${step > i + 1 ? 'bg-green-accent text-brown-dark' : step === i + 1 ? 'bg-brown-dark text-cream shadow-xl' : 'bg-white text-brown-dark/20'}`}>
                {step > i + 1 ? <Check className="w-6 h-6" /> : <s.icon className="w-6 h-6" />}
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-widest ${step === i + 1 ? 'text-brown-dark' : 'text-brown-dark/20'}`}>{s.title}</span>
            </div>
          ))}
          {/* Connecting Lines */}
          <div className="absolute top-6 left-0 w-full h-[2px] bg-brown-dark/5 -z-10" />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <h1 className="text-5xl font-serif text-brown-dark">What's your <span className="italic">Craft?</span></h1>
                <p className="text-text-muted">Tell us the name of your sanctuary.</p>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brown-dark/40 ml-2">Cafe Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. The Morning Bloom"
                    className="input-field text-xl font-serif"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-brown-dark/40 ml-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-brown-dark/20 w-5 h-5" />
                    <input 
                      type="text" 
                      placeholder="e.g. Manchester, UK"
                      className="input-field pl-16 text-lg"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <h1 className="text-5xl font-serif text-brown-dark">Pick a <span className="italic">Vibe.</span></h1>
                <p className="text-text-muted">How should your digital menu feel?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: 'Artisanal', desc: 'Warm, editorial, serif typography.', color: 'bg-cream' },
                  { name: 'Minimal', desc: 'Clean, spacious, modern sans.', color: 'bg-zinc-100' },
                  { name: 'Brutalist', desc: 'Bold, high-contrast, loud fonts.', color: 'bg-zinc-900 text-white' },
                  { name: 'Classic', desc: 'Timeless, elegant, dark accents.', color: 'bg-white' }
                ].map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => setFormData({...formData, theme: theme.name})}
                    className={`p-8 rounded-[2rem] border-2 text-left transition-all duration-300 ${formData.theme === theme.name ? 'border-brown-dark shadow-xl scale-105' : 'border-brown-dark/5 bg-white opacity-60 hover:opacity-100'}`}
                  >
                    <div className={`w-8 h-8 rounded-full mb-4 border border-brown-dark/10 ${theme.color}`} />
                    <h3 className="text-xl font-serif text-brown-dark">{theme.name}</h3>
                    <p className="text-xs text-text-muted mt-2">{theme.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 text-center"
            >
              <div className="space-y-4">
                <div className="w-24 h-24 bg-green-accent/10 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Sparkles className="w-12 h-12 text-green-accent" />
                </div>
                <h1 className="text-5xl font-serif text-brown-dark">Ready to <span className="italic">Launch?</span></h1>
                <p className="text-text-muted max-w-sm mx-auto">We're setting up your artisanal workspace. You're seconds away from your first QR code.</p>
              </div>

              <div className="card-tactile !p-8 bg-white border border-brown-dark/5 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-brown-dark/5 pb-4">
                  <span className="text-xs font-bold text-brown-dark/40 uppercase">Identity</span>
                  <span className="text-brown-dark font-serif text-lg">{formData.name || 'Untitled Cafe'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-brown-dark/5 pb-4">
                  <span className="text-xs font-bold text-brown-dark/40 uppercase">Aesthetic</span>
                  <span className="text-brown-dark font-serif text-lg">{formData.theme}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-16 flex justify-between items-center px-4">
          <button 
            onClick={() => setStep(Math.max(1, step - 1))}
            className={`text-sm font-bold text-brown-dark/40 uppercase tracking-widest hover:text-brown-dark transition-colors ${step === 1 ? 'invisible' : ''}`}
          >
            Back
          </button>
          <button 
            onClick={handleNext}
            disabled={(step === 1 && !formData.name) || isSubmitting}
            className="btn-primary group h-16 px-10 text-lg disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center min-w-[200px]"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {step === 3 ? 'Launch Workspace' : 'Continue'}
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

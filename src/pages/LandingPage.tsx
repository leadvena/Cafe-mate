import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Coffee, Zap, Smartphone, Globe } from 'lucide-react';
import { cn } from '../lib/utils';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 md:px-12 flex justify-between items-center backdrop-blur-sm bg-cream/50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brown-dark rounded-xl flex items-center justify-center">
            <Coffee className="text-cream w-6 h-6" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-brown-dark">CafeMate</span>
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="text-brown-dark font-medium hover:opacity-70 transition-opacity"
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-6xl md:text-8xl font-serif text-brown-dark leading-[0.9] mb-8">
              Turn your menu <br />
              <span className="text-green-accent italic">into an experience.</span>
            </h1>
            <p className="text-xl text-text-muted mb-10 max-w-md leading-relaxed">
              Beautiful digital menus for modern cafes. No apps, no downloads, just a gorgeous experience in 5 minutes.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="group flex items-center gap-3 bg-brown-dark text-white px-10 py-5 rounded-full text-lg font-medium shadow-xl hover:bg-brown-mid transition-colors"
            >
              Create your free menu
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl border-[8px] border-brown-dark/5 aspect-[3/4]">
              <img 
                src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop" 
                alt="Cafe Interior"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/40 to-transparent" />
            </div>
            {/* Phone Float Mockup */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-10 -right-4 md:-right-10 z-20 w-48 md:w-64 aspect-[9/19] bg-white rounded-[2rem] shadow-2xl border-4 border-brown-dark p-2 overflow-hidden"
            >
               <div className="w-full h-full bg-cream rounded-[1.5rem] overflow-hidden relative">
                  <div className="absolute top-0 left-0 right-0 h-16 bg-brown-dark flex items-center justify-center">
                    <span className="text-cream font-serif text-sm">Morning Brew</span>
                  </div>
                  <div className="pt-20 px-3 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-2">
                        <div className="w-12 h-12 bg-brown-dark/5 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <div className="h-2 w-full bg-brown-dark/10 rounded" />
                          <div className="h-2 w-1/2 bg-brown-dark/5 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-brown-dark/5 bg-white/30">
        <div className="max-w-7xl mx-auto px-6 overflow-hidden">
          <p className="text-center text-sm font-medium text-text-muted uppercase tracking-[0.2em] mb-8">
            Trusted by artisanal cafes worldwide
          </p>
          <div className="flex justify-center flex-wrap gap-8 md:gap-20 items-center opacity-40 grayscale">
             <span className="font-serif text-2xl">Manila</span>
             <span className="font-serif text-2xl">Melbourne</span>
             <span className="font-serif text-2xl">London</span>
             <span className="font-serif text-2xl">Tokyo</span>
             <span className="font-serif text-2xl">Berlin</span>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-section px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <BenefitCard 
            icon={<Zap className="w-8 h-8" />}
            title="Blazing Fast"
            description="Set up your entire menu and generate your QR code in under 5 minutes. No technical skills required."
          />
          <BenefitCard 
            icon={<Smartphone className="w-8 h-8" />}
            title="Mobile First"
            description="Our menus are designed for the vertical screen. Immersive, intuitive, and stunningly beautiful."
          />
          <BenefitCard 
            icon={<Globe className="w-8 h-8" />}
            title="No App Needed"
            description="Customers just scan and view. No friction, no downloads, just happy customers ordering more."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 md:px-12 border-t border-brown-dark/5 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="font-serif text-3xl font-bold text-brown-dark">CafeMate</div>
          <p className="text-text-muted max-w-sm">
            Elevating the cafe experience, one scan at a time.
          </p>
          <div className="flex gap-8 text-sm font-medium text-brown-dark">
            <a href="#" className="hover:opacity-70">Privacy</a>
            <a href="#" className="hover:opacity-70">Terms</a>
            <a href="#" className="hover:opacity-70">Contact</a>
          </div>
          <p className="text-xs text-text-muted mt-8">
            &copy; 2026 CafeMate. Made for coffee lovers.
          </p>
        </div>
      </footer>
    </div>
  );
}

function BenefitCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="p-8 bg-white rounded-3xl border border-brown-dark/5 shadow-sm"
    >
      <div className="w-14 h-14 bg-brown-dark/5 rounded-2xl flex items-center justify-center text-brown-dark mb-6">
        {icon}
      </div>
      <h3 className="text-2xl font-serif text-brown-dark mb-4">{title}</h3>
      <p className="text-text-muted leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

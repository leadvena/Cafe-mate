import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Coffee, Instagram, ArrowDown } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.from('.hero-title span', {
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.1,
        ease: 'expo.out',
      });

      gsap.from('.hero-sub', {
        y: 20,
        opacity: 0,
        duration: 1,
        delay: 0.5,
        ease: 'power3.out',
      });


    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative bg-cream">
      {/* Floating Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0, x: '-50%' }}
        animate={{ y: 0, opacity: 1, x: '-50%' }}
        transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-8 left-1/2 z-[999] w-[95%] max-w-5xl"
      >
        <div className="nav-pill glass-pill px-6 md:px-8 py-3 md:py-4 flex justify-between items-center rounded-full border border-brown-dark/10 shadow-2xl">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-brown-dark rounded-xl flex items-center justify-center shadow-lg">
              <Coffee className="text-cream w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="font-serif text-xl md:text-2xl font-bold tracking-tighter text-brown-dark">CafeMate</span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-sm font-semibold tracking-wide text-brown-dark/60">
            <a href="#experience" className="hover:text-brown-dark transition-colors uppercase">Experience</a>
            <a href="#pricing" className="hover:text-brown-dark transition-colors uppercase">Pricing</a>
            <a href="#faq" className="hover:text-brown-dark transition-colors uppercase">FAQ</a>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="bg-brown-dark text-cream px-6 md:px-8 py-2.5 md:py-3 rounded-full text-xs md:text-sm font-bold hover:bg-brown-mid transition-all active:scale-95 shadow-lg shadow-brown-dark/10"
          >
            <span className="hidden sm:inline">Get Started</span>
            <span className="sm:hidden">Join</span>
          </button>
        </div>
      </motion.nav>

      <main ref={containerRef} className="overflow-x-hidden w-full max-w-full">

      {/* Cinematic Hero */}
      <section ref={heroRef} className="min-h-[100dvh] flex flex-col items-center justify-center pt-40 pb-20 px-6 text-center">
        <div className="max-w-6xl">
          <h1 className="hero-title text-7xl md:text-[11rem] font-serif text-brown-dark mb-12 flex flex-col leading-[0.8] tracking-tighter">
            <span className="block overflow-hidden pb-4">Artisanal</span>
            <span className="block italic text-green-accent overflow-hidden pb-4">Digital Menus.</span>
          </h1>
          <p className="hero-sub text-lg md:text-3xl text-text-muted mb-16 max-w-3xl mx-auto leading-relaxed font-light">
            Elevate your cafe experience with high-end digital menus that customers love. No apps, zero friction, just pure craft.
          </p>
          <div className="hero-sub flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button 
              onClick={() => navigate('/login')}
              className="btn-primary group h-16 md:h-20 px-10 md:px-12 text-lg md:text-xl"
            >
              Build your menu
              <ArrowRight className="ml-4 w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
            <div className="flex items-center gap-4 md:gap-5 text-brown-dark/40 font-medium bg-white/50 px-5 md:px-6 py-3 rounded-full border border-brown-dark/5">
              <div className="flex -space-x-3 md:-space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-cream bg-brown-dark/10 overflow-hidden shadow-sm">
                    <img src={`https://picsum.photos/seed/cafe-${i}/100/100`} alt="Cafe Owner" />
                  </div>
                ))}
              </div>
              <span className="text-xs md:text-sm tracking-tight"><strong className="text-brown-dark">1,200+</strong> boutique cafes live</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Functional Showcase Section */}
      <section id="experience" className="py-40 px-6 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
          <div className="space-y-12">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-green-accent/10 text-green-accent text-xs font-bold uppercase tracking-widest">The Experience</span>
              <h2 className="text-5xl md:text-7xl font-serif text-brown-dark leading-[0.95]">Crafted for <br/><span className="italic">The Modern Guest.</span></h2>
              <p className="text-xl text-text-muted leading-relaxed max-w-lg">
                Your menu isn't just a list of items; it's the first taste of your brand. We make sure it's unforgettable.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-cream flex items-center justify-center">
                  <Coffee className="text-brown-dark w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-brown-dark">Stunning Visuals</h3>
                <p className="text-text-muted text-sm leading-relaxed">High-resolution photography and artisanal typography that reflects your craft.</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-cream flex items-center justify-center">
                  <Instagram className="text-brown-dark w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-brown-dark">Instant Share</h3>
                <p className="text-text-muted text-sm leading-relaxed">Customers can save their favorites and share table links with a single tap.</p>
              </motion.div>
            </div>
          </div>

          <div className="relative flex justify-center">
            {/* High-Fidelity Phone Chassis */}
            <div className="relative w-full max-w-[420px] aspect-[9/19] z-20 group">
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full relative"
              >
                {/* Physical Buttons */}
                <div className="absolute -left-1.5 top-32 w-1.5 h-16 bg-brown-dark rounded-l-lg shadow-inner" />
                <div className="absolute -left-1.5 top-52 w-1.5 h-12 bg-brown-dark rounded-l-lg shadow-inner" />
                <div className="absolute -left-1.5 top-68 w-1.5 h-12 bg-brown-dark rounded-l-lg shadow-inner" />
                <div className="absolute -right-1.5 top-48 w-1.5 h-24 bg-brown-dark rounded-r-lg shadow-inner" />

                {/* Main Frame */}
                <div className="w-full h-full bg-[#1c130d] rounded-[4rem] p-3 shadow-[0_80px_160px_-40px_rgba(44,26,14,0.5)] border-[1px] border-white/10 relative overflow-hidden">
                  {/* Screen */}
                  <div className="w-full h-full bg-cream rounded-[3.2rem] overflow-hidden relative flex flex-col shadow-inner">
                    {/* Glass Reflection Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none z-30" />
                    <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br from-white/5 via-transparent to-transparent rotate-12 pointer-events-none z-30" />

                    {/* Dynamic Island */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-[#1c130d] rounded-full z-40 flex items-center justify-end px-4 gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500/20" />
                      <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                    </div>

                    {/* Internal Simulated Menu UI */}
                    <div className="h-28 bg-brown-dark p-6 pt-12 flex flex-col justify-end">
                      <h4 className="text-cream font-serif text-2xl tracking-tight">The Roastery.</h4>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 bg-cream">
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                           <span className="text-[10px] font-bold text-green-accent uppercase tracking-widest bg-green-accent/5 px-3 py-1 rounded-full">New Batch</span>
                           <div className="h-px flex-1 bg-brown-dark/5" />
                        </div>

                      {[
                          { name: 'Oat Flat White', price: '185', desc: 'Double shot, Minor Figures' },
                          { name: 'Cold Brew', price: '210', desc: '12-hour immersion, floral' }
                        ].map((item, idx) => (
                          <motion.div 
                            key={idx}
                            whileHover={{ x: 5 }}
                            className="flex justify-between items-start group/item cursor-pointer"
                          >
                            <div>
                              <h5 className="font-bold text-brown-dark text-sm group-hover/item:text-green-accent transition-colors">{item.name}</h5>
                              <p className="text-[10px] text-text-muted mt-0.5">{item.desc}</p>
                            </div>
                            <span className="font-mono text-xs font-bold text-brown-dark/40">₱{item.price}</span>
                          </motion.div>
                        ))}
                      </div>

                      <div className="rounded-[2.5rem] overflow-hidden aspect-[4/3] shadow-2xl relative group/img">
                        <img 
                          src="https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop" 
                          className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-1000" 
                          alt="Coffee" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/40 to-transparent" />
                      </div>

                      <div className="space-y-6">
                        <div className="flex justify-between items-start group/item cursor-pointer">
                          <div>
                            <h5 className="font-bold text-brown-dark text-sm">Smashed Avocado</h5>
                            <p className="text-[10px] text-text-muted mt-0.5">Sourdough, chili, lime</p>
                          </div>
                          <span className="font-mono text-xs font-bold text-brown-dark/40">₱380</span>
                        </div>
                      </div>
                    </div>

                    {/* Guest Action Bar */}
                    <div className="h-20 bg-white/80 backdrop-blur-md border-t border-brown-dark/5 px-6 flex items-center justify-between">
                      <div className="w-10 h-10 rounded-full bg-brown-dark text-cream flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                        <Coffee className="w-5 h-5" />
                      </div>
                      <div className="h-10 px-6 rounded-full bg-brown-dark/5 flex items-center gap-2 border border-brown-dark/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-accent animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brown-dark/40">Table 04</span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-brown-dark/5 flex items-center justify-center text-brown-dark/20">
                        <Instagram className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Background Physical Shadows & Glow */}
              <div className="absolute -inset-20 bg-brown-dark/5 blur-[120px] -z-10 rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,_var(--color-green-accent)_0%,_transparent_70%)] opacity-10 blur-[100px] -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Premium Pricing Section */}
      <section id="pricing" className="py-40 px-6 bg-cream">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto text-center mb-24"
        >
          <h2 className="text-5xl md:text-8xl font-serif text-brown-dark mb-8 leading-[0.85] tracking-tighter">Choose your <br/><span className="italic">Pace.</span></h2>
          <p className="text-xl text-text-muted max-w-2xl mx-auto">Transparent pricing for roasteries of all scales. No hidden fees, just pure growth.</p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="card-tactile group !p-12 flex flex-col justify-between border-2 border-transparent hover:border-brown-dark/5">
            <div className="space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-serif text-brown-dark mb-2">The Soloist</h3>
                  <p className="text-text-muted text-sm uppercase tracking-widest font-bold">For single locations</p>
                </div>
                <div className="text-4xl font-serif text-brown-dark">Free</div>
              </div>
              <ul className="space-y-4 text-left">
                {["1 Digital Menu", "Unlimited Items", "QR Code Generator", "Standard Support"].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-brown-dark/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-brown-dark/20" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <button className="btn-secondary w-full mt-12 py-5 text-lg" onClick={() => navigate('/login')}>Start for Free</button>
          </div>

          <div className="card-tactile group !p-12 flex flex-col justify-between bg-brown-dark !text-cream relative overflow-hidden">
            <div className="absolute top-8 right-8 px-4 py-1 bg-green-accent rounded-full text-[10px] font-bold uppercase tracking-widest text-brown-dark">Most Popular</div>
            <div className="space-y-8 relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-serif mb-2">The Roastery</h3>
                  <p className="text-cream/40 text-sm uppercase tracking-widest font-bold">For expanding brands</p>
                </div>
                <div className="text-right">
                  <div className="flex items-end gap-3 justify-end">
                     <span className="text-4xl font-serif">₱599</span>
                     <span className="text-lg text-cream/30 line-through mb-1">₱1,499</span>
                  </div>
                  <div className="text-[10px] uppercase font-bold text-green-accent mt-1">Special Early Access</div>
                  <div className="text-[10px] uppercase font-bold text-cream/40">per month</div>
                </div>
              </div>
              <ul className="space-y-4 text-left">
                {["Unlimited Menus", "Multi-branch Dashboard", "Custom Branding", "Priority 1-on-1 Support", "Advanced Analytics"].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-cream/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-accent" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <button className="btn w-full mt-12 py-5 text-lg bg-green-accent text-brown-dark hover:bg-white transition-all relative z-10" onClick={() => navigate('/login')}>Go Professional</button>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-green-accent/10 blur-[80px] rounded-full" />
          </div>
        </div>
      </section>

      {/* Trust Testimonials */}
      <section className="py-40 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-1 space-y-8">
              <h2 className="text-5xl font-serif text-brown-dark leading-[0.95]">Join the <br/><span className="italic text-green-accent">Curious.</span></h2>
              <p className="text-text-muted">We help 1,200+ cafes around the world deliver a better menu experience.</p>
              <div className="pt-8">
                <div className="text-6xl font-serif text-brown-dark">4.9/5</div>
                <div className="text-sm font-bold text-brown-dark/30 uppercase tracking-tighter">Average Rating</div>
              </div>
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { name: "Julian Thorne", role: "Owner, Bloom Coffee", quote: "The most beautiful menu tool I've ever used. Our customers constanty compliment the design." },
                { name: "Elena Ross", role: "Head of Ops, Roost", quote: "Updating prices used to be a nightmare. Now it's a 30-second task that looks like a high-end app." }
              ].map((t, i) => (
                <div key={i} className="card-tactile !p-10 space-y-6">
                  <p className="text-xl italic text-brown-dark leading-relaxed">"{t.quote}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-brown-dark/5" />
                    <div>
                      <h4 className="font-bold text-brown-dark text-sm">{t.name}</h4>
                      <p className="text-xs text-text-muted">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Minimalist FAQ */}
      <section id="faq" className="py-40 px-6 bg-cream">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-serif text-brown-dark mb-20 text-center tracking-tighter">Common <span className="italic">Questions.</span></h2>
          <div className="space-y-16">
            {[
              { q: "Do I need to download an app?", a: "No. CafeMate works entirely in the browser. Customers just scan the QR code and see your menu instantly." },
              { q: "Can I use my own photos?", a: "Absolutely. We encourage high-quality photography to make your menu truly yours." },
              { q: "What if I change my prices?", a: "Just update them in the dashboard. Your printed QR codes stay exactly the same." }
            ].map((item, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-16 border-b border-brown-dark/5">
                <h3 className="text-xl font-bold text-brown-dark">{item.q}</h3>
                <p className="md:col-span-2 text-text-muted leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Massive CTA */}
      <section className="py-64 px-6 bg-brown-dark text-center overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--color-brown-mid)_0%,_transparent_70%)]" />
        </div>
        
        <div className="relative z-10">
          <h2 className="text-6xl md:text-9xl font-serif text-cream mb-16 leading-[0.8] tracking-tighter">
            Ready to <br />
            <span className="italic text-green-accent">transform?</span>
          </h2>
          <button 
            onClick={() => navigate('/login')}
            className="bg-cream text-brown-dark px-16 py-8 rounded-full text-2xl font-bold hover:bg-green-accent transition-all active:scale-95 shadow-2xl flex items-center gap-4 mx-auto"
          >
            Create your menu
            <ArrowRight className="w-8 h-8" />
          </button>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-24 px-6 border-t border-brown-dark/5 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20">
          <div className="col-span-2 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brown-dark rounded-xl flex items-center justify-center">
                <Coffee className="text-cream w-7 h-7" />
              </div>
              <span className="font-serif text-3xl font-bold tracking-tighter text-brown-dark">CafeMate</span>
            </div>
            <p className="text-text-muted max-w-sm">The digital menu platform for artisanal cafes, roasteries, and curious brands.</p>
          </div>
          
          <div className="space-y-6">
            <h5 className="font-bold text-brown-dark uppercase text-xs tracking-widest">Platform</h5>
            <div className="flex flex-col gap-4 text-sm text-text-muted">
              <a href="#experience" className="hover:text-brown-dark transition-colors">Experience</a>
              <a href="#pricing" className="hover:text-brown-dark transition-colors">Pricing</a>
              <a href="/login" className="hover:text-brown-dark transition-colors">Sign In</a>
            </div>
          </div>

          <div className="space-y-6">
            <h5 className="font-bold text-brown-dark uppercase text-xs tracking-widest">Connect</h5>
            <div className="flex flex-col gap-4 text-sm text-text-muted">
              <a href="#" className="hover:text-brown-dark transition-colors">Instagram</a>
              <a href="#" className="hover:text-brown-dark transition-colors">Twitter</a>
              <a href="#" className="hover:text-brown-dark transition-colors">Support</a>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-32 pt-12 border-t border-brown-dark/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-xs text-text-muted">
            &copy; 2026 CafeMate. All rights reserved. Crafted for the curious.
          </p>
          <div className="flex gap-8 text-xs text-text-muted/40 uppercase font-bold tracking-widest">
            <a href="#" className="hover:text-brown-dark">Privacy</a>
            <a href="#" className="hover:text-brown-dark">Terms</a>
          </div>
        </div>
      </footer>
    </main>
  </div>
);
}

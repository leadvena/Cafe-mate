import { motion } from 'motion/react';
import { Coffee, Mail, ArrowLeft } from 'lucide-react';
import { signInWithGoogle } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient background blur */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brown-mid/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-accent/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "expo.out" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="card-tactile bg-white shadow-2xl shadow-brown-dark/5">
          <div className="flex flex-col items-center mb-10 text-center">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="w-20 h-20 bg-brown-dark rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-brown-dark/20 p-4"
            >
              <img src="/favicon.svg" alt="CafeMate Logo" className="w-full h-full object-contain brightness-0 invert" />
            </motion.div>
            <h1 className="text-4xl font-serif text-brown-dark mb-3">Welcome Back</h1>
            <p className="text-text-muted text-balance px-4">Sign in to your artisanal dashboard and manage your digital experience.</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-4 bg-white border border-brown-dark/10 py-5 px-6 rounded-2xl font-bold text-brown-dark hover:bg-brown-dark/5 transition-all active:scale-[0.98] group"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" />
              Continue with Google
            </button>
            
            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-brown-dark/5"></span>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-bold text-text-muted/40 bg-white px-4">
                Or use email
              </div>
            </div>

            <div className="space-y-6">
               <div className="space-y-3">
                  <label className="text-[10px] font-bold text-brown-dark/40 uppercase tracking-[0.15em] ml-1">Email Address</label>
                  <div className="relative">
                     <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted/40" />
                     <input 
                      type="email" 
                      placeholder="e.g. brew@cafe.com" 
                      className="input-field pl-14"
                     />
                  </div>
               </div>
               <button className="btn-primary w-full py-5 text-lg shadow-xl shadow-brown-dark/20">
                 Continue with Email
               </button>
            </div>
          </div>

          <p className="mt-12 text-center text-[11px] text-text-muted/60 px-8 leading-relaxed">
            By continuing, you agree to CafeMate's <a href="#" className="underline hover:text-brown-dark transition-colors">Terms of Service</a> and <a href="#" className="underline hover:text-brown-dark transition-colors">Privacy Policy</a>.
          </p>
        </div>
      </motion.div>
      
      <motion.button 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={() => navigate('/')}
        className="mt-12 flex items-center gap-2 text-sm font-bold text-text-muted hover:text-brown-dark transition-all group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to home
      </motion.button>
    </div>
  );
}

import { motion } from 'motion/react';
import { Coffee, Mail } from 'lucide-react';
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
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-xl border border-brown-dark/5"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-brown-dark rounded-2xl flex items-center justify-center mb-6">
            <Coffee className="text-cream w-8 h-8" />
          </div>
          <h1 className="text-4xl font-serif text-brown-dark mb-2">Welcome to CafeMate</h1>
          <p className="text-text-muted">Sign in to manage your digital menu</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white border border-brown-dark/10 py-4 px-6 rounded-2xl font-medium hover:bg-brown-dark/5 transition-all active:scale-[0.98]"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>
          
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-brown-dark/5"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest text-text-muted bg-white px-4">
              Or
            </div>
          </div>

          <div className="space-y-4 opacity-50 cursor-not-allowed">
             <div className="space-y-2">
                <label className="text-xs font-medium text-brown-dark uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                   <input 
                    type="email" 
                    placeholder="name@cafe.com" 
                    disabled
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-brown-dark/10 bg-cream/30 focus:outline-none"
                   />
                </div>
             </div>
             <button disabled className="w-full bg-brown-dark text-white py-4 rounded-2xl font-medium">
               Continue with Email
             </button>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-text-muted px-6 leading-relaxed">
          By continuing, you agree to CafeMate's Terms of Service and Privacy Policy.
        </p>
      </motion.div>
      
      <button 
        onClick={() => navigate('/')}
        className="mt-8 text-sm text-text-muted hover:text-brown-dark transition-colors"
      >
        &larr; Back to home
      </button>
    </div>
  );
}

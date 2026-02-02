
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Loader2, ArrowRight } from 'lucide-react';

const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth(); // Check if already logged in

  // Local UI State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Auto-redirect if session exists
  useEffect(() => {
    if (!authLoading && session) {
      navigate('/hub');
    }
  }, [session, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    try {
      // REAL SUPABASE LOGIN
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (authError) {
        throw authError;
      }

      // Successful login will trigger AuthContext update, which triggers the useEffect redirect above.
      
    } catch (err: any) {
      console.error(err);
      setError('Błąd logowania. Sprawdź e-mail i hasło.');
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eeeef5] flex items-center justify-center p-6 bg-gradient-to-br from-slate-200 to-slate-100">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white">
        
        {/* Header */}
        <div className="p-8 bg-slate-900 text-white text-center">
            <h1 className="text-3xl font-display font-black mb-2">Panel Logowania</h1>
            <p className="text-slate-400 text-sm font-medium">MultiBajka Experience v2.5</p>
        </div>

        <div className="p-8 space-y-8">
            <form onSubmit={handleLogin} className="space-y-6">
                
                {/* Credentials */}
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">E-mail</label>
                        <input 
                            type="text" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 font-bold text-slate-700"
                            placeholder="twoj@email.pl"
                            autoComplete="username"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">Hasło</label>
                        <div className="relative">
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 font-bold text-slate-700"
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        </div>
                    </div>
                </div>

                {error && <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl text-center">{error}</div>}

                <button 
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {isLoggingIn ? <Loader2 className="animate-spin" /> : <><ArrowRight size={20} /> Zaloguj się</>}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default LoginView;

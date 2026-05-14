import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { LogIn, Bot, ShieldCheck, Lock, Mail, ChevronRight } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@tele-gateway.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiClient.post('/login', { email, password });
      login(response.data);
      toast.success('Access granted');
      navigate('/dashboard');
    } catch {
      toast.error('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 px-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-[480px] z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-indigo-600 rounded-[2rem] shadow-2xl shadow-indigo-500/40 mb-8 transform hover:rotate-6 transition-transform duration-500">
            <Bot size={48} className="text-white" />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-3">Tele-Gateway</h1>
          <p className="text-slate-400 font-medium tracking-wide">Secure Auction Automation Node</p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-10 border border-white/10 relative">
          <div className="absolute -top-px left-20 right-20 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Identity Terminal</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  type="email"
                  className="w-full pl-12 pr-5 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-300 text-white placeholder:text-slate-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@terminal.access"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Access Key</label>
                <a href="#" className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-tighter">Request Recovery</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  type="password"
                  className="w-full pl-12 pr-5 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-300 text-white placeholder:text-slate-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 group"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={20} />
                  <span className="uppercase tracking-widest text-sm">Initialize Session</span>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5">
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">
              <ShieldCheck size={14} className="text-indigo-500" />
              End-to-End Encrypted Access
            </div>
          </div>
        </div>
        
        <p className="text-center mt-10 text-slate-500 text-xs font-medium tracking-wide">
          Protected by <span className="text-slate-300">Tele-Gateway Quantum</span> security protocols.
        </p>
      </div>
    </div>
  );
};

export default Login;

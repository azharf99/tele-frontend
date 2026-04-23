import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { LogIn, Bot, ShieldCheck } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@tele-gateway.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiClient.post('/login', { email, password });
      login(response.data);
      toast.success('Access granted');
      navigate('/');
    } catch {
      toast.error('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
      <div className="w-full max-w-[450px]">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-4xl shadow-xl shadow-indigo-200 mb-6 rotate-3">
            <Bot size={40} className="text-white -rotate-3" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Tele-Gateway</h1>
          <p className="text-slate-500 font-medium">Telegram Auction Automation Suite</p>
        </div>

        <div className="bg-white rounded-4xl shadow-2xl shadow-slate-200/60 p-10 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
              <input
                type="email"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tele-gateway.com"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Forgot?</a>
              </div>
              <input
                type="password"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 rounded-2xl shadow-lg shadow-slate-200 transition-all duration-200 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50">
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
              <ShieldCheck size={14} className="text-indigo-500" />
              Secure Control Node
            </div>
          </div>
        </div>
        
        <p className="text-center mt-10 text-slate-400 text-sm font-medium">
          Protected by end-to-end encryption.
        </p>
      </div>
    </div>
  );
};

export default Login;

import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import type { BotStatus } from '../types';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { 
  RefreshCcw, 
  Activity, 
  ShieldAlert, 
  Settings, 
  Pause, 
  Key,
  Smartphone,
  CheckCircle2,
  Zap,
  Cpu
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [status, setStatus] = useState<BotStatus>('IDLE');
  const [otpCode, setOtpCode] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { isAdmin, user } = useAuth();

  const fetchStatus = async () => {
    try {
      const response = await apiClient.get('/api/bot/status');
      setStatus(response.data.status);
      if (response.data.status === 'WAITING_OTP') {
        setShowOtpModal(true);
      } else {
        setShowOtpModal(false);
      }
    } catch (error) {
      console.error('Failed to fetch status', error);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/api/bot/otp', { code: otpCode });
      toast.success('System Linked');
      setShowOtpModal(false);
      setOtpCode('');
      fetchStatus();
    } catch {
      toast.error('Link Failed');
    }
  };

  const handleSyncGroups = async () => {
    setSyncing(true);
    try {
      await apiClient.post('/api/groups/sync');
      toast.success('Sync Complete');
    } catch {
      toast.error('Sync Error');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Console</h1>
        <p className="text-slate-500 font-medium mt-1">Real-time infrastructure and bot orchestration</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* Status Panel */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <Cpu size={120} />
            </div>
            
            <div className="flex justify-between items-center mb-10 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <Activity size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Core Status</h2>
              </div>
              <button 
                onClick={fetchStatus} 
                className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 transition-colors"
              >
                <RefreshCcw size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="bg-slate-900 rounded-4xl p-8 flex items-center gap-6 shadow-xl shadow-slate-900/10">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  status === 'RUNNING' ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20' :
                  status === 'WAITING_OTP' ? 'bg-amber-400 text-slate-900 shadow-lg shadow-amber-400/20' :
                  'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                }`}>
                  {status === 'RUNNING' ? <Zap size={28} fill="currentColor" /> : 
                   status === 'WAITING_OTP' ? <Key size={28} /> : 
                   <Pause size={28} fill="currentColor" />}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Active State</p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-white">{status.replace('_', ' ')}</span>
                    {status === 'RUNNING' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-4xl p-8 border border-slate-200/60">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Node Health</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-600">Telegram Cluster</span>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">ONLINE</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-600">Event Listener</span>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">STABLE</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`mt-10 p-5 rounded-2xl flex gap-4 border transition-colors ${
              status === 'RUNNING' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' :
              status === 'WAITING_OTP' ? 'bg-amber-50 border-amber-100 text-amber-700' :
              'bg-slate-100 border-slate-200 text-slate-600'
            }`}>
              <ShieldAlert className="shrink-0" size={24} />
              <div className="text-sm font-bold leading-relaxed">
                {status === 'RUNNING' ? 'System fully authorized. Real-time keyword monitors are synchronized across all target nodes.' :
                 status === 'WAITING_OTP' ? 'External authorization required. Telegram cloud instance is awaiting secure verification code.' :
                 'Infrastructure dormant. Active bidding services are offline until the core engine is re-engaged.'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-4xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-between group cursor-default">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Capture Count</p>
                <p className="text-4xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">128</p>
              </div>
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <CheckCircle2 size={32} />
              </div>
            </div>
            <div className="bg-white p-8 rounded-4xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-between group cursor-default">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Connected Channels</p>
                <p className="text-4xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">4</p>
              </div>
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                <Activity size={32} />
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-slate-900 p-2.5 rounded-xl text-white">
                <Settings size={22} />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">System Controls</h2>
            </div>
            
            <div className="space-y-4">
              {isAdmin && (
                <button 
                  onClick={handleSyncGroups} 
                  disabled={syncing}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-3xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  <RefreshCcw className={syncing ? 'animate-spin' : ''} size={20} />
                  <span>{syncing ? 'RE-SYNCING' : 'FORCE RE-SYNC'}</span>
                </button>
              )}
              <button className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-4 rounded-3xl transition-all flex items-center justify-center gap-2">
                <Activity size={18} />
                <span>EXPORT TELEMETRY</span>
              </button>
              <button className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-black py-4 rounded-3xl transition-all flex items-center justify-center gap-2">
                <ShieldAlert size={18} />
                <span>TERMINATE SESSIONS</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl shadow-indigo-900/20 text-white border-t-4 border-indigo-500">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-slate-800 p-2.5 rounded-xl text-indigo-400">
                <Cpu size={22} />
              </div>
              <h2 className="text-xl font-black tracking-tight">Access Token</h2>
            </div>
            <div className="space-y-5">
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Operator</span>
                <span className="text-sm font-bold text-indigo-100">{user?.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Authorization</span>
                <span className="text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full uppercase tracking-widest">{user?.role}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Instance ID</span>
                <span className="text-[10px] font-mono font-bold text-slate-600">X-TG-NODE-A4</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 flex items-center justify-center p-6 z-100 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-12 w-full max-w-xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-0 w-full h-3 bg-linear-to-r from-indigo-500 via-purple-500 to-rose-500" />
            
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-indigo-50 rounded-[2.5rem] text-indigo-600 mb-6 shadow-inner">
                <Smartphone size={40} strokeWidth={2.5} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Authorize Node</h2>
              <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">Enter the 2FA synchronization code from your Telegram mobile application.</p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-10">
              <div className="relative">
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="0 0 0 0 0"
                  required
                  autoFocus
                  className="w-full text-center text-5xl tracking-[0.8rem] font-black py-10 bg-slate-50 border-2 border-slate-100 rounded-4xl focus:border-indigo-500 focus:bg-white outline-none transition-all duration-300 text-slate-900 placeholder:opacity-20"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button type="submit" className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black py-6 rounded-3xl shadow-xl shadow-slate-200 transition-all active:scale-[0.98]">
                  VERIFY IDENTITY
                </button>
                <button type="button" onClick={() => setShowOtpModal(false)} className="px-10 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-6 rounded-3xl transition-all">
                  DISMISS
                </button>
              </div>
            </form>

            <div className="mt-10 flex items-center justify-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
              <ShieldAlert size={14} />
              Time-sensitive secure request
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

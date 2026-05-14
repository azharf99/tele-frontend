import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import type { BotStatus } from '../types';
import toast from 'react-hot-toast';
import { 
  RefreshCcw, 
  Activity, 
  ShieldAlert, 
  Settings, 
  Pause, 
  Key,
  Smartphone,
  Zap,
  Cpu,
  Server,
  Network,
  Clock,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  List,
  ShieldCheck
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [status, setStatus] = useState<BotStatus>('IDLE');
  const [otpCode, setOtpCode] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await apiClient.get('/bot/status');
      setStatus(response.data.status);
      if (response.data.status === 'WAITING_OTP') {
        setShowOtpModal(true);
      } else {
        setShowOtpModal(false);
      }
    } catch (error) {
      console.error('Failed to fetch status', error);
      setStatus('WAITING_OTP');
      setShowOtpModal(true);
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
      await apiClient.post('/bot/otp', { code: otpCode });
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
      await apiClient.post('/groups/sync');
      toast.success('Sync Complete');
    } catch {
      toast.error('Sync Error');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">System Console</h1>
          <p className="text-muted-foreground font-medium">Infrastructure monitoring and bot orchestration terminal.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSyncGroups}
            disabled={syncing}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 group"
          >
            {syncing ? <RefreshCcw size={16} className="animate-spin" /> : <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />}
            <span>Sync Network</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Status Panel */}
        <div className="lg:col-span-2 relative group">
          <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="bg-card glass rounded-[2.5rem] p-10 border border-border relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
              <Cpu size={180} />
            </div>
            
            <div className="flex justify-between items-start mb-12 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 ring-1 ring-indigo-500/20">
                  <Activity size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Core Status</h2>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Real-time Node Health</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3">Operating Mode</p>
                  <div className="flex items-center gap-3">
                    <span className={`text-4xl font-black tracking-tighter ${status === 'RUNNING' ? 'text-indigo-500' : 'text-amber-500'}`}>
                      {status}
                    </span>
                    {status === 'RUNNING' ? <Zap size={24} className="text-indigo-500 animate-pulse" /> : <Pause size={24} className="text-amber-500" />}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border/50">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Uptime Metrics</p>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-2xl font-black tracking-tight">14d 6h</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Active</p>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <div>
                      <p className="text-2xl font-black tracking-tight">99.98%</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Reliability</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/40 rounded-3xl p-6 border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server size={16} className="text-slate-500" />
                    <span className="text-xs font-bold text-slate-400">Node Latency</span>
                  </div>
                  <span className="text-xs font-black text-indigo-400">14ms</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full w-[85%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Network size={16} className="text-slate-500" />
                    <span className="text-xs font-bold text-slate-400">Memory Load</span>
                  </div>
                  <span className="text-xs font-black text-indigo-400">42%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full w-[42%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-indigo-600/30">
          <div className="absolute top-0 right-0 p-8 opacity-20 transform group-hover:rotate-12 transition-transform duration-700">
            <Zap size={120} />
          </div>
          
          <div className="relative z-10 h-full flex flex-col">
            <h3 className="text-xl font-black uppercase tracking-tight mb-2">Instant Operations</h3>
            <p className="text-indigo-100/70 text-sm font-medium mb-8">Execute core system commands with zero-latency protocols.</p>
            
            <div className="space-y-3 mt-auto">
              <button className="w-full py-4 px-6 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl flex items-center justify-between group/btn transition-all">
                <div className="flex items-center gap-3">
                  <Clock size={18} />
                  <span className="font-bold text-sm">Update Schedule</span>
                </div>
                <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
              <button className="w-full py-4 px-6 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl flex items-center justify-between group/btn transition-all">
                <div className="flex items-center gap-3">
                  <ShieldAlert size={18} />
                  <span className="font-bold text-sm">Security Audit</span>
                </div>
                <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
              <button className="w-full py-4 px-6 bg-white text-indigo-600 border border-white rounded-2xl flex items-center justify-between group/btn transition-all font-black uppercase tracking-widest text-xs">
                <div className="flex items-center gap-3">
                  <Settings size={18} />
                  <span>Configure Node</span>
                </div>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Rules', value: '12', icon: List, trend: '+2', trendUp: true },
          { label: 'Connected Groups', value: '42', icon: Network, trend: 'Stable', trendUp: true },
          { label: 'Processed Bids', value: '1,284', icon: Zap, trend: '+124', trendUp: true },
          { label: 'Security Threats', value: '0', icon: ShieldCheck, trend: 'None', trendUp: true },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border p-6 rounded-3xl hover:border-indigo-500/30 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-muted-foreground group-hover:bg-indigo-500/10 group-hover:text-indigo-500 transition-colors">
                <stat.icon size={20} />
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase ${stat.trendUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                {stat.trendUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {stat.trend}
              </div>
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
          <div className="bg-card border border-border w-full max-w-md rounded-[2.5rem] p-10 relative z-10 shadow-2xl">
            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-6 mx-auto ring-1 ring-amber-500/20">
              <Key size={32} />
            </div>
            <h3 className="text-2xl font-black text-center mb-2">Auth Link Required</h3>
            <p className="text-center text-muted-foreground font-medium mb-8">Enter the verification code from your Telegram mobile app to link this node.</p>
            
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Secure Code</label>
                <input
                  type="text"
                  className="w-full px-6 py-4 bg-muted border border-border rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-center text-2xl font-black tracking-[0.5em] placeholder:text-slate-700"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="00000"
                  maxLength={5}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2"
              >
                <Smartphone size={18} />
                <span>Link Terminal</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { 
  Bot, 
  Save, 
  Sparkles, 
  Info, 
  Clock, 
  MessageSquare,
  AlertCircle,
  Cpu,
  Zap,
  ShieldCheck,
  Terminal,
  BrainCircuit,
  Settings2,
  RefreshCcw
} from 'lucide-react';

const AISettings: React.FC = () => {
  const [systemPrompt, setSystemPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { isAdmin } = useAuth();

  const fetchAIContext = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/ai/context?key=system_prompt');
      setSystemPrompt(response.data.value || '');
    } catch (error) {
      console.error('Failed to fetch AI context', error);
      toast.error('Gagal mengambil data konteks AI.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAIContext();
    }
  }, [isAdmin]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.post('/ai/context', {
        key: 'system_prompt',
        value: systemPrompt
      });
      toast.success('AI Personality Updated.');
    } catch (error) {
      console.error('Failed to save AI context', error);
      toast.error('Failed to sync AI context.');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-rose-500/10 text-rose-500 rounded-[2rem] flex items-center justify-center ring-1 ring-rose-500/20">
          <AlertCircle size={48} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Access Restricted</h1>
          <p className="text-muted-foreground max-w-md font-medium">Only higher-level administrators can modify neural network parameters and AI response logic.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 text-foreground">AI Nexus Configuration</h1>
          <p className="text-muted-foreground font-medium">Define the core personality and instructional protocols for the Gemini neural model.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Model: Gemini 2.0 Pro</span>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* Main Prompt Card */}
          <div className="bg-card glass rounded-[3rem] p-10 border border-border relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
              <BrainCircuit size={200} />
            </div>
            
            <div className="flex items-center gap-4 mb-10 relative z-10">
              <div className="w-14 h-14 bg-indigo-500/10 rounded-[1.25rem] flex items-center justify-center text-indigo-500 ring-1 ring-indigo-500/20">
                <Sparkles size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">System Personality</h2>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Neural Instruction Set</p>
              </div>
            </div>

            {loading ? (
              <div className="h-96 flex flex-col items-center justify-center space-y-4">
                <Cpu size={48} className="animate-spin text-indigo-500" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Streaming Context...</p>
              </div>
            ) : (
              <div className="space-y-8 relative z-10">
                <div className="relative group/input">
                  <div className="absolute top-4 left-4 text-indigo-500/50">
                    <Terminal size={18} />
                  </div>
                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    className="w-full h-[450px] pl-12 pr-6 py-6 bg-muted border border-border rounded-[2rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300 font-mono text-sm leading-relaxed"
                    placeholder="Initialize neural personality here..."
                  />
                  <div className="absolute bottom-4 right-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Settings2 size={12} />
                    Context Length: {systemPrompt.length} tokens
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 px-12 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center gap-3 active:scale-[0.98] disabled:opacity-60 group/btn"
                  >
                    {saving ? <RefreshCcw size={20} className="animate-spin" /> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
                    <span className="uppercase tracking-widest text-sm">Commit to Neural Core</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Info Card */}
          <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-indigo-600/20">
            <div className="absolute top-0 right-0 p-8 opacity-20 transform group-hover:rotate-12 transition-transform duration-700">
              <Info size={120} />
            </div>
            <div className="relative z-10 flex gap-6">
              <div className="bg-white/10 p-4 rounded-2xl h-fit border border-white/10 backdrop-blur-md">
                <Zap size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-3">Contextual Engineering</h3>
                <p className="text-indigo-100 font-medium leading-relaxed max-w-2xl">
                  Provide specific directives regarding business identity, operational protocols, and preferred linguistic tone. 
                  The neural core will utilize this instruction set to autonomously orchestrate all incoming communications.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl shadow-indigo-900/20 text-white border-b-8 border-indigo-500">
            <div className="flex items-center gap-3 mb-10">
              <div className="bg-slate-800 p-2.5 rounded-xl text-indigo-400">
                <Clock size={22} />
              </div>
              <h2 className="text-xl font-black tracking-tight uppercase">Stream Pipeline</h2>
            </div>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-1.5 h-auto bg-gradient-to-b from-indigo-500 to-transparent rounded-full" />
                <div>
                  <p className="text-sm font-black uppercase tracking-widest text-indigo-400 mb-1">Debounce Protocol</p>
                  <p className="text-xs text-slate-400 leading-relaxed">System introduces a 60-second latency buffer post-message to ensure full conversational capture.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-1.5 h-auto bg-gradient-to-b from-emerald-500 to-transparent rounded-full" />
                <div>
                  <p className="text-sm font-black uppercase tracking-widest text-emerald-400 mb-1">Batch Serialization</p>
                  <p className="text-xs text-slate-400 leading-relaxed">Automated ingestion of up to 10 historical entries to maximize contextual accuracy.</p>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-800">
                <div className="flex items-center gap-2 text-indigo-400 mb-3">
                  <MessageSquare size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Execution Channel</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-white/5">
                  <span className="text-xs font-bold">Secure Private DM</span>
                  <ShieldCheck size={16} className="text-emerald-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-[2.5rem] p-8 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-16 h-16 bg-muted rounded-[1.25rem] flex items-center justify-center text-muted-foreground mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Bot size={32} />
            </div>
            <h4 className="font-black text-foreground uppercase tracking-tight">Gemini 1.5 Flash</h4>
            <p className="text-[10px] text-muted-foreground mt-2 font-black uppercase tracking-widest">High-Efficiency Protocol Enabled</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISettings;

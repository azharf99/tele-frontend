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
  AlertCircle
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
      toast.success('System prompt berhasil diperbarui.');
    } catch (error) {
      console.error('Failed to save AI context', error);
      toast.error('Gagal menyimpan konteks AI.');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center">
          <AlertCircle size={40} />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Akses Ditolak</h1>
        <p className="text-slate-500 max-w-md">Hanya Administrator yang dapat mengakses dan mengelola pengaturan AI.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">AI Gateway Configuration</h1>
        <p className="text-slate-500 font-medium mt-1">Manage Gemini AI personality and response logic for private messages</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
                <Sparkles size={22} />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">System Prompt</h2>
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Instructional Context</label>
                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    className="w-full h-80 p-6 bg-slate-50 border-2 border-slate-100 rounded-4xl focus:border-indigo-500 focus:bg-white outline-none transition-all duration-300 text-slate-700 leading-relaxed font-medium"
                    placeholder="Contoh: Kamu adalah asisten yang ramah dan siap membantu pelanggan..."
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-10 rounded-3xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-3 active:scale-[0.98] disabled:opacity-60"
                  >
                    <Save size={20} />
                    <span>{saving ? 'SAVING...' : 'SAVE CONFIGURATION'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-indigo-50 rounded-[2.5rem] p-10 border border-indigo-100">
            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-2xl text-indigo-600 shadow-sm">
                <Info size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-2">Pro-tip: Contextual Engineering</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  Berikan instruksi spesifik mengenai nama bisnis Anda, layanan yang ditawarkan, dan nada bicara yang diinginkan (formal/santai). 
                  AI akan menggunakan konteks ini untuk menjawab setiap DM yang masuk secara otomatis.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl shadow-indigo-900/20 text-white border-t-4 border-indigo-500">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-slate-800 p-2.5 rounded-xl text-indigo-400">
                <Clock size={22} />
              </div>
              <h2 className="text-xl font-black tracking-tight">Backend Queue</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-1 h-12 bg-indigo-500 rounded-full" />
                <div>
                  <p className="text-sm font-bold text-indigo-100">1 Minute Debounce</p>
                  <p className="text-xs text-slate-400 mt-1">Sistem menunggu jeda 1 menit setelah pesan terakhir sebelum merespons.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-1 h-12 bg-emerald-500 rounded-full" />
                <div>
                  <p className="text-sm font-bold text-emerald-100">Batch Processing</p>
                  <p className="text-xs text-slate-400 mt-1">Maksimal 10 pesan terakhir akan dikirimkan sekaligus ke AI untuk konteks penuh.</p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 text-indigo-400 mb-2">
                  <MessageSquare size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Target Channel</span>
                </div>
                <p className="text-sm font-bold">Private Chat (DMs Only)</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4">
              <Bot size={32} />
            </div>
            <h4 className="font-black text-slate-900">Gemini 1.5 Flash</h4>
            <p className="text-xs text-slate-500 mt-1">High-performance AI model enabled</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISettings;

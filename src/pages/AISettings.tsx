import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import type { TelegramAccount } from '../types';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import {
  Save,
  Sparkles,
  Clock,
  AlertCircle,
  Terminal,
  RefreshCcw,
  Smartphone,
} from 'lucide-react';

const AISettings: React.FC = () => {
  const [systemPrompt, setSystemPrompt] = useState('');
  const [accounts, setAccounts] = useState<TelegramAccount[]>([]);
  const [accountPrompts, setAccountPrompts] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [savingAccId, setSavingAccId] = useState<number | null>(null);
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      setLoading(true);
      try {
        const [ctxRes, accRes] = await Promise.all([
          apiClient.get('/ai/context?key=system_prompt').catch(() => ({ data: { value: '' } })),
          apiClient.get<TelegramAccount[]>('/accounts'),
        ]);
        setSystemPrompt(ctxRes.data?.value || '');
        const list = accRes.data ?? [];
        setAccounts(list);
        const promptMap: Record<number, string> = {};
        list.forEach((a) => {
          promptMap[a.id] = a.ai_system_prompt || '';
        });
        setAccountPrompts(promptMap);
      } catch {
        toast.error('Gagal mengambil pengaturan AI.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAdmin]);

  const handleSaveGlobal = async () => {
    setSavingGlobal(true);
    try {
      await apiClient.post('/ai/context', {
        key: 'system_prompt',
        value: systemPrompt,
      });
      toast.success('Global System Prompt diperbarui.');
    } catch {
      toast.error('Gagal menyimpan Global System Prompt.');
    } finally {
      setSavingGlobal(false);
    }
  };

  const handleSaveAccountPrompt = async (acc: TelegramAccount) => {
    setSavingAccId(acc.id);
    try {
      await apiClient.put(`/accounts/${acc.id}`, {
        ai_system_prompt: accountPrompts[acc.id] ?? '',
      });
      toast.success(`Prompt khusus untuk ${acc.name} disimpan.`);
    } catch {
      toast.error('Gagal menyimpan prompt akun.');
    } finally {
      setSavingAccId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <AlertCircle size={40} className="text-rose-500" />
        <h1 className="text-2xl font-black">Access Restricted</h1>
        <p className="text-sm text-muted-foreground">Hanya Admin yang dapat mengubah konfigurasi AI Assistant.</p>
      </div>
    );
  }

  const aiAccounts = accounts.filter((a) => a.enable_ai_gateway);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">AI Assistant Settings</h1>
          <p className="text-muted-foreground font-medium">
            Atur default system prompt global dan override prompt khusus per akun Telegram B2B (Private DM, 60s debounce).
          </p>
        </div>
        <span className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest w-fit">
          Model: gemini-3.1-flash-lite
        </span>
      </header>

      {loading ? (
        <div className="py-20 text-center">
          <RefreshCcw size={32} className="animate-spin text-indigo-500 mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            {/* Global System Prompt */}
            <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center">
                  <Sparkles size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-black">Global Default System Prompt</h2>
                  <p className="text-xs text-muted-foreground">Dipakai oleh semua akun AI DM yang tidak mengatur override prompt khusus.</p>
                </div>
              </div>

              <div className="relative">
                <Terminal size={16} className="absolute top-4 left-4 text-indigo-500/50" />
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={10}
                  className="w-full pl-11 pr-5 py-4 bg-muted border border-border rounded-2xl font-mono text-sm outline-none focus:border-indigo-500"
                  placeholder="Tulis instruksi asisten AI untuk membalas DM..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveGlobal}
                  disabled={savingGlobal}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={16} />
                  {savingGlobal ? 'Menyimpan...' : 'Simpan Global Prompt'}
                </button>
              </div>
            </div>

            {/* Per-Account Overrides */}
            <div className="space-y-4">
              <h3 className="text-lg font-black">Override Prompt per Akun AI DM ({aiAccounts.length})</h3>
              {aiAccounts.length === 0 ? (
                <div className="p-8 bg-card border border-border border-dashed rounded-3xl text-sm text-muted-foreground text-center">
                  Belum ada akun dengan toggle <strong>AI Assistant (Private DM)</strong> aktif. Aktifkan dari halaman Devices & Console.
                </div>
              ) : (
                aiAccounts.map((acc) => (
                  <div key={acc.id} className="bg-card border border-border rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone size={18} className="text-purple-400" />
                        <div>
                          <p className="font-black text-sm">{acc.name}</p>
                          <p className="text-xs font-mono text-muted-foreground">{acc.phone_number}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                        Kosong = pakai Global
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      value={accountPrompts[acc.id] ?? ''}
                      onChange={(e) => setAccountPrompts((p) => ({ ...p, [acc.id]: e.target.value }))}
                      placeholder="Override prompt khusus untuk akun ini (opsional)..."
                      className="w-full p-4 bg-muted border border-border rounded-2xl font-mono text-xs outline-none focus:border-indigo-500"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleSaveAccountPrompt(acc)}
                        disabled={savingAccId === acc.id}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
                      >
                        <Save size={14} />
                        {savingAccId === acc.id ? 'Menyimpan...' : 'Simpan Prompt Akun'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white border border-white/10 space-y-5">
              <div className="flex items-center gap-2 text-indigo-400">
                <Clock size={20} />
                <h3 className="font-black uppercase tracking-tight">Pipeline AI DM</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Antrean debounce (60 detik, maksimal 10 pesan per batch) sekarang terisolasi per pasangan <code>(account_id, sender_id)</code>.
                Akun khusus Lelang Kelas dengan AI DM nonaktif tidak akan pernah membalas DM secara otomatis.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISettings;

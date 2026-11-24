import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';
import type { AuctionStats, TelegramAccount, AccountStatus } from '../types';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  Plus,
  RefreshCcw,
  Smartphone,
  Zap,
  Play,
  Square,
  Trash2,
  Edit,
  Key,
  Lock,
  Sparkles,
  GraduationCap,
  Send,
  AlertTriangle,
  CheckCircle2,
  X,
  Star,
  Server,
} from 'lucide-react';

interface AccountFormState {
  name: string;
  phone_number: string;
  app_id: string;
  app_hash: string;
  two_fa_password: string;
  is_enabled: boolean;
  enable_b2b: boolean;
  is_default_b2b: boolean;
  enable_ai_gateway: boolean;
  enable_class_auction: boolean;
}

const emptyAccountForm: AccountFormState = {
  name: '',
  phone_number: '',
  app_id: '',
  app_hash: '',
  two_fa_password: '',
  is_enabled: true,
  enable_b2b: false,
  is_default_b2b: false,
  enable_ai_gateway: false,
  enable_class_auction: true,
};

const statusBadgeStyles: Record<AccountStatus, string> = {
  RUNNING: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  CONNECTING: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
  WAITING_OTP: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  WAITING_2FA: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  STOPPED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  ERROR: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
};

const Dashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const [accounts, setAccounts] = useState<TelegramAccount[]>([]);
  const [stats, setStats] = useState<AuctionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  // Add / Edit Account Modal
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<TelegramAccount | null>(null);
  const [form, setForm] = useState<AccountFormState>(emptyAccountForm);
  const [savingAccount, setSavingAccount] = useState(false);

  // OTP / 2FA Modal
  const [authModalAccount, setAuthModalAccount] = useState<TelegramAccount | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [twoFAPass, setTwoFAPass] = useState('');
  const [saveTwoFA, setSaveTwoFA] = useState(true);
  const [submittingAuth, setSubmittingAuth] = useState(false);

  // Quick B2B Test Send Modal
  const [showB2BModal, setShowB2BModal] = useState(false);
  const [b2bAccountId, setB2bAccountId] = useState<string>('0');
  const [b2bTargetType, setB2bTargetType] = useState<'chat_id' | 'username'>('username');
  const [b2bChatId, setB2bChatId] = useState('');
  const [b2bTopicId, setB2bTopicId] = useState('0');
  const [b2bUsername, setB2bUsername] = useState('');
  const [b2bMessage, setB2bMessage] = useState('');
  const [sendingB2B, setSendingB2B] = useState(false);

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [accRes, statsRes] = await Promise.all([
        apiClient.get<TelegramAccount[]>('/accounts'),
        apiClient.get<AuctionStats>('/auction/stats'),
      ]);
      const list = accRes.data ?? [];
      setAccounts(list);
      setStats(statsRes.data);
    } catch {
      if (!silent) toast.error('Gagal memuat daftar device Telegram.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll(false);
    const interval = setInterval(() => fetchAll(true), 5000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const openCreateModal = () => {
    setEditingAccount(null);
    setForm(emptyAccountForm);
    setShowAccountModal(true);
  };

  const openEditModal = (acc: TelegramAccount) => {
    setEditingAccount(acc);
    setForm({
      name: acc.name,
      phone_number: acc.phone_number,
      app_id: acc.app_id ? String(acc.app_id) : '',
      app_hash: '',
      two_fa_password: '',
      is_enabled: acc.is_enabled,
      enable_b2b: acc.enable_b2b,
      is_default_b2b: acc.is_default_b2b,
      enable_ai_gateway: acc.enable_ai_gateway,
      enable_class_auction: acc.enable_class_auction,
    });
    setShowAccountModal(true);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAccount(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        phone_number: form.phone_number.trim(),
        app_id: form.app_id.trim() ? Number(form.app_id.trim()) : 0,
        is_enabled: form.is_enabled,
        enable_b2b: form.enable_b2b || form.is_default_b2b,
        is_default_b2b: form.is_default_b2b,
        enable_ai_gateway: form.enable_ai_gateway,
        enable_class_auction: form.enable_class_auction,
      };
      if (form.app_hash.trim()) payload.app_hash = form.app_hash.trim();
      if (form.two_fa_password) payload.two_fa_password = form.two_fa_password;

      if (editingAccount) {
        await apiClient.put(`/accounts/${editingAccount.id}`, payload);
        toast.success('Akun diperbarui.');
      } else {
        const res = await apiClient.post<TelegramAccount>('/accounts', payload);
        toast.success('Akun ditambahkan. Jika perlu OTP, klik tombol Verifikasi pada kartu akun.');
        if (res.data.status === 'WAITING_OTP' || res.data.status === 'WAITING_2FA') {
          setAuthModalAccount(res.data);
        }
      }
      setShowAccountModal(false);
      await fetchAll(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Gagal menyimpan akun Telegram.');
    } finally {
      setSavingAccount(false);
    }
  };

  const handleStartStop = async (acc: TelegramAccount) => {
    setBusyId(acc.id);
    const isRunning = acc.status === 'RUNNING' || acc.status === 'CONNECTING' || acc.status === 'WAITING_OTP' || acc.status === 'WAITING_2FA';
    try {
      await apiClient.post(`/accounts/${acc.id}/${isRunning ? 'stop' : 'start'}`);
      toast.success(isRunning ? `${acc.name} dihentikan.` : `${acc.name} dijalankan.`);
      await fetchAll(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Gagal mengubah status akun.');
    } finally {
      setBusyId(null);
    }
  };

  const handleSyncGroups = async (acc: TelegramAccount) => {
    setBusyId(acc.id);
    try {
      const res = await apiClient.post(`/accounts/${acc.id}/groups/sync`);
      toast.success(`Sinkronisasi ${acc.name} selesai (${res.data.count ?? 0} grup).`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Gagal sync grup. Pastikan akun berstatus RUNNING.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteAccount = async (acc: TelegramAccount) => {
    if (!window.confirm(`Hapus akun "${acc.name}" (${acc.phone_number}) beserta seluruh konfigurasi lelang & grupnya?`)) return;
    setBusyId(acc.id);
    try {
      await apiClient.delete(`/accounts/${acc.id}`);
      toast.success('Akun dihapus.');
      await fetchAll(true);
    } catch {
      toast.error('Gagal menghapus akun.');
    } finally {
      setBusyId(null);
    }
  };

  const handleSubmitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authModalAccount) return;
    setSubmittingAuth(true);
    try {
      if (authModalAccount.status === 'WAITING_2FA') {
        await apiClient.post(`/accounts/${authModalAccount.id}/2fa`, {
          password: twoFAPass,
          save: saveTwoFA,
        });
        toast.success('Password 2FA dikirim.');
        setTwoFAPass('');
      } else {
        await apiClient.post(`/accounts/${authModalAccount.id}/otp`, { code: otpCode.trim() });
        toast.success('Kode OTP dikirim.');
        setOtpCode('');
      }
      setAuthModalAccount(null);
      setTimeout(() => fetchAll(true), 1500);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Verifikasi gagal.');
    } finally {
      setSubmittingAuth(false);
    }
  };

  const handleSendB2BTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingB2B(true);
    try {
      const payload: Record<string, unknown> = {
        message: b2bMessage,
      };
      if (Number(b2bAccountId) > 0) {
        payload.account_id = Number(b2bAccountId);
      }
      if (b2bTargetType === 'username') {
        payload.username = b2bUsername.trim();
      } else {
        payload.chat_id = Number(b2bChatId.trim());
        payload.topic_id = Number(b2bTopicId || '0');
      }
      await apiClient.post('/messages/send', payload);
      toast.success('Pesan B2B berhasil terkirim!');
      setB2bMessage('');
      setShowB2BModal(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Gagal mengirim pesan B2B.');
    } finally {
      setSendingB2B(false);
    }
  };

  const runningCount = accounts.filter((a) => a.status === 'RUNNING').length;
  const b2bAccounts = accounts.filter((a) => a.enable_b2b);
  const auctionAccounts = accounts.filter((a) => a.enable_class_auction);
  const needsAuthAccounts = accounts.filter((a) => a.status === 'WAITING_OTP' || a.status === 'WAITING_2FA');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Devices & Console</h1>
          <p className="text-muted-foreground font-medium">
            Kelola multi-akun Telegram: pisahkan device B2B / Watchdog / AI DM dengan device Lelang Kelas Algonova.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <>
              <button
                onClick={() => setShowB2BModal(true)}
                className="px-5 py-3 bg-card border border-border hover:border-indigo-500/50 text-foreground rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2"
              >
                <Send size={16} />
                <span>Test B2B Send</span>
              </button>
              <button
                onClick={openCreateModal}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
              >
                <Plus size={18} />
                <span>Tambah Akun Telegram</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Alert banner if any account awaits OTP or 2FA */}
      {isAdmin && needsAuthAccounts.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <Key size={20} />
            </div>
            <div>
              <p className="font-black text-sm text-amber-500">
                {needsAuthAccounts.length} Akun Menunggu Verifikasi Login Telegram
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                {needsAuthAccounts.map((a) => `${a.name} (${a.status})`).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setAuthModalAccount(needsAuthAccounts[0])}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest transition-all shrink-0"
          >
            Masukkan {needsAuthAccounts[0].status === 'WAITING_2FA' ? '2FA' : 'OTP'}
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Devices Running', value: `${runningCount} / ${accounts.length}`, icon: Smartphone, accent: 'text-emerald-500' },
          { label: 'B2B Gateways', value: String(b2bAccounts.length), icon: Server, accent: 'text-sky-500' },
          { label: 'Lelang Devices', value: String(auctionAccounts.length), icon: GraduationCap, accent: 'text-indigo-500' },
          {
            label: 'Bids Today / Avg Latency',
            value: stats ? `${stats.bids_today} · ${stats.avg_latency_ms}ms` : '0 · 0ms',
            icon: Zap,
            accent: 'text-amber-500',
          },
        ].map((item, idx) => (
          <div key={idx} className="bg-card border border-border p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</span>
              <item.icon size={18} className={item.accent} />
            </div>
            <p className="text-2xl font-black tracking-tight">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Devices Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-muted-foreground space-y-3">
          <RefreshCcw size={36} className="animate-spin text-indigo-500" />
          <p className="text-xs font-black uppercase tracking-widest">Memuat Devices...</p>
        </div>
      ) : accounts.length === 0 ? (
        <div className="py-24 bg-card border border-border border-dashed rounded-[2.5rem] text-center px-6 space-y-4">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground mx-auto">
            <Smartphone size={32} />
          </div>
          <h3 className="text-xl font-black">Belum Ada Akun Telegram Terhubung</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Tambahkan minimal 1 akun untuk B2B/Watchdog dan 1 akun terpisah untuk Lelang Kelas Algonova.
          </p>
          {isAdmin && (
            <button
              onClick={openCreateModal}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest"
            >
              Tambah Akun Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {accounts.map((acc) => {
            const isBusy = busyId === acc.id;
            const isActiveConn =
              acc.status === 'RUNNING' ||
              acc.status === 'CONNECTING' ||
              acc.status === 'WAITING_OTP' ||
              acc.status === 'WAITING_2FA';

            return (
              <div key={acc.id} className="bg-card border border-border rounded-[2rem] p-7 flex flex-col gap-5 hover:border-indigo-500/30 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      acc.status === 'RUNNING' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Smartphone size={22} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-lg truncate">{acc.name}</h3>
                        <span className="text-[10px] font-mono text-muted-foreground">#{acc.id}</span>
                      </div>
                      <p className="text-xs font-mono text-muted-foreground truncate">
                        {acc.phone_number}
                        {acc.telegram_username ? ` · @${acc.telegram_username}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shrink-0 ${statusBadgeStyles[acc.status]}`}>
                    {acc.status}
                  </span>
                </div>

                {/* Role / Capability Badges */}
                <div className="flex flex-wrap gap-2">
                  {acc.is_default_b2b && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-sky-500/15 text-sky-400 border border-sky-500/20">
                      <Star size={12} /> B2B Default
                    </span>
                  )}
                  {acc.enable_b2b && !acc.is_default_b2b && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-sky-500/10 text-sky-500 border border-sky-500/20">
                      <Server size={12} /> B2B API
                    </span>
                  )}
                  {acc.enable_ai_gateway && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Sparkles size={12} /> AI DM Assistant
                    </span>
                  )}
                  {acc.enable_class_auction && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <GraduationCap size={12} /> Lelang Kelas
                    </span>
                  )}
                  {!acc.enable_b2b && !acc.enable_ai_gateway && !acc.enable_class_auction && (
                    <span className="text-xs text-muted-foreground italic">Tidak ada fitur aktif</span>
                  )}
                </div>

                {acc.last_error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-start gap-2">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <span className="break-all">{acc.last_error}</span>
                  </div>
                )}

                {isAdmin && (
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border mt-auto">
                    {(acc.status === 'WAITING_OTP' || acc.status === 'WAITING_2FA') && (
                      <button
                        onClick={() => setAuthModalAccount(acc)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5"
                      >
                        {acc.status === 'WAITING_2FA' ? <Lock size={13} /> : <Key size={13} />}
                        {acc.status === 'WAITING_2FA' ? 'Input 2FA' : 'Input OTP'}
                      </button>
                    )}

                    <button
                      onClick={() => handleStartStop(acc)}
                      disabled={isBusy}
                      className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-all disabled:opacity-50 ${
                        isActiveConn
                          ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white'
                          : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                      }`}
                    >
                      {isActiveConn ? <Square size={13} /> : <Play size={13} />}
                      {isActiveConn ? 'Stop' : 'Start'}
                    </button>

                    <button
                      onClick={() => handleSyncGroups(acc)}
                      disabled={isBusy || acc.status !== 'RUNNING'}
                      className="px-4 py-2 bg-muted hover:bg-border text-foreground rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 disabled:opacity-40"
                    >
                      <RefreshCcw size={13} className={isBusy ? 'animate-spin' : ''} />
                      Sync Grup
                    </button>

                    <div className="ml-auto flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(acc)}
                        className="p-2 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white rounded-xl transition-all"
                        title="Edit Akun"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(acc)}
                        disabled={isBusy}
                        className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
                        title="Hapus Akun"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowAccountModal(false)} />
          <div className="bg-card border border-border w-full max-w-xl rounded-[2.5rem] p-8 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black tracking-tight">
                {editingAccount ? `Edit ${editingAccount.name}` : 'Tambah Akun Telegram'}
              </h2>
              <button onClick={() => setShowAccountModal(false)} className="p-2 rounded-xl hover:bg-muted">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nama Label Akun</label>
                  <input
                    type="text"
                    required
                    placeholder="mis. Akun Lelang Algonova"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-2xl text-sm font-bold outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nomor HP Telegram</label>
                  <input
                    type="text"
                    required
                    placeholder="+628123456789"
                    value={form.phone_number}
                    onChange={(e) => setForm((p) => ({ ...p, phone_number: e.target.value }))}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-2xl text-sm font-mono font-bold outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Capability Toggles */}
              <div className="p-5 bg-muted/40 border border-border rounded-2xl space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Peran & Fitur Akun</p>

                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <div>
                    <p className="text-sm font-bold">Lelang Kelas Algonova</p>
                    <p className="text-xs text-muted-foreground">Pantau grup/topic CS & auto-bid instan (0ms).</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.enable_class_auction}
                    onChange={(e) => setForm((p) => ({ ...p, enable_class_auction: e.target.checked }))}
                    className="w-5 h-5 accent-indigo-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between gap-3 cursor-pointer pt-2 border-t border-border/50">
                  <div>
                    <p className="text-sm font-bold">B2B Messaging & Watchdog</p>
                    <p className="text-xs text-muted-foreground">Izinkan pengiriman via POST /api/messages/send & alert watchdog.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.enable_b2b}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        enable_b2b: e.target.checked,
                        is_default_b2b: e.target.checked ? p.is_default_b2b : false,
                      }))
                    }
                    className="w-5 h-5 accent-sky-600 rounded"
                  />
                </label>

                {form.enable_b2b && (
                  <label className="flex items-center justify-between gap-3 cursor-pointer pl-4">
                    <span className="text-xs font-bold text-sky-400">Jadikan Default B2B Account (dipakai saat account_id kosong)</span>
                    <input
                      type="checkbox"
                      checked={form.is_default_b2b}
                      onChange={(e) => setForm((p) => ({ ...p, is_default_b2b: e.target.checked }))}
                      className="w-4 h-4 accent-sky-500 rounded"
                    />
                  </label>
                )}

                <label className="flex items-center justify-between gap-3 cursor-pointer pt-2 border-t border-border/50">
                  <div>
                    <p className="text-sm font-bold">AI Assistant (Private DM)</p>
                    <p className="text-xs text-muted-foreground">Auto-reply pesan pribadi dengan Gemini (60s debounce).</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.enable_ai_gateway}
                    onChange={(e) => setForm((p) => ({ ...p, enable_ai_gateway: e.target.checked }))}
                    className="w-5 h-5 accent-purple-600 rounded"
                  />
                </label>
              </div>

              {/* Optional 2FA & Custom API Credentials */}
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Kredensial Opsional (kosongkan untuk memakai default .env / input 2FA interaktif)
                </p>
                <input
                  type="password"
                  placeholder={editingAccount?.has_2fa_password ? 'Password 2FA tersimpan (isi untuk mengganti)' : 'Password 2FA Telegram (opsional)'}
                  value={form.two_fa_password}
                  onChange={(e) => setForm((p) => ({ ...p, two_fa_password: e.target.value }))}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-2xl text-sm outline-none focus:border-indigo-500"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Custom App ID (0 = default .env)"
                    value={form.app_id}
                    onChange={(e) => setForm((p) => ({ ...p, app_id: e.target.value }))}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-2xl text-sm font-mono outline-none focus:border-indigo-500"
                  />
                  <input
                    type="password"
                    placeholder={editingAccount?.has_custom_app_hash ? 'Custom App Hash tersimpan' : 'Custom App Hash (opsional)'}
                    value={form.app_hash}
                    onChange={(e) => setForm((p) => ({ ...p, app_hash: e.target.value }))}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-2xl text-sm font-mono outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="px-5 py-3 bg-muted rounded-2xl font-bold text-xs uppercase tracking-widest"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingAccount}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 size={16} />
                  {savingAccount ? 'Menyimpan...' : 'Simpan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OTP / 2FA Verification Modal */}
      {authModalAccount && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setAuthModalAccount(null)} />
          <div className="bg-card border border-border w-full max-w-md rounded-[2.5rem] p-8 relative z-10 shadow-2xl">
            <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-5 mx-auto">
              {authModalAccount.status === 'WAITING_2FA' ? <Lock size={28} /> : <Key size={28} />}
            </div>
            <h3 className="text-2xl font-black text-center mb-1">
              {authModalAccount.status === 'WAITING_2FA' ? 'Password 2FA Diperlukan' : 'Verifikasi OTP Telegram'}
            </h3>
            <p className="text-center text-xs text-muted-foreground font-medium mb-6">
              {authModalAccount.name} ({authModalAccount.phone_number})
            </p>

            <form onSubmit={handleSubmitAuth} className="space-y-5">
              {authModalAccount.status === 'WAITING_2FA' ? (
                <>
                  <input
                    type="password"
                    required
                    value={twoFAPass}
                    onChange={(e) => setTwoFAPass(e.target.value)}
                    placeholder="Masukkan password 2FA..."
                    className="w-full px-5 py-4 bg-muted border border-border rounded-2xl text-sm font-bold outline-none focus:border-indigo-500"
                  />
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveTwoFA}
                      onChange={(e) => setSaveTwoFA(e.target.checked)}
                      className="accent-indigo-600"
                    />
                    Simpan terenkripsi untuk restart berikutnya
                  </label>
                </>
              ) : (
                <input
                  type="text"
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="12345"
                  maxLength={8}
                  className="w-full px-5 py-4 bg-muted border border-border rounded-2xl text-center text-2xl font-black tracking-[0.4em] outline-none focus:border-indigo-500"
                />
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setAuthModalAccount(null)}
                  className="flex-1 py-3.5 bg-muted rounded-2xl font-bold text-xs uppercase tracking-widest"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={submittingAuth}
                  className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-50"
                >
                  {submittingAuth ? 'Mengirim...' : 'Kirim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick B2B Send Test Modal */}
      {showB2BModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowB2BModal(false)} />
          <div className="bg-card border border-border w-full max-w-lg rounded-[2.5rem] p-8 relative z-10 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black">Test B2B Send Message</h3>
              <button onClick={() => setShowB2BModal(false)} className="p-2 rounded-xl hover:bg-muted">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSendB2BTest} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Akun Pengirim B2B</label>
                <select
                  value={b2bAccountId}
                  onChange={(e) => setB2bAccountId(e.target.value)}
                  className="mt-1 w-full px-4 py-3 bg-muted border border-border rounded-2xl text-sm font-bold outline-none"
                >
                  <option value="0">Otomatis (Default B2B Account)</option>
                  {b2bAccounts.map((a) => (
                    <option key={a.id} value={String(a.id)}>
                      #{a.id} {a.name} ({a.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setB2bTargetType('username')}
                  className={`flex-1 py-2 rounded-xl text-xs font-black uppercase ${b2bTargetType === 'username' ? 'bg-indigo-600 text-white' : 'bg-muted text-muted-foreground'}`}
                >
                  @Username
                </button>
                <button
                  type="button"
                  onClick={() => setB2bTargetType('chat_id')}
                  className={`flex-1 py-2 rounded-xl text-xs font-black uppercase ${b2bTargetType === 'chat_id' ? 'bg-indigo-600 text-white' : 'bg-muted text-muted-foreground'}`}
                >
                  Chat ID / Topic
                </button>
              </div>

              {b2bTargetType === 'username' ? (
                <input
                  type="text"
                  required
                  placeholder="@username_tujuan"
                  value={b2bUsername}
                  onChange={(e) => setB2bUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-2xl text-sm font-mono outline-none"
                />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Chat / Group ID"
                    value={b2bChatId}
                    onChange={(e) => setB2bChatId(e.target.value)}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-2xl text-sm font-mono outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Topic ID (0 = General)"
                    value={b2bTopicId}
                    onChange={(e) => setB2bTopicId(e.target.value)}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-2xl text-sm font-mono outline-none"
                  />
                </div>
              )}

              <textarea
                required
                rows={3}
                placeholder="Isi pesan test B2B..."
                value={b2bMessage}
                onChange={(e) => setB2bMessage(e.target.value)}
                className="w-full px-4 py-3 bg-muted border border-border rounded-2xl text-sm outline-none resize-none"
              />

              <button
                type="submit"
                disabled={sendingB2B}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send size={15} />
                {sendingB2B ? 'Mengirim...' : 'Kirim Pesan B2B'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

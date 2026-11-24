import React, { useEffect, useMemo, useState, useCallback } from 'react';
import apiClient from '../api/client';
import type { TelegramAccount, TelegramGroup, TopicInfo } from '../types';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import {
  Copy,
  RefreshCcw,
  Search,
  Hash,
  Globe,
  ChevronRight,
  Layers,
  Info,
  ShieldCheck,
  Bot,
  Smartphone,
} from 'lucide-react';

const Groups: React.FC = () => {
  const [accounts, setAccounts] = useState<TelegramAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [groups, setGroups] = useState<TelegramGroup[]>([]);
  const [topics, setTopics] = useState<TopicInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const { isAdmin } = useAuth();

  const selectedGroup = useMemo(
    () => groups.find((group) => String(group.id) === selectedGroupId),
    [groups, selectedGroupId]
  );

  const fetchGroups = useCallback(async (accountId: number) => {
    setLoading(true);
    try {
      const response = await apiClient.get<TelegramGroup[]>(`/accounts/${accountId}/groups`);
      setGroups(response.data ?? []);
    } catch {
      toast.error('Gagal memuat daftar group.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const res = await apiClient.get<TelegramAccount[]>('/accounts');
        const list = res.data ?? [];
        setAccounts(list);
        if (list.length > 0) {
          setSelectedAccountId(list[0].id);
        } else {
          setLoading(false);
        }
      } catch {
        toast.error('Gagal memuat daftar akun Telegram.');
        setLoading(false);
      }
    };
    loadAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccountId !== null) {
      setSelectedGroupId('');
      setTopics([]);
      fetchGroups(selectedAccountId);
    }
  }, [selectedAccountId, fetchGroups]);

  const fetchTopics = async (accountId: number, groupId: string) => {
    setTopicsLoading(true);
    try {
      const response = await apiClient.get<TopicInfo[]>(`/accounts/${accountId}/groups/${groupId}/topics`);
      setTopics(response.data ?? []);
    } catch (error: unknown) {
      setTopics([]);
      const status = (error as { response?: { status: number } })?.response?.status;
      if (status === 503) {
        toast.error('Akun belum RUNNING. Selesaikan OTP/Start dulu.');
      } else {
        toast.error('Gagal memuat topics.');
      }
    } finally {
      setTopicsLoading(false);
    }
  };

  const handleSync = async () => {
    if (selectedAccountId === null) return;
    setSyncing(true);
    try {
      await apiClient.post(`/accounts/${selectedAccountId}/groups/sync`);
      toast.success('Sync grup selesai.');
      await fetchGroups(selectedAccountId);
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Sync gagal.');
    } finally {
      setSyncing(false);
    }
  };

  const handleSelectGroup = async (group: TelegramGroup) => {
    const gid = String(group.id);
    setSelectedGroupId(gid);
    if (group.type !== 'supergroup' || selectedAccountId === null) {
      setTopics([]);
      return;
    }
    await fetchTopics(selectedAccountId, gid);
  };

  const copyToClipboard = async (value: string | number, label: string) => {
    try {
      await navigator.clipboard.writeText(String(value));
      toast.success(`${label} disalin.`);
    } catch {
      toast.error('Gagal menyalin.');
    }
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.title.toLowerCase().includes(searchTerm.toLowerCase()) || String(group.id).includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Group Explorer</h1>
          <p className="text-muted-foreground font-medium">Jelajahi grup & forum topic untuk tiap akun Telegram yang terhubung.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {accounts.length > 0 && (
            <div className="flex items-center gap-2 bg-card border border-border rounded-2xl px-4 py-2">
              <Smartphone size={16} className="text-indigo-500" />
              <select
                value={selectedAccountId ?? ''}
                onChange={(e) => setSelectedAccountId(Number(e.target.value))}
                className="bg-transparent text-sm font-bold outline-none"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id} className="bg-slate-900 text-white">
                    {acc.name} ({acc.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          {isAdmin && selectedAccountId !== null && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
            >
              <RefreshCcw size={16} className={syncing ? 'animate-spin' : ''} />
              <span>{syncing ? 'Syncing...' : 'Sync Groups'}</span>
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 xl:col-span-4 space-y-5">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari grup atau ID..."
              className="w-full pl-12 pr-4 py-3.5 bg-card border border-border rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-card border border-border rounded-[2rem] overflow-hidden flex flex-col max-h-[600px]">
            <div className="p-4 bg-muted/30 border-b border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Grup Terdeteksi ({filteredGroups.length})
            </div>
            <div className="overflow-y-auto flex-1 divide-y divide-border">
              {loading ? (
                <div className="p-12 text-center space-y-3">
                  <RefreshCcw size={28} className="animate-spin text-indigo-500 mx-auto" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Memuat Grup...</p>
                </div>
              ) : filteredGroups.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground text-sm font-medium">
                  Belum ada grup. Klik Sync Groups terlebih dahulu.
                </div>
              ) : (
                filteredGroups.map((group) => {
                  const gid = String(group.id);
                  return (
                    <button
                      key={gid}
                      onClick={() => handleSelectGroup(group)}
                      className={`w-full text-left p-4 transition-all flex items-center gap-3 ${
                        selectedGroupId === gid ? 'bg-indigo-600/10' : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        selectedGroupId === gid ? 'bg-indigo-600 text-white' : 'bg-muted text-muted-foreground'
                      }`}>
                        {group.type === 'supergroup' ? <Layers size={18} /> : <Globe size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-sm truncate">{group.title}</p>
                          <ChevronRight size={14} className="text-muted-foreground shrink-0" />
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-black uppercase bg-muted px-2 py-0.5 rounded-full">{group.type}</span>
                          <span className="text-[10px] font-mono text-muted-foreground truncate">{gid}</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 xl:col-span-8">
          {selectedGroup ? (
            <div className="space-y-6">
              <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Bot size={160} />
                </div>
                <div className="relative z-10 space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <ShieldCheck size={12} /> {selectedGroup.type}
                  </div>
                  <h2 className="text-3xl font-black tracking-tight">{selectedGroup.title}</h2>
                  <div className="flex items-center gap-2 font-mono text-sm text-indigo-100/80">
                    <span>ID: {String(selectedGroup.id)}</span>
                    <button onClick={() => copyToClipboard(selectedGroup.id, 'Group ID')} className="p-1 hover:bg-white/10 rounded">
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash size={18} className="text-indigo-500" />
                    <h3 className="text-lg font-black">Forum Topics</h3>
                  </div>
                  {topics.length > 0 && (
                    <span className="bg-muted px-3 py-1 rounded-full text-[10px] font-black uppercase">{topics.length} Topics</span>
                  )}
                </div>

                {selectedGroup.type !== 'supergroup' ? (
                  <div className="p-10 bg-card border border-border border-dashed rounded-[2rem] text-center text-sm text-muted-foreground">
                    <Info size={24} className="mx-auto mb-2" />
                    Grup standar tidak mendukung Forum Topics (gunakan Topic ID = 0).
                  </div>
                ) : topicsLoading ? (
                  <div className="py-16 text-center">
                    <RefreshCcw size={28} className="animate-spin text-indigo-500 mx-auto" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {topics.map((topic) => (
                      <div key={topic.id} className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate">{topic.title}</p>
                          <p className="font-mono text-xs text-muted-foreground">Topic ID: {topic.id}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(topic.id, 'Topic ID')}
                          className="p-2.5 bg-muted hover:bg-indigo-600 hover:text-white rounded-xl transition-all"
                        >
                          <Copy size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="min-h-[420px] bg-card border border-border border-dashed rounded-[2.5rem] flex flex-col items-center justify-center text-center p-10">
              <Globe size={40} className="text-muted-foreground mb-4" />
              <h3 className="text-xl font-black mb-1">Pilih Grup</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Pilih grup di sisi kiri untuk menyalin Group ID atau memeriksa daftar Forum Topic-nya.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Groups;

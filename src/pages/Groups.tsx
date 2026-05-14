import React, { useEffect, useMemo, useState } from 'react';
import apiClient from '../api/client';
import type { TelegramGroup, TopicInfo } from '../types';
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
  Bot
} from 'lucide-react';

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<TelegramGroup[]>([]);
  const [topics, setTopics] = useState<TopicInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const { isAdmin } = useAuth();

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId),
    [groups, selectedGroupId]
  );

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/groups');
      setGroups(response.data);
    } catch {
      toast.error('Gagal memuat daftar group.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async (groupId: string) => {
    setTopicsLoading(true);
    try {
      const response = await apiClient.get(`/groups/${groupId}/topics`);
      setTopics(response.data ?? []);
    } catch (error: unknown) {
      setTopics([]);
      const axiosError = error as { response?: { status: number } };
      if (axiosError?.response?.status === 500) {
        toast.error('Bot belum running. Selesaikan OTP dulu.');
      } else {
        toast.error('Gagal memuat topics.');
      }
    } finally {
      setTopicsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await apiClient.post('/groups/sync');
      toast.success('Sync success.');
      await fetchGroups();
    } catch (error: unknown) {
      const axiosError = error as { response?: { status: number } };
      if (axiosError?.response?.status === 403) {
        toast.error('Akses ditolak.');
        return;
      }
      toast.error('Sync failed.');
    } finally {
      setSyncing(false);
    }
  };

  const handleSelectGroup = async (group: TelegramGroup) => {
    setSelectedGroupId(group.id);
    if (group.type !== 'supergroup') {
      setTopics([]);
      return;
    }
    await fetchTopics(group.id);
  };

  const copyToClipboard = async (value: string | number, label: string) => {
    try {
      await navigator.clipboard.writeText(String(value));
      toast.success(`${label} copied.`);
    } catch {
      toast.error(`Failed to copy.`);
    }
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.title.toLowerCase().includes(searchTerm.toLowerCase()) || group.id.includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Group Explorer</h1>
          <p className="text-muted-foreground font-medium">Investigate and monitor connected Telegram infrastructure.</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 group"
          >
            <RefreshCcw size={18} className={syncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
            <span>{syncing ? 'Syncing...' : 'Sync Groups'}</span>
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
        {/* Left Column: Group List */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <div className="relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search nodes..." 
              className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden flex flex-col max-h-[600px]">
            <div className="p-4 bg-muted/30 border-b border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Connected Clusters ({filteredGroups.length})
            </div>
            <div className="overflow-y-auto flex-1 divide-y divide-border">
              {loading ? (
                <div className="p-12 text-center space-y-3">
                  <RefreshCcw size={32} className="animate-spin text-indigo-500 mx-auto" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Scanning Network...</p>
                </div>
              ) : filteredGroups.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <p className="font-bold text-sm italic">No nodes detected.</p>
                </div>
              ) : (
                filteredGroups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => handleSelectGroup(group)}
                    className={`w-full text-left p-5 transition-all flex items-center gap-4 group/item ${
                      selectedGroupId === group.id
                        ? 'bg-indigo-600/5 dark:bg-indigo-600/10'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                      selectedGroupId === group.id
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                        : 'bg-muted text-muted-foreground group-hover/item:bg-indigo-100 group-hover/item:text-indigo-600'
                    }`}>
                      {group.type === 'supergroup' ? <Layers size={20} /> : <Globe size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`font-black text-sm truncate ${selectedGroupId === group.id ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>{group.title}</p>
                        <ChevronRight size={14} className={`transition-transform ${selectedGroupId === group.id ? 'translate-x-1 text-indigo-500' : 'opacity-0 group-hover/item:opacity-100'}`} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{group.type}</span>
                        <span className="text-[8px] font-mono text-muted-foreground truncate">{group.id}</span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Node Details */}
        <div className="lg:col-span-7 xl:col-span-8">
          {selectedGroup ? (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              {/* Header Info */}
              <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-600/20">
                <div className="absolute top-0 right-0 p-12 opacity-10 transform rotate-12 scale-150">
                  <Bot size={200} />
                </div>
                <div className="relative z-10">
                  <div className="flex flex-wrap items-start justify-between gap-6 mb-10">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.2em]">
                        <ShieldCheck size={12} />
                        Identity Verified
                      </div>
                      <h2 className="text-4xl font-black tracking-tighter">{selectedGroup.title}</h2>
                      <div className="flex items-center gap-3 font-mono text-sm text-indigo-100/70">
                        <span>{selectedGroup.id}</span>
                        <button 
                          onClick={() => copyToClipboard(selectedGroup.id, 'Group ID')}
                          className="p-1 hover:bg-white/10 rounded-md transition-colors"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-60">Status</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-sm font-black uppercase tracking-widest">Connected</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] mb-1 opacity-50">Type</p>
                      <p className="font-bold text-sm uppercase">{selectedGroup.type}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] mb-1 opacity-50">Protocol</p>
                      <p className="font-bold text-sm uppercase">MTProto v2.0</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] mb-1 opacity-50">Access Level</p>
                      <p className="font-bold text-sm uppercase">{isAdmin ? 'FULL ADMIN' : 'RESTRICTED'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Topics Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                      <Hash size={20} />
                    </div>
                    <h3 className="text-xl font-black tracking-tight">Stream Partitions (Topics)</h3>
                  </div>
                  {topics.length > 0 && (
                    <span className="bg-muted px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{topics.length} Detected</span>
                  )}
                </div>

                {selectedGroup.type !== 'supergroup' ? (
                  <div className="p-12 bg-card border border-border border-dashed rounded-[2.5rem] text-center">
                    <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground mx-auto mb-6">
                      <Info size={32} />
                    </div>
                    <p className="text-sm font-bold text-muted-foreground max-w-xs mx-auto italic">This node is a standard group and does not support multi-stream partitioning (Topics).</p>
                  </div>
                ) : topicsLoading ? (
                  <div className="py-20 text-center space-y-4">
                    <RefreshCcw size={32} className="animate-spin text-indigo-500 mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mapping Sub-streams...</p>
                  </div>
                ) : topics.length === 0 ? (
                  <div className="p-12 bg-card border border-border border-dashed rounded-[2.5rem] text-center">
                    <p className="text-sm font-bold text-muted-foreground italic">No active sub-streams (Topics) found for this cluster.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {topics.map((topic) => (
                      <div key={topic.id} className="bg-card border border-border p-6 rounded-[2rem] hover:border-indigo-500/30 transition-all group/topic flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-sm mb-1 truncate group-hover/topic:text-indigo-500 transition-colors">{topic.title}</p>
                          <p className="font-mono text-[10px] text-muted-foreground">ID: {topic.id}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(topic.id, 'Topic ID')}
                          className="w-10 h-10 bg-muted text-muted-foreground rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[500px] bg-card border border-border border-dashed rounded-[3rem] flex flex-col items-center justify-center text-center px-10">
              <div className="w-24 h-24 bg-muted rounded-[2.5rem] flex items-center justify-center text-muted-foreground mb-8">
                <Globe size={48} className="animate-pulse" />
              </div>
              <h3 className="text-2xl font-black mb-3">No Node Selected</h3>
              <p className="text-muted-foreground max-w-md font-medium">Initialize a session by selecting a cluster from the exploration terminal on the left to investigate its internal architecture.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Groups;

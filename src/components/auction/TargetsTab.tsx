import React, { useEffect, useMemo, useState } from 'react';
import apiClient from '../../api/client';
import type { AuctionType, TelegramGroup, TopicInfo, WatchedTarget } from '../../types';
import toast from 'react-hot-toast';
import { Globe, Hash, Plus, RefreshCcw, Trash2 } from 'lucide-react';

interface TargetsTabProps {
  accountId: number;
  targets: WatchedTarget[];
  groups: TelegramGroup[];
  isAdmin: boolean;
  onAddTarget: (payload: { group_id: number; topic_id: number; label: string; default_auction_type: AuctionType | ''; is_active: boolean }) => Promise<void>;
  onToggleTarget: (target: WatchedTarget) => Promise<void>;
  onDeleteTarget: (targetId: number) => Promise<void>;
  onSyncGroups: () => Promise<void>;
}

const TargetsTab: React.FC<TargetsTabProps> = ({
  accountId,
  targets,
  groups,
  isAdmin,
  onAddTarget,
  onToggleTarget,
  onDeleteTarget,
  onSyncGroups,
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [topicId, setTopicId] = useState(0);
  const [topics, setTopics] = useState<TopicInfo[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [defaultType, setDefaultType] = useState<AuctionType | ''>('');
  const [adding, setAdding] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const selectedGroup = useMemo(
    () => groups.find((g) => String(g.id) === selectedGroupId),
    [groups, selectedGroupId]
  );

  useEffect(() => {
    const loadTopics = async () => {
      if (!selectedGroupId || selectedGroup?.type !== 'supergroup') {
        setTopics([]);
        setTopicId(0);
        return;
      }
      setLoadingTopics(true);
      try {
        const res = await apiClient.get<TopicInfo[]>(`/accounts/${accountId}/groups/${selectedGroupId}/topics`);
        setTopics(res.data ?? []);
      } catch {
        setTopics([]);
        setTopicId(0);
      } finally {
        setLoadingTopics(false);
      }
    };
    loadTopics();
  }, [accountId, selectedGroupId, selectedGroup]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId) return;
    setAdding(true);
    try {
      const topicTitle = topics.find((t) => t.id === topicId)?.title;
      const label = selectedGroup
        ? topicId > 0 && topicTitle
          ? `${selectedGroup.title} / ${topicTitle}`
          : selectedGroup.title
        : `Group ${selectedGroupId}`;
      await onAddTarget({
        group_id: Number(selectedGroupId),
        topic_id: topicId,
        label,
        default_auction_type: defaultType,
        is_active: true,
      });
      setSelectedGroupId('');
      setTopicId(0);
      setDefaultType('');
    } finally {
      setAdding(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await onSyncGroups();
      toast.success('Daftar grup diperbarui.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-[2rem] p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black">Grup & Forum Topic Pantauan</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Hanya pesan dari grup/topic di bawah ini yang diproses oleh mesin Lelang Kelas (O(1) in-memory lookup).
            </p>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              className="px-4 py-2.5 bg-muted hover:bg-border rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shrink-0"
            >
              <RefreshCcw size={14} className={syncing ? 'animate-spin' : ''} />
              Sync Grup Akun
            </button>
          )}
        </div>

        {isAdmin && (
          <form onSubmit={handleAdd} className="p-4 bg-muted/40 border border-border rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="text-[10px] font-black uppercase text-muted-foreground">Grup Telegram</label>
              <select
                required
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="mt-1 w-full px-3 py-2.5 bg-card border border-border rounded-xl text-xs font-bold"
              >
                <option value="">Pilih Grup...</option>
                {groups.map((g) => (
                  <option key={String(g.id)} value={String(g.id)}>
                    {g.title} ({String(g.id)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-muted-foreground">Forum Topic</label>
              <select
                value={topicId}
                onChange={(e) => setTopicId(Number(e.target.value))}
                disabled={selectedGroup?.type !== 'supergroup' || loadingTopics}
                className="mt-1 w-full px-3 py-2.5 bg-card border border-border rounded-xl text-xs font-bold disabled:opacity-50"
              >
                <option value={0}>0 - Semua / General</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    #{t.id} - {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-muted-foreground">Hint Jenis (Opsional)</label>
              <select
                value={defaultType}
                onChange={(e) => setDefaultType(e.target.value as AuctionType | '')}
                className="mt-1 w-full px-3 py-2.5 bg-card border border-border rounded-xl text-xs font-bold"
              >
                <option value="">Auto-detect dari pesan</option>
                <option value="NEW">Default NEW</option>
                <option value="OTR">Default OTR</option>
                <option value="CU">Default CU / EC</option>
                <option value="FR">Default FR</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={adding}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Plus size={15} /> Tambah Target
            </button>
          </form>
        )}

        {targets.length === 0 ? (
          <p className="text-sm text-muted-foreground italic py-6 text-center">
            Belum ada grup pantauan. Sync grup lalu tambahkan grup/topic lelang Algonova di atas.
          </p>
        ) : (
          <div className="space-y-3">
            {targets.map((t) => (
              <div key={t.id} className="bg-muted/30 border border-border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center shrink-0">
                    {t.topic_id > 0 ? <Hash size={18} /> : <Globe size={18} />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-sm truncate">{t.label || `Group ${t.group_id}`}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      Group: {t.group_id} · {t.topic_id > 0 ? `Topic #${t.topic_id}` : 'Global Stream'}
                      {t.default_auction_type ? ` · Hint: ${t.default_auction_type}` : ''}
                    </p>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleTarget(t)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        t.is_active ? 'bg-emerald-500/15 text-emerald-500' : 'bg-slate-500/15 text-slate-400'
                      }`}
                    >
                      {t.is_active ? 'Aktif' : 'Paused'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteTarget(t.id)}
                      className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TargetsTab;

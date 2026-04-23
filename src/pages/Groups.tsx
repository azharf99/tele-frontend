import React, { useEffect, useMemo, useState } from 'react';
import apiClient from '../api/client';
import type { TelegramGroup, TopicInfo } from '../types';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { Copy, RefreshCcw } from 'lucide-react';

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
      const response = await apiClient.get(`/api/groups/${groupId}/topics`);
      setTopics(response.data ?? []);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response && error.response.status === 500) {
        setTopics([]);
        toast.error('Bot belum running. Selesaikan OTP dulu.');
      } else {
        setTopics([]);
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
      toast.success('Sinkronisasi groups berhasil.');
      await fetchGroups();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response && error.response.status === 403) {
        toast.error('Anda tidak punya akses untuk sync groups.');
        return;
      }
      toast.error('Sinkronisasi groups gagal.');
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
      toast.success(`${label} berhasil disalin.`);
    } catch {
      toast.error(`Gagal menyalin ${label}.`);
    }
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.title.toLowerCase().includes(searchTerm.toLowerCase()) || group.id.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Group Explorer</h1>
          <p className="text-slate-500">Pilih supergroup untuk melihat daftar topic dan copy ID dengan cepat.</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            <RefreshCcw size={16} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Sync...' : 'Sync Groups'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <input
            className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Cari group berdasarkan title/ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {loading ? (
            <p className="py-8 text-center text-slate-500">Memuat groups...</p>
          ) : filteredGroups.length === 0 ? (
            <p className="py-8 text-center text-slate-500">Group tidak ditemukan.</p>
          ) : (
            <div className="space-y-2">
              {filteredGroups.map((group) => (
                <div
                  key={group.id}
                  className={`rounded-xl border p-3 ${
                    selectedGroupId === group.id
                      ? 'border-indigo-300 bg-indigo-50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      className="text-left"
                      onClick={() => handleSelectGroup(group)}
                      type="button"
                    >
                      <p className="font-semibold text-slate-900">{group.title}</p>
                      <p className="text-xs text-slate-500">{group.type}</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(group.id, 'ID group')}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                    >
                      <Copy size={12} />
                      Copy ID
                    </button>
                  </div>
                  <p className="mt-2 font-mono text-xs text-slate-600">{group.id}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-900">Topics</h2>
          {!selectedGroup ? (
            <p className="mt-3 text-sm text-slate-500">Pilih group terlebih dahulu.</p>
          ) : selectedGroup.type !== 'supergroup' ? (
            <p className="mt-3 text-sm text-slate-500">
              Group terpilih bukan supergroup. Tidak memiliki daftar topic.
            </p>
          ) : topicsLoading ? (
            <p className="mt-3 text-sm text-slate-500">Memuat topics...</p>
          ) : topics.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">Tidak ada topic pada supergroup ini.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {topics.map((topic) => (
                <div key={topic.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                  <div>
                    <p className="font-medium text-slate-900">{topic.title}</p>
                    <p className="font-mono text-xs text-slate-600">{topic.id}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(topic.id, 'ID topic')}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                  >
                    <Copy size={12} />
                    Copy ID
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Groups;

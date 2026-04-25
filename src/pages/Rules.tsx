import React, { useEffect, useMemo, useState } from 'react';
import apiClient from '../api/client';
import type { BidRule, TelegramGroup, TopicInfo } from '../types';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle, Plus, Trash2, Edit } from 'lucide-react';

const Rules: React.FC = () => {
  const [rules, setRules] = useState<BidRule[]>([]);
  const [groups, setGroups] = useState<TelegramGroup[]>([]);
  const [topics, setTopics] = useState<TopicInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRule, setEditingRule] = useState<BidRule | null>(null);
  const { isAdmin } = useAuth();

  const [newRule, setNewRule] = useState({
    target_group_id: '',
    topic_id: 0,
    keyword: '',
    bid_message: '',
    stop_keywords: '',
    is_active: true,
    has_bidded: false,
  });

  const selectedGroup = useMemo(
    () => {
      console.log('=== selectedGroup useMemo called ===');
      console.log('newRule.target_group_id:', newRule.target_group_id);
      console.log('groups length:', groups.length);
      
      const group = groups.find((group) => {
        console.log('Comparing:', group.id, 'with', newRule.target_group_id, 'result:', String(group.id) === String(newRule.target_group_id));
        return String(group.id) === String(newRule.target_group_id);
      });
      
      console.log('Found group:', group);
      console.log('Group type:', group?.type);
      console.log('=== end selectedGroup useMemo ===');
      return group;
    },
    [groups, newRule.target_group_id]
  );

  const selectedEditGroup = useMemo(
    () => editingRule ? groups.find((group) => String(group.id) === String(editingRule.target_group_id)) : null,
    [groups, editingRule?.target_group_id]
  );

  const isSupergroupSelected = selectedGroup?.type === 'supergroup';
  console.log('isSupergroupSelected:', isSupergroupSelected);
  const isEditSupergroupSelected = selectedEditGroup?.type === 'supergroup';

  useEffect(() => {
    console.log('selectedGroup changed:', selectedGroup);
    console.log('newRule.target_group_id changed:', newRule.target_group_id);
    console.log('groups changed:', groups.length);
  }, [selectedGroup, newRule.target_group_id, groups]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rulesRes, groupsRes] = await Promise.all([
        apiClient.get('/rules'),
        apiClient.get('/groups'),
      ]);
      setRules(rulesRes.data);
      console.log('Groups data loaded:', groupsRes.data);
      setGroups(groupsRes.data);
    } catch {
      toast.error('Gagal memuat rules/groups.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchTopics = async () => {
      console.log('fetchTopics called:', { target_group_id: newRule.target_group_id, isSupergroupSelected });
      if (!newRule.target_group_id || !isSupergroupSelected) {
        console.log('Clearing topics - no group or not supergroup');
        setTopics([]);
        setNewRule((prev) => ({ ...prev, topic_id: 0 }));
        return;
      }

      setLoadingTopics(true);
      try {
        console.log('Fetching topics for group:', newRule.target_group_id);
        const response = await apiClient.get(`/groups/${newRule.target_group_id}/topics`);
        console.log('Topics response:', response.data);
        setTopics(response.data ?? []);
      } catch (error: unknown) {
        console.error('Error fetching topics:', error);
        setTopics([]);
        setNewRule((prev) => ({ ...prev, topic_id: 0 }));
        if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response && error.response.status === 500) {
          toast.error('Bot belum running. Selesaikan OTP dulu.');
        } else {
          toast.error('Gagal memuat topics.');
        }
      } finally {
        setLoadingTopics(false);
      }
    };

    fetchTopics();
  }, [newRule.target_group_id, isSupergroupSelected]);

  useEffect(() => {
    const fetchEditTopics = async () => {
      console.log('fetchEditTopics called:', { target_group_id: editingRule?.target_group_id, isEditSupergroupSelected });
      if (!editingRule?.target_group_id || !isEditSupergroupSelected) {
        console.log('Not fetching edit topics - no group or not supergroup');
        return;
      }

      setLoadingTopics(true);
      try {
        console.log('Fetching edit topics for group:', editingRule.target_group_id);
        const response = await apiClient.get(`/groups/${editingRule.target_group_id}/topics`);
        console.log('Edit topics response:', response.data);
        setTopics(response.data ?? []);
      } catch (error: unknown) {
        console.error('Error fetching edit topics:', error);
        setTopics([]);
        if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response && error.response.status === 500) {
          toast.error('Bot belum running. Selesaikan OTP dulu.');
        } else {
          toast.error('Gagal memuat topics.');
        }
      } finally {
        setLoadingTopics(false);
      }
    };

    if (showEditModal && editingRule) {
      fetchEditTopics();
    }
  }, [editingRule?.target_group_id, isEditSupergroupSelected, showEditModal]);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/rules', newRule);
      toast.success('Rule berhasil dibuat.');
      setShowCreateModal(false);
      setTopics([]);
      setNewRule({
        target_group_id: '',
        topic_id: 0,
        keyword: '',
        bid_message: '',
        stop_keywords: '',
        is_active: true,
        has_bidded: false,
      });
      fetchData();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response && error.response.status === 403) {
        toast.error('Anda tidak punya akses untuk membuat rule.');
        return;
      }
      toast.error('Gagal membuat rule.');
    }
  };

  const handleUpdateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;
    
    try {
      await apiClient.put(`/rules/${editingRule.ID}`, editingRule);
      toast.success('Rule berhasil diperbarui.');
      setShowEditModal(false);
      setEditingRule(null);
      fetchData();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response && error.response.status === 403) {
        toast.error('Anda tidak punya akses untuk mengupdate rule.');
        return;
      }
      toast.error('Gagal mengupdate rule.');
    }
  };

  const handleEditClick = (rule: BidRule) => {
    setEditingRule({ ...rule });
    setShowEditModal(true);
  };

  const handleDeleteRule = async (id: number) => {
    if (!window.confirm('Hapus rule ini?')) return;
    try {
      await apiClient.delete(`/rules/${id}`);
      toast.success('Rule berhasil dihapus.');
      fetchData();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response && error.response.status === 403) {
        toast.error('Anda tidak punya akses untuk menghapus rule.');
        return;
      }
      toast.error('Gagal menghapus rule.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bid Rules</h1>
          <p className="text-slate-500">Kelola keyword bidding berdasarkan group dan topic.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Plus size={16} />
            Tambah Rule
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Memuat data rules...</div>
        ) : rules.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <AlertCircle className="mx-auto mb-2" size={24} />
            Belum ada rules.
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Target Group ID</th>
                <th className="px-4 py-3">Topic ID</th>
                <th className="px-4 py-3">Keyword</th>
                <th className="px-4 py-3">Bid Message</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Has Bidded</th>
                <th className="px-4 py-3">Stop Keywords</th>
                {isAdmin && <th className="px-4 py-3 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rules.map((rule) => (
                <tr key={rule.ID}>
                  <td className="px-4 py-3 font-medium text-slate-900">{rule.ID}</td>
                  <td className="px-4 py-3 font-mono text-xs">{rule.target_group_id}</td>
                  <td className="px-4 py-3">
                    {rule.topic_id === 0 ? (
                      <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700">
                        Topic: Global
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                        Topic: #{rule.topic_id}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{rule.keyword}</td>
                  <td className="px-4 py-3">{rule.bid_message}</td>
                  <td className="px-4 py-3">
                    {rule.is_active ? (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {rule.has_bidded ? (
                      <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">
                        Yes
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{rule.stop_keywords || '-'}</td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleEditClick(rule)}
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-2.5 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.ID)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6">
            <h2 className="mb-1 text-xl font-bold text-slate-900">Buat Rule Baru</h2>
            <p className="mb-6 text-sm text-slate-500">Pilih group dan topic agar rule tepat sasaran.</p>

            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Target Group</label>
                <select
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={newRule.target_group_id}
                  onChange={(e) => setNewRule((prev) => ({ ...prev, target_group_id: e.target.value }))}
                  required
                >
                  <option value="">Pilih group...</option>
                  {groups.map((group) => (
                    <option key={group.id} value={String(group.id)}>
                      {group.title} ({group.type}) - {group.id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Topic</label>
                <select
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 disabled:bg-slate-100"
                  value={newRule.topic_id}
                  onChange={(e) => setNewRule((prev) => ({ ...prev, topic_id: Number(e.target.value) }))}
                  disabled={!isSupergroupSelected || loadingTopics}
                >
                  <option value={0}>0 - Global (tanpa topic khusus)</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.id} - {topic.title}
                    </option>
                  ))}
                </select>
                {!isSupergroupSelected && newRule.target_group_id && (
                  <p className="mt-1 text-xs text-slate-500">
                    Group bukan supergroup, topic otomatis global (`topic_id = 0`).
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Keyword</label>
                <textarea
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 h-24 resize-none"
                  value={newRule.keyword}
                  onChange={(e) => setNewRule((prev) => ({ ...prev, keyword: e.target.value }))}
                  placeholder="Contoh: iphone 13, pa/a, 5 juta"
                  required
                />
                <p className="mt-1 text-xs text-slate-500">
                  * Pisahkan antar kata kunci dengan <b>koma (,)</b>. Semua kata kunci wajib ada di pesan (Logika AND). Mendukung format pola Regex.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Bid Message</label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={newRule.bid_message}
                  onChange={(e) => setNewRule((prev) => ({ ...prev, bid_message: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Stop Keywords</label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={newRule.stop_keywords}
                  onChange={(e) => setNewRule((prev) => ({ ...prev, stop_keywords: e.target.value }))}
                  placeholder="sold, closed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Batal
                </button>
                <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                  Simpan Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6">
            <h2 className="mb-1 text-xl font-bold text-slate-900">Edit Rule</h2>
            <p className="mb-6 text-sm text-slate-500">Perbarui rule yang sudah ada.</p>

            <form onSubmit={handleUpdateRule} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Target Group</label>
                <select
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={editingRule.target_group_id}
                  onChange={(e) => setEditingRule((prev) => prev ? { ...prev, target_group_id: e.target.value } : null)}
                  required
                >
                  <option value="">Pilih group...</option>
                  {groups.map((group) => (
                    <option key={group.id} value={String(group.id)}>
                      {group.title} ({group.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Topic</label>
                <select
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 disabled:bg-slate-100"
                  value={editingRule.topic_id}
                  onChange={(e) => setEditingRule((prev) => prev ? { ...prev, topic_id: Number(e.target.value) } : null)}
                  disabled={!isEditSupergroupSelected || loadingTopics}
                >
                  <option value={0}>0 - Global (tanpa topic khusus)</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.id} - {topic.title}
                    </option>
                  ))}
                </select>
                {!isEditSupergroupSelected && editingRule.target_group_id && (
                  <p className="mt-1 text-xs text-slate-500">
                    Group bukan supergroup, topic otomatis global (`topic_id = 0`).
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Keyword</label>
                <textarea
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 h-24 resize-none"
                  value={editingRule.keyword}
                  onChange={(e) => setEditingRule((prev) => prev ? { ...prev, keyword: e.target.value } : null)}
                  placeholder="Contoh: iphone 13, pa/a, 5 juta"
                  required
                />
                <p className="mt-1 text-xs text-slate-500">
                  * Pisahkan antar kata kunci dengan <b>koma (,)</b>. Semua kata kunci wajib ada di pesan (Logika AND). Mendukung format pola Regex.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Bid Message</label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={editingRule.bid_message}
                  onChange={(e) => setEditingRule((prev) => prev ? { ...prev, bid_message: e.target.value } : null)}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Stop Keywords</label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={editingRule.stop_keywords}
                  onChange={(e) => setEditingRule((prev) => prev ? { ...prev, stop_keywords: e.target.value } : null)}
                  placeholder="sold, closed"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="is_active"
                      checked={editingRule.is_active}
                      onChange={() => setEditingRule((prev) => prev ? { ...prev, is_active: true } : null)}
                      className="text-blue-600"
                    />
                    <span className="text-sm text-slate-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="is_active"
                      checked={!editingRule.is_active}
                      onChange={() => setEditingRule((prev) => prev ? { ...prev, is_active: false } : null)}
                      className="text-blue-600"
                    />
                    <span className="text-sm text-slate-700">Inactive</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingRule(null);
                  }}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Batal
                </button>
                <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                  Update Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rules;

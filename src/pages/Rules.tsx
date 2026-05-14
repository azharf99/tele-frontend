import React, { useEffect, useMemo, useState } from 'react';
import apiClient from '../api/client';
import type { BidRule, TelegramGroup, TopicInfo } from '../types';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { 
  AlertCircle, 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  Hash, 
  Globe, 
  CheckCircle2, 
  XCircle,
  MessageSquare,
  LayoutGrid,
  List as ListIcon,
  RefreshCcw,
  Settings
} from 'lucide-react';

const Rules: React.FC = () => {
  const [rules, setRules] = useState<BidRule[]>([]);
  const [groups, setGroups] = useState<TelegramGroup[]>([]);
  const [topics, setTopics] = useState<TopicInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRule, setEditingRule] = useState<BidRule | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
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
    () => groups.find((group) => String(group.id) === String(newRule.target_group_id)),
    [groups, newRule.target_group_id]
  );

  const selectedEditGroup = useMemo(
    () => editingRule ? groups.find((group) => String(group.id) === String(editingRule.target_group_id)) : null,
    [groups, editingRule]
  );

  const isSupergroupSelected = selectedGroup?.type === 'supergroup';
  const isEditSupergroupSelected = selectedEditGroup?.type === 'supergroup';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rulesRes, groupsRes] = await Promise.all([
        apiClient.get('/rules'),
        apiClient.get('/groups'),
      ]);
      setRules(rulesRes.data);
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
      if (!newRule.target_group_id || !isSupergroupSelected) {
        setTopics([]);
        setNewRule((prev) => ({ ...prev, topic_id: 0 }));
        return;
      }

      setLoadingTopics(true);
      try {
        const response = await apiClient.get(`/groups/${newRule.target_group_id}/topics`);
        setTopics(response.data ?? []);
      } catch (error: unknown) {
        setTopics([]);
        setNewRule((prev) => ({ ...prev, topic_id: 0 }));
        const axiosError = error as { response?: { status: number } };
        if (axiosError?.response?.status === 500) {
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
      if (!editingRule?.target_group_id || !isEditSupergroupSelected) return;

      setLoadingTopics(true);
      try {
        const response = await apiClient.get(`/groups/${editingRule.target_group_id}/topics`);
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
        setLoadingTopics(false);
      }
    };

    if (showEditModal && editingRule) {
      fetchEditTopics();
    }
  }, [isEditSupergroupSelected, showEditModal, editingRule]);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/rules', {
        ...newRule,
        target_group_id: String(newRule.target_group_id),
      });
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
      const axiosError = error as { response?: { status: number } };
      if (axiosError?.response?.status === 403) {
        toast.error('Anda tidak punya akses.');
        return;
      }
      toast.error('Gagal membuat rule.');
    }
  };

  const handleUpdateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;
    
    try {
      await apiClient.put(`/rules/${editingRule.ID}`, {
        ...editingRule,
        target_group_id: String(editingRule.target_group_id),
      });
      toast.success('Rule diperbarui.');
      setShowEditModal(false);
      setEditingRule(null);
      fetchData();
    } catch (error: unknown) {
      const axiosError = error as { response?: { status: number } };
      if (axiosError?.response?.status === 403) {
        toast.error('Anda tidak punya akses.');
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
      toast.success('Rule dihapus.');
      fetchData();
    } catch (error: unknown) {
      const axiosError = error as { response?: { status: number } };
      if (axiosError?.response?.status === 403) {
        toast.error('Anda tidak punya akses.');
        return;
      }
      toast.error('Gagal menghapus rule.');
    }
  };

  const filteredRules = rules.filter(rule => 
    rule.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.bid_message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.target_group_id.includes(searchQuery)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Bid Rules</h1>
          <p className="text-muted-foreground font-medium">Manage keyword triggers and automated bidding logic.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            <span>Create Rule</span>
          </button>
        )}
      </header>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search rules, keywords, or group IDs..." 
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 p-1 bg-muted rounded-2xl border border-border">
          <button 
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-xl transition-all ${viewMode === 'table' ? 'bg-card shadow-sm text-indigo-500' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <ListIcon size={20} />
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-card shadow-sm text-indigo-500' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <LayoutGrid size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-muted-foreground space-y-4">
          <RefreshCcw size={40} className="animate-spin text-indigo-500" />
          <p className="font-black uppercase tracking-widest text-xs">Syncing Rulebase...</p>
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="py-32 bg-card border border-border rounded-[3rem] flex flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 bg-muted rounded-[2rem] flex items-center justify-center text-muted-foreground mb-6">
            <AlertCircle size={40} />
          </div>
          <h3 className="text-xl font-black mb-2">No Rules Found</h3>
          <p className="text-muted-foreground max-w-xs font-medium">Try adjusting your filters or create a new automation rule to get started.</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-card rounded-[2.5rem] border border-border overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Identity</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Keyword Logic</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Response Payload</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target Node</th>
                  {isAdmin && <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRules.map((rule) => (
                  <tr key={rule.ID} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-5">
                      {rule.is_active ? (
                        <div className="flex items-center gap-2 text-emerald-500">
                          <CheckCircle2 size={16} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-rose-500">
                          <XCircle size={16} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Paused</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-black text-xs text-indigo-500 mb-1">RULE-{rule.ID}</div>
                      <div className="flex items-center gap-2">
                        {rule.has_bidded ? (
                          <span className="bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ring-1 ring-amber-500/20">Executed</span>
                        ) : (
                          <span className="bg-slate-500/10 text-slate-500 text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ring-1 ring-slate-500/20">Pending</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {rule.keyword.split(',').map((k, idx) => (
                          <span key={idx} className="bg-muted px-2 py-1 rounded-lg text-xs font-bold border border-border">{k.trim()}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 max-w-xs">
                        <MessageSquare size={14} className="text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium truncate italic text-muted-foreground">"{rule.bid_message}"</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-500">
                          {rule.topic_id === 0 ? <Globe size={16} /> : <Hash size={16} />}
                        </div>
                        <div>
                          <div className="text-xs font-black tracking-tight truncate max-w-[120px]">{rule.target_group_id}</div>
                          <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                            {rule.topic_id === 0 ? 'Global Stream' : `Topic #${rule.topic_id}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEditClick(rule)}
                            className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl hover:bg-indigo-500 hover:text-white transition-all"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteRule(rule.ID)}
                            className="p-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRules.map((rule) => (
            <div key={rule.ID} className="bg-card border border-border rounded-[2rem] p-8 hover:border-indigo-500/30 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-110 transition-transform">
                <Settings size={80} />
              </div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${rule.is_active ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">RULE-{rule.ID}</span>
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button onClick={() => handleEditClick(rule)} className="text-muted-foreground hover:text-indigo-500"><Edit size={16} /></button>
                    <button onClick={() => handleDeleteRule(rule.ID)} className="text-muted-foreground hover:text-rose-500"><Trash2 size={16} /></button>
                  </div>
                )}
              </div>
              
              <div className="space-y-6 relative z-10">
                <div>
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Keyword Cluster</p>
                  <div className="flex flex-wrap gap-1">
                    {rule.keyword.split(',').map((k, idx) => (
                      <span key={idx} className="bg-muted px-2 py-1 rounded-lg text-xs font-bold border border-border">{k.trim()}</span>
                    ))}
                  </div>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Auto-Response</p>
                  <p className="text-sm font-medium italic">"{rule.bid_message}"</p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Globe size={14} className="text-indigo-500" />
                    <span className="text-[10px] font-black tracking-tight truncate max-w-[100px]">{rule.target_group_id}</span>
                  </div>
                  <div className="text-[10px] font-black text-muted-foreground">
                    {rule.topic_id === 0 ? 'GLOBAL' : `TOPIC ${rule.topic_id}`}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300" />
          <div className="bg-card border border-border w-full max-w-2xl rounded-[3rem] p-10 relative z-10 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <header className="mb-10 text-center">
              <div className="w-16 h-16 bg-indigo-600/10 rounded-[1.5rem] flex items-center justify-center text-indigo-600 mb-6 mx-auto ring-1 ring-indigo-600/20">
                <Settings size={32} />
              </div>
              <h2 className="text-3xl font-black tracking-tight mb-2">{showCreateModal ? 'New Rule Configuration' : 'Edit Rule Payload'}</h2>
              <p className="text-muted-foreground font-medium">Define automation parameters for targeted group interaction.</p>
            </header>

            <form onSubmit={showCreateModal ? handleCreateRule : handleUpdateRule} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Target Cluster</label>
                  <select
                    className="w-full bg-muted border border-border rounded-2xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500/20 focus:border-indigo-500 font-bold text-sm transition-all appearance-none"
                    value={showCreateModal ? newRule.target_group_id : (editingRule?.target_group_id || '')}
                    onChange={(e) => showCreateModal 
                      ? setNewRule(prev => ({ ...prev, target_group_id: e.target.value }))
                      : setEditingRule(prev => prev ? { ...prev, target_group_id: e.target.value } : null)
                    }
                    required
                  >
                    <option value="">Select Group...</option>
                    {groups.map((group) => (
                      <option key={group.id} value={String(group.id)}>
                        {group.title} ({group.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Stream Partition (Topic)</label>
                  <select
                    className="w-full bg-muted border border-border rounded-2xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500/20 focus:border-indigo-500 font-bold text-sm transition-all appearance-none disabled:opacity-50"
                    value={showCreateModal ? newRule.topic_id : (editingRule?.topic_id || 0)}
                    onChange={(e) => showCreateModal
                      ? setNewRule(prev => ({ ...prev, topic_id: Number(e.target.value) }))
                      : setEditingRule(prev => prev ? { ...prev, topic_id: Number(e.target.value) } : null)
                    }
                    disabled={!(showCreateModal ? isSupergroupSelected : isEditSupergroupSelected) || loadingTopics}
                  >
                    <option value={0}>0 - Global Stream</option>
                    {topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.id} - {topic.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Keyword Match Logic (AND)</label>
                <textarea
                  className="w-full bg-muted border border-border rounded-2xl px-5 py-4 outline-none focus:ring-2 ring-indigo-500/20 focus:border-indigo-500 font-medium text-sm transition-all h-24 resize-none"
                  value={showCreateModal ? newRule.keyword : (editingRule?.keyword || '')}
                  onChange={(e) => showCreateModal
                    ? setNewRule(prev => ({ ...prev, keyword: e.target.value }))
                    : setEditingRule(prev => prev ? { ...prev, keyword: e.target.value } : null)
                  }
                  placeholder="e.g. pa/a, 512gb, pristine"
                  required
                />
                <p className="text-[10px] text-muted-foreground font-medium">* Comma separated. All terms must match for execution.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Response Payload</label>
                  <input
                    className="w-full bg-muted border border-border rounded-2xl px-5 py-4 outline-none focus:ring-2 ring-indigo-500/20 focus:border-indigo-500 font-bold text-sm transition-all"
                    value={showCreateModal ? newRule.bid_message : (editingRule?.bid_message || '')}
                    onChange={(e) => showCreateModal
                      ? setNewRule(prev => ({ ...prev, bid_message: e.target.value }))
                      : setEditingRule(prev => prev ? { ...prev, bid_message: e.target.value } : null)
                    }
                    placeholder="Auto-response message..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Termination Keywords (STOP)</label>
                  <input
                    className="w-full bg-muted border border-border rounded-2xl px-5 py-4 outline-none focus:ring-2 ring-indigo-500/20 focus:border-indigo-500 font-bold text-sm transition-all"
                    value={showCreateModal ? newRule.stop_keywords : (editingRule?.stop_keywords || '')}
                    onChange={(e) => showCreateModal
                      ? setNewRule(prev => ({ ...prev, stop_keywords: e.target.value }))
                      : setEditingRule(prev => prev ? { ...prev, stop_keywords: e.target.value } : null)
                    }
                    placeholder="e.g. sold, close, ends"
                  />
                </div>
              </div>

              {!showCreateModal && editingRule && (
                <div className="flex items-center gap-6 p-6 bg-muted/50 rounded-2xl border border-border">
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Protocol State:</span>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        checked={editingRule.is_active}
                        onChange={() => setEditingRule(prev => prev ? { ...prev, is_active: true } : null)}
                        className="w-4 h-4 text-indigo-600 bg-slate-800 border-border focus:ring-indigo-500/20"
                      />
                      <span className="text-sm font-bold group-hover:text-indigo-500 transition-colors">Active</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        checked={!editingRule.is_active}
                        onChange={() => setEditingRule(prev => prev ? { ...prev, is_active: false } : null)}
                        className="w-4 h-4 text-rose-600 bg-slate-800 border-border focus:ring-rose-500/20"
                      />
                      <span className="text-sm font-bold group-hover:text-rose-500 transition-colors">Paused</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setEditingRule(null);
                  }}
                  className="flex-1 py-4 bg-muted hover:bg-border text-foreground font-black uppercase tracking-widest text-xs rounded-2xl transition-all"
                >
                  Terminate
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl shadow-indigo-600/20"
                >
                  Commit Configuration
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

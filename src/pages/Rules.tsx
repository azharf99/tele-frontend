import React, { useEffect, useMemo, useRef, useState } from 'react';
import apiClient from '../api/client';
import type { BidRule, BulkDeleteResult, ImportResult, TelegramGroup, TopicInfo } from '../types';
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
  Settings,
  Upload,
  Download,
  X
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // Bulk delete: a CSV import can seed hundreds of rules, so removing them one
  // row at a time is impractical.
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const MAX_BULK_DELETE = 1000; // mirror backend cap

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
      const freshRules: BidRule[] = rulesRes.data;
      setRules(freshRules);
      setGroups(groupsRes.data);

      // Drop selections whose rule no longer exists (deleted here or elsewhere).
      setSelectedIds((prev) => {
        if (prev.size === 0) return prev;
        const alive = new Set(freshRules.map((rule) => rule.ID));
        const next = new Set([...prev].filter((id) => alive.has(id)));
        return next.size === prev.size ? prev : next;
      });
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
        target_group_id: Number(newRule.target_group_id),
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
        target_group_id: Number(editingRule.target_group_id),
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

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Harap pilih file .csv');
      return;
    }
    const MAX_BYTES = 2 * 1024 * 1024; // mirror backend cap (2 MiB)
    if (file.size > MAX_BYTES) {
      toast.error('File terlalu besar (maks 2 MiB).');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setImporting(true);
    try {
      // Override the client's default application/json content-type. Axios v1
      // otherwise serializes FormData to JSON (a File becomes {}), so we set
      // multipart/form-data and let the browser append the boundary.
      const res = await apiClient.post('/rules/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const result = res.data as ImportResult;
      setImportResult(result);
      if (result.skipped > 0) {
        toast(`Import: ${result.created} dibuat, ${result.updated} diperbarui, ${result.skipped} dilewati.`, { icon: '⚠️' });
      } else {
        toast.success(`Import: ${result.created} dibuat, ${result.updated} diperbarui.`);
      }
      fetchData();
    } catch (error: unknown) {
      const axiosError = error as { response?: { status: number; data?: { error?: string } } };
      if (axiosError?.response?.status === 403) {
        toast.error('Anda tidak punya akses (Admin only).');
      } else {
        toast.error(axiosError?.response?.data?.error || 'Gagal mengimpor CSV.');
      }
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const header = 'target_group_id,topic_id,keyword,bid_message,stop_keywords,is_active,has_bidded';
    const sample = [
      '2069752017,0,iphone 13,Bid 5jt,"sold,closed",true,false',
      '2069752017,5,"pa/a, 512gb, pristine",OB,,true,false',
    ];
    const csv = [header, ...sample].join('\n') + '\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bid_rules_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredRules = rules.filter(rule =>
    rule.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.bid_message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(rule.target_group_id).includes(searchQuery)
  );

  const selectedCount = selectedIds.size;
  const allFilteredSelected =
    filteredRules.length > 0 && filteredRules.every((rule) => selectedIds.has(rule.ID));

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select-all applies to what is currently on screen, so it composes with search
  // instead of silently grabbing rules the user cannot see.
  const toggleSelectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filteredRules.forEach((rule) => next.delete(rule.ID));
      } else {
        filteredRules.forEach((rule) => next.add(rule.ID));
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDelete = async () => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;

    if (ids.length > MAX_BULK_DELETE) {
      toast.error(`Maksimal ${MAX_BULK_DELETE} rule per sekali hapus (terpilih ${ids.length}).`);
      return;
    }
    if (!window.confirm(`Hapus ${ids.length} rule terpilih? Tindakan ini tidak bisa dibatalkan.`)) return;

    setBulkDeleting(true);
    try {
      const res = await apiClient.post('/rules/bulk-delete', { ids });
      const result = res.data as BulkDeleteResult;
      if (result.deleted < result.requested) {
        toast(`${result.deleted} rule dihapus, ${result.requested - result.deleted} sudah tidak ada.`, { icon: '⚠️' });
      } else {
        toast.success(`${result.deleted} rule dihapus.`);
      }
      clearSelection();
      fetchData();
    } catch (error: unknown) {
      const axiosError = error as { response?: { status: number; data?: { error?: string } } };
      if (axiosError?.response?.status === 403) {
        toast.error('Anda tidak punya akses (Admin only).');
      } else {
        toast.error(axiosError?.response?.data?.error || 'Gagal menghapus rules.');
      }
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Bid Rules</h1>
          <p className="text-muted-foreground font-medium">Manage keyword triggers and automated bidding logic.</p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleImportFile}
            />
            <button
              onClick={handleDownloadTemplate}
              className="px-4 py-3 bg-muted hover:bg-border text-foreground rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2"
              title="Download CSV template"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Template</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="px-5 py-3 bg-card border border-border hover:border-indigo-500/50 text-foreground rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              title="Bulk import rules from CSV (upsert by keyword)"
            >
              {importing
                ? <RefreshCcw size={18} className="animate-spin text-indigo-500" />
                : <Upload size={18} />}
              <span>{importing ? 'Importing...' : 'Import CSV'}</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 group"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform" />
              <span>Create Rule</span>
            </button>
          </div>
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

      {/* Bulk action bar */}
      {isAdmin && selectedCount > 0 && (
        <div className="sticky top-4 z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 bg-card border border-indigo-500/40 rounded-2xl shadow-xl shadow-indigo-600/10 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 shrink-0 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center font-black text-xs ring-1 ring-indigo-500/20">
              {selectedCount}
            </span>
            <div>
              <p className="font-black text-sm tracking-tight">
                {selectedCount} rule terpilih
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {allFilteredSelected ? 'Semua hasil filter terpilih' : `Dari ${filteredRules.length} rule tampil`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectAllFiltered}
              className="px-4 py-2.5 bg-muted hover:bg-border text-foreground rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
            >
              {allFilteredSelected ? 'Batal pilih semua' : 'Pilih semua tampil'}
            </button>
            <button
              onClick={clearSelection}
              className="px-4 py-2.5 bg-muted hover:bg-border text-foreground rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-1.5"
            >
              <X size={14} />
              Bersihkan
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-rose-600/20 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {bulkDeleting
                ? <RefreshCcw size={14} className="animate-spin" />
                : <Trash2 size={14} />}
              {bulkDeleting ? 'Menghapus...' : `Hapus ${selectedCount}`}
            </button>
          </div>
        </div>
      )}

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
                  {isAdmin && (
                    <th className="pl-6 pr-2 py-5 w-12">
                      <input
                        type="checkbox"
                        checked={allFilteredSelected}
                        onChange={toggleSelectAllFiltered}
                        aria-label="Pilih semua rule yang tampil"
                        title="Pilih semua rule yang tampil"
                        className="w-4 h-4 rounded accent-indigo-600 cursor-pointer align-middle"
                      />
                    </th>
                  )}
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
                  <tr
                    key={rule.ID}
                    className={`transition-colors group ${selectedIds.has(rule.ID) ? 'bg-indigo-500/5' : 'hover:bg-muted/30'}`}
                  >
                    {isAdmin && (
                      <td className="pl-6 pr-2 py-5">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(rule.ID)}
                          onChange={() => toggleSelect(rule.ID)}
                          aria-label={`Pilih rule ${rule.ID}`}
                          className="w-4 h-4 rounded accent-indigo-600 cursor-pointer align-middle"
                        />
                      </td>
                    )}
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
            <div
              key={rule.ID}
              className={`bg-card border rounded-[2rem] p-8 transition-all group relative overflow-hidden ${
                selectedIds.has(rule.ID)
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                  : 'border-border hover:border-indigo-500/30'
              }`}
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-110 transition-transform">
                <Settings size={80} />
              </div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  {isAdmin && (
                    <input
                      type="checkbox"
                      checked={selectedIds.has(rule.ID)}
                      onChange={() => toggleSelect(rule.ID)}
                      aria-label={`Pilih rule ${rule.ID}`}
                      className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                    />
                  )}
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

      {/* Import Result Modal */}
      {importResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setImportResult(null)}
          />
          <div className="bg-card border border-border w-full max-w-lg rounded-[3rem] p-10 relative z-10 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setImportResult(null)}
              className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-all"
            >
              <X size={20} />
            </button>

            <header className="mb-8 text-center">
              <div className="w-16 h-16 bg-indigo-600/10 rounded-[1.5rem] flex items-center justify-center text-indigo-600 mb-6 mx-auto ring-1 ring-indigo-600/20">
                <Upload size={32} />
              </div>
              <h2 className="text-3xl font-black tracking-tight mb-2">Import Complete</h2>
              <p className="text-muted-foreground font-medium">Bulk upsert by keyword finished.</p>
            </header>

            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="p-4 bg-emerald-500/10 rounded-2xl text-center ring-1 ring-emerald-500/20">
                <div className="text-2xl font-black text-emerald-500">{importResult.created}</div>
                <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">Created</div>
              </div>
              <div className="p-4 bg-indigo-500/10 rounded-2xl text-center ring-1 ring-indigo-500/20">
                <div className="text-2xl font-black text-indigo-500">{importResult.updated}</div>
                <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">Updated</div>
              </div>
              <div className="p-4 bg-rose-500/10 rounded-2xl text-center ring-1 ring-rose-500/20">
                <div className="text-2xl font-black text-rose-500">{importResult.skipped}</div>
                <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">Skipped</div>
              </div>
            </div>

            {importResult.errors && importResult.errors.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Skipped Rows</p>
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {importResult.errors.map((rowErr, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl">
                      <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <span className="font-black text-rose-500">Row {rowErr.row}:</span>{' '}
                        <span className="font-medium text-muted-foreground">{rowErr.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setImportResult(null)}
              className="w-full mt-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl shadow-indigo-600/20"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rules;

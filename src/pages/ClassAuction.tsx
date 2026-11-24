import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import type {
  AuctionCatalog,
  AuctionLog,
  AuctionLogPage,
  AuctionOutcome,
  AuctionType,
  ClassAuctionProfile,
  DateAvailabilityOverride,
  DateOverrideKind,
  TelegramAccount,
  TelegramGroup,
  WatchedTarget,
  WeeklyAvailability,
} from '../types';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import ProfileTab from '../components/auction/ProfileTab';
import ScheduleTab from '../components/auction/ScheduleTab';
import TargetsTab from '../components/auction/TargetsTab';
import SimulatorTab from '../components/auction/SimulatorTab';
import LogsTab from '../components/auction/LogsTab';
import {
  Calendar,
  FlaskConical,
  GraduationCap,
  History,
  Radio,
  RefreshCcw,
  Sliders,
  Smartphone,
} from 'lucide-react';

type AuctionTab = 'profile' | 'schedule' | 'targets' | 'simulator' | 'logs';

const ClassAuction: React.FC = () => {
  const { isAdmin } = useAuth();
  const [accounts, setAccounts] = useState<TelegramAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [catalog, setCatalog] = useState<AuctionCatalog | null>(null);
  const [activeTab, setActiveTab] = useState<AuctionTab>('profile');

  const [profile, setProfile] = useState<ClassAuctionProfile | null>(null);
  const [weekly, setWeekly] = useState<WeeklyAvailability[]>([]);
  const [overrides, setOverrides] = useState<DateAvailabilityOverride[]>([]);
  const [targets, setTargets] = useState<WatchedTarget[]>([]);
  const [groups, setGroups] = useState<TelegramGroup[]>([]);
  const [logs, setLogs] = useState<AuctionLog[]>([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [decisionFilter, setDecisionFilter] = useState('');

  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingWeekly, setSavingWeekly] = useState(false);

  // Initial load: catalog + accounts
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [catRes, accRes] = await Promise.all([
          apiClient.get<AuctionCatalog>('/auction/catalog'),
          apiClient.get<TelegramAccount[]>('/accounts'),
        ]);
        setCatalog(catRes.data);
        const list = (accRes.data ?? []).filter((a) => a.enable_class_auction);
        setAccounts(list);
        if (list.length > 0) {
          setSelectedAccountId(list[0].id);
        }
      } catch {
        toast.error('Gagal memuat data Lelang Kelas.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadAccountData = useCallback(async (accountId: number) => {
    try {
      const [profRes, schedRes, ovRes, targRes, grpRes] = await Promise.all([
        apiClient.get<ClassAuctionProfile>(`/accounts/${accountId}/auction/profile`),
        apiClient.get<WeeklyAvailability[]>(`/accounts/${accountId}/auction/schedule`),
        apiClient.get<DateAvailabilityOverride[]>(`/accounts/${accountId}/auction/overrides`),
        apiClient.get<WatchedTarget[]>(`/accounts/${accountId}/auction/targets`),
        apiClient.get<TelegramGroup[]>(`/accounts/${accountId}/groups`),
      ]);
      setProfile(profRes.data);
      setWeekly(schedRes.data ?? []);
      setOverrides(ovRes.data ?? []);
      setTargets(targRes.data ?? []);
      setGroups(grpRes.data ?? []);
    } catch {
      toast.error('Gagal memuat konfigurasi akun lelang.');
    }
  }, []);

  const loadLogs = useCallback(async (accountId: number, decision: string) => {
    setLoadingLogs(true);
    try {
      const query = decision ? `?decision=${encodeURIComponent(decision)}&limit=50` : '?limit=50';
      const res = await apiClient.get<AuctionLogPage>(`/accounts/${accountId}/auction/logs${query}`);
      setLogs(res.data?.items ?? []);
      setLogsTotal(res.data?.total ?? 0);
    } catch {
      toast.error('Gagal memuat riwayat lelang.');
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    if (selectedAccountId !== null) {
      loadAccountData(selectedAccountId);
      loadLogs(selectedAccountId, decisionFilter);
    }
  }, [selectedAccountId, loadAccountData, loadLogs, decisionFilter]);

  const handleSaveProfile = async () => {
    if (!profile || selectedAccountId === null) return;
    setSavingProfile(true);
    try {
      const res = await apiClient.put<ClassAuctionProfile>(`/accounts/${selectedAccountId}/auction/profile`, profile);
      setProfile(res.data);
      toast.success('Profil tutor & pengaturan lelang disimpan.');
    } catch {
      toast.error('Gagal menyimpan profil tutor.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveWeekly = async () => {
    if (selectedAccountId === null) return;
    setSavingWeekly(true);
    try {
      const res = await apiClient.put<WeeklyAvailability[]>(`/accounts/${selectedAccountId}/auction/schedule`, {
        windows: weekly,
      });
      setWeekly(res.data ?? []);
      toast.success('Jadwal kosong mingguan disimpan.');
    } catch {
      toast.error('Gagal menyimpan jadwal mingguan.');
    } finally {
      setSavingWeekly(false);
    }
  };

  const handleAddOverride = async (ov: { date: string; kind: DateOverrideKind; start_minute: number; end_minute: number; reason: string }) => {
    if (selectedAccountId === null) return;
    try {
      await apiClient.post(`/accounts/${selectedAccountId}/auction/overrides`, ov);
      toast.success('Override tanggal ditambahkan.');
      const res = await apiClient.get<DateAvailabilityOverride[]>(`/accounts/${selectedAccountId}/auction/overrides`);
      setOverrides(res.data ?? []);
    } catch {
      toast.error('Gagal menambahkan override tanggal.');
    }
  };

  const handleDeleteOverride = async (overrideId: number) => {
    if (selectedAccountId === null) return;
    try {
      await apiClient.delete(`/accounts/${selectedAccountId}/auction/overrides/${overrideId}`);
      setOverrides((prev) => prev.filter((o) => o.id !== overrideId));
      toast.success('Override dihapus.');
    } catch {
      toast.error('Gagal menghapus override.');
    }
  };

  const handleAddTarget = async (payload: { group_id: number; topic_id: number; label: string; default_auction_type: AuctionType | ''; is_active: boolean }) => {
    if (selectedAccountId === null) return;
    try {
      const res = await apiClient.post<WatchedTarget>(`/accounts/${selectedAccountId}/auction/targets`, payload);
      setTargets((prev) => [...prev, res.data]);
      toast.success('Target pantauan ditambahkan.');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Gagal menambah target.');
    }
  };

  const handleToggleTarget = async (target: WatchedTarget) => {
    if (selectedAccountId === null) return;
    try {
      const res = await apiClient.put<WatchedTarget>(`/accounts/${selectedAccountId}/auction/targets/${target.id}`, {
        ...target,
        is_active: !target.is_active,
      });
      setTargets((prev) => prev.map((t) => (t.id === target.id ? res.data : t)));
    } catch {
      toast.error('Gagal mengubah status target.');
    }
  };

  const handleDeleteTarget = async (targetId: number) => {
    if (selectedAccountId === null) return;
    try {
      await apiClient.delete(`/accounts/${selectedAccountId}/auction/targets/${targetId}`);
      setTargets((prev) => prev.filter((t) => t.id !== targetId));
      toast.success('Target dihapus.');
    } catch {
      toast.error('Gagal menghapus target.');
    }
  };

  const handleSyncGroups = async () => {
    if (selectedAccountId === null) return;
    await apiClient.post(`/accounts/${selectedAccountId}/groups/sync`);
    const grpRes = await apiClient.get<TelegramGroup[]>(`/accounts/${selectedAccountId}/groups`);
    setGroups(grpRes.data ?? []);
  };

  const handleMarkOutcome = async (logId: number, outcome: AuctionOutcome) => {
    if (selectedAccountId === null) return;
    try {
      await apiClient.post(`/accounts/${selectedAccountId}/auction/logs/${logId}/outcome`, { outcome });
      toast.success(outcome === 'WON' ? 'Ditandai MENANG & jadwal otomatis terpotong!' : 'Ditandai kalah.');
      await Promise.all([
        loadLogs(selectedAccountId, decisionFilter),
        loadAccountData(selectedAccountId),
      ]);
    } catch {
      toast.error('Gagal memperbarui status lelang.');
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-muted-foreground space-y-3">
        <RefreshCcw size={36} className="animate-spin text-indigo-500" />
        <p className="text-xs font-black uppercase tracking-widest">Memuat Lelang Kelas...</p>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="py-24 bg-card border border-border border-dashed rounded-[2.5rem] text-center px-6 space-y-4">
        <div className="w-16 h-16 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto">
          <GraduationCap size={32} />
        </div>
        <h2 className="text-2xl font-black">Belum Ada Akun Telegram untuk Lelang Kelas</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Tambahkan akun Telegram kedua (atau aktifkan toggle <strong>Lelang Kelas Algonova</strong> pada salah satu akun) di halaman Devices & Console.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest"
        >
          Buka Devices & Console
        </Link>
      </div>
    );
  }

  const tabs: { id: AuctionTab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: 'profile', label: 'Profil & Filter', icon: Sliders },
    { id: 'schedule', label: 'Jadwal Kosong', icon: Calendar },
    { id: 'targets', label: `Grup Pantauan (${targets.length})`, icon: Radio },
    { id: 'simulator', label: 'Simulator Parser', icon: FlaskConical },
    { id: 'logs', label: `Riwayat (${logsTotal})`, icon: History },
  ];

  return (
    <div className="space-y-7 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Lelang Kelas Algonova</h1>
          <p className="text-muted-foreground font-medium">
            Auto-responder 0ms berbasis parser hybrid untuk lelang kelas NEW, OTR, CU/EC, dan FR.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-card border border-border rounded-2xl px-4 py-2.5">
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
      </header>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-card border border-border rounded-2xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
                active ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {selectedAccountId !== null && (
        <>
          {activeTab === 'profile' && profile && catalog && (
            <ProfileTab
              profile={profile}
              catalog={catalog}
              isAdmin={isAdmin}
              saving={savingProfile}
              onChange={setProfile}
              onSave={handleSaveProfile}
            />
          )}
          {activeTab === 'schedule' && (
            <ScheduleTab
              weekly={weekly}
              overrides={overrides}
              isAdmin={isAdmin}
              savingWeekly={savingWeekly}
              onChangeWeekly={setWeekly}
              onSaveWeekly={handleSaveWeekly}
              onAddOverride={handleAddOverride}
              onDeleteOverride={handleDeleteOverride}
            />
          )}
          {activeTab === 'targets' && (
            <TargetsTab
              accountId={selectedAccountId}
              targets={targets}
              groups={groups}
              isAdmin={isAdmin}
              onAddTarget={handleAddTarget}
              onToggleTarget={handleToggleTarget}
              onDeleteTarget={handleDeleteTarget}
              onSyncGroups={handleSyncGroups}
            />
          )}
          {activeTab === 'simulator' && <SimulatorTab accountId={selectedAccountId} />}
          {activeTab === 'logs' && (
            <LogsTab
              logs={logs}
              total={logsTotal}
              loading={loadingLogs}
              decisionFilter={decisionFilter}
              isAdmin={isAdmin}
              onFilterChange={setDecisionFilter}
              onRefresh={() => loadLogs(selectedAccountId, decisionFilter)}
              onMarkOutcome={handleMarkOutcome}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ClassAuction;

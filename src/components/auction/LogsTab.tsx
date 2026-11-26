import React, { useState } from 'react';
import type { AuctionLog, AuctionOutcome } from '../../types';
import { CheckCircle2, Clock, RefreshCcw, RotateCcw, Trophy, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface LogsTabProps {
  logs: AuctionLog[];
  total: number;
  loading: boolean;
  decisionFilter: string;
  isAdmin: boolean;
  onFilterChange: (decision: string) => void;
  onRefresh: () => void;
  onMarkOutcome: (logId: number, outcome: AuctionOutcome) => Promise<void>;
}

const DAY_LABELS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const fmtMin = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

const decisionBadge: Record<string, string> = {
  BID_SENT: 'bg-emerald-500/15 text-emerald-500',
  DRY_RUN_MATCH: 'bg-amber-500/15 text-amber-500',
  SKIPPED: 'bg-slate-500/15 text-slate-400',
  IGNORED: 'bg-slate-500/10 text-slate-500',
  ERROR: 'bg-rose-500/15 text-rose-500',
};

const LogsTab: React.FC<LogsTabProps> = ({
  logs,
  total,
  loading,
  decisionFilter,
  isAdmin,
  onFilterChange,
  onRefresh,
  onMarkOutcome,
}) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [busyLogId, setBusyLogId] = useState<number | null>(null);

  const handleOutcome = async (logId: number, outcome: AuctionOutcome) => {
    setBusyLogId(logId);
    try {
      await onMarkOutcome(logId, outcome);
    } finally {
      setBusyLogId(null);
    }
  };

  return (
    <div className="bg-card border border-border rounded-[2rem] p-7 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black">Riwayat Lelang ({total})</h3>
          <p className="text-xs text-muted-foreground">
            Saat fitur otomatis menang aktif, jadwal langsung terpotong begitu bid terkirim. Jika ternyata kelas tidak didapat/dibatalkan, klik <strong>Kalah / Kembalikan Jadwal</strong> untuk membuka slot kembali.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['', 'BID_SENT', 'DRY_RUN_MATCH', 'SKIPPED', 'IGNORED'].map((f) => (
            <button
              key={f || 'ALL'}
              type="button"
              onClick={() => onFilterChange(f)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                decisionFilter === f ? 'bg-indigo-600 text-white' : 'bg-muted text-muted-foreground'
              }`}
            >
              {f || 'Semua'}
            </button>
          ))}
          <button
            type="button"
            onClick={onRefresh}
            className="p-2 bg-muted hover:bg-border rounded-xl"
            title="Refresh"
          >
            <RefreshCcw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading && logs.length === 0 ? (
        <div className="py-16 text-center">
          <RefreshCcw size={28} className="animate-spin text-indigo-500 mx-auto" />
        </div>
      ) : logs.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground italic">
          Belum ada log lelang untuk filter ini.
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((item) => {
            const expanded = expandedId === item.id;
            const canMarkOutcome =
              isAdmin &&
              (item.decision === 'BID_SENT' || item.decision === 'DRY_RUN_MATCH') &&
              item.outcome === 'PENDING';
            const canRevertWon =
              isAdmin &&
              (item.decision === 'BID_SENT' || item.decision === 'DRY_RUN_MATCH') &&
              item.outcome === 'WON';

            return (
              <div key={item.id} className="bg-muted/30 border border-border rounded-2xl p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${decisionBadge[item.decision] || 'bg-muted'}`}>
                      {item.decision}
                    </span>
                    {item.parsed?.course && (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-indigo-500/15 text-indigo-400">
                        {item.parsed.course} · {item.parsed.auction_type} · {item.parsed.class_format} ({item.parsed.duration_min}m)
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground bg-card px-2 py-1 rounded-lg border border-border">
                      <Clock size={11} /> {item.latency_ms} ms
                    </span>
                    {item.outcome === 'WON' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-500 text-white">
                        <Trophy size={11} /> MENANG (JADWAL TERPOTONG)
                      </span>
                    )}
                    {item.outcome === 'LOST' && (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-rose-500/15 text-rose-400">
                        KALAH
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {new Date(item.created_at).toLocaleString('id-ID')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedId(expanded ? null : item.id)}
                      className="p-1.5 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground"
                    >
                      {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Summary Details */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    {item.reply_text && (
                      <p className="text-xs font-mono font-bold text-emerald-400">
                        Balasan: "{item.reply_text}"
                      </p>
                    )}
                    {item.skip_reason && (
                      <p className="text-xs text-muted-foreground">Alasan: {item.skip_reason}</p>
                    )}
                    {item.matched_slots && item.matched_slots.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.matched_slots.map((s, idx) => (
                          <span key={idx} className="text-[11px] font-mono bg-card border border-border px-2 py-0.5 rounded-md">
                            {DAY_LABELS[s.day_of_week]} {fmtMin(s.start_minute)} WIB{s.specific_date ? ` (${s.specific_date})` : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {canMarkOutcome && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={busyLogId === item.id}
                        onClick={() => handleOutcome(item.id, 'WON')}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <CheckCircle2 size={13} /> Tandai Menang
                      </button>
                      <button
                        type="button"
                        disabled={busyLogId === item.id}
                        onClick={() => handleOutcome(item.id, 'LOST')}
                        className="px-3.5 py-2 bg-muted hover:bg-rose-500/20 hover:text-rose-400 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <XCircle size={13} /> Kalah
                      </button>
                    </div>
                  )}

                  {canRevertWon && (
                    <button
                      type="button"
                      disabled={busyLogId === item.id}
                      onClick={() => handleOutcome(item.id, 'LOST')}
                      className="px-3.5 py-2 bg-amber-500/15 hover:bg-rose-500/20 text-amber-500 hover:text-rose-400 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <RotateCcw size={13} /> Kalah / Kembalikan Jadwal
                    </button>
                  )}
                </div>

                {expanded && (
                  <pre className="p-4 bg-slate-950/60 text-slate-200 rounded-xl text-xs font-mono whitespace-pre-wrap overflow-x-auto border border-white/5">
                    {item.raw_text}
                  </pre>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LogsTab;

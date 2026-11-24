import React, { useState } from 'react';
import type { DateAvailabilityOverride, DateOverrideKind, WeeklyAvailability } from '../../types';
import { Calendar, Clock, Plus, Save, Trash2 } from 'lucide-react';

interface ScheduleTabProps {
  weekly: WeeklyAvailability[];
  overrides: DateAvailabilityOverride[];
  isAdmin: boolean;
  savingWeekly: boolean;
  onChangeWeekly: (next: WeeklyAvailability[]) => void;
  onSaveWeekly: () => void;
  onAddOverride: (ov: { date: string; kind: DateOverrideKind; start_minute: number; end_minute: number; reason: string }) => Promise<void>;
  onDeleteOverride: (id: number) => Promise<void>;
}

// Display order Monday (1) .. Saturday (6), Sunday (0)
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DAY_NAMES: Record<number, string> = {
  0: 'Minggu',
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu',
};

const minutesToTime = (m: number): string => {
  const hh = String(Math.floor(m / 60)).padStart(2, '0');
  const mm = String(m % 60).padStart(2, '0');
  return `${hh}:${mm}`;
};

const timeToMinutes = (t: string): number => {
  const [h, m] = t.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
};

const ScheduleTab: React.FC<ScheduleTabProps> = ({
  weekly,
  overrides,
  isAdmin,
  savingWeekly,
  onChangeWeekly,
  onSaveWeekly,
  onAddOverride,
  onDeleteOverride,
}) => {
  const [newDay, setNewDay] = useState<number>(5); // Jumat default
  const [newStart, setNewStart] = useState('19:00');
  const [newEnd, setNewEnd] = useState('22:00');

  const [ovDate, setOvDate] = useState('');
  const [ovKind, setOvKind] = useState<DateOverrideKind>('BLOCK');
  const [ovStart, setOvStart] = useState('00:00');
  const [ovEnd, setOvEnd] = useState('23:59');
  const [ovReason, setOvReason] = useState('');
  const [addingOv, setAddingOv] = useState(false);

  const handleAddWeeklyWindow = (e: React.FormEvent) => {
    e.preventDefault();
    const s = timeToMinutes(newStart);
    const en = timeToMinutes(newEnd);
    if (en <= s) return;
    onChangeWeekly([
      ...weekly,
      { day_of_week: newDay, start_minute: s, end_minute: en, is_active: true },
    ]);
  };

  const handleRemoveWeekly = (index: number) => {
    onChangeWeekly(weekly.filter((_, i) => i !== index));
  };

  const handleCreateOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ovDate) return;
    const s = timeToMinutes(ovStart);
    const en = ovEnd === '23:59' ? 1440 : timeToMinutes(ovEnd);
    if (en <= s) return;
    setAddingOv(true);
    try {
      await onAddOverride({
        date: ovDate,
        kind: ovKind,
        start_minute: s,
        end_minute: en,
        reason: ovReason.trim(),
      });
      setOvReason('');
    } finally {
      setAddingOv(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Weekly Recurring Availability */}
      <div className="bg-card border border-border rounded-[2rem] p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black flex items-center gap-2">
              <Clock size={20} className="text-indigo-500" />
              Jadwal Kosong Mingguan (WIB)
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Masukkan rentang waktu luangmu (misal Jumat 20:30–22:00). Sistem otomatis mengecek apakah kelas Private (60m) atau Group/PREM (90m) muat di dalamnya.
            </p>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={onSaveWeekly}
              disabled={savingWeekly}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shrink-0 disabled:opacity-50"
            >
              <Save size={15} />
              {savingWeekly ? 'Menyimpan...' : 'Simpan Jadwal'}
            </button>
          )}
        </div>

        {isAdmin && (
          <form onSubmit={handleAddWeeklyWindow} className="p-4 bg-muted/40 border border-border rounded-2xl flex flex-wrap items-end gap-3">
            <div>
              <label className="text-[10px] font-black uppercase text-muted-foreground">Hari</label>
              <select
                value={newDay}
                onChange={(e) => setNewDay(Number(e.target.value))}
                className="mt-1 block px-3.5 py-2.5 bg-card border border-border rounded-xl text-sm font-bold outline-none"
              >
                {DAY_ORDER.map((d) => (
                  <option key={d} value={d}>{DAY_NAMES[d]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-muted-foreground">Mulai (WIB)</label>
              <input
                type="time"
                value={newStart}
                onChange={(e) => setNewStart(e.target.value)}
                className="mt-1 block px-3.5 py-2.5 bg-card border border-border rounded-xl text-sm font-mono font-bold outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-muted-foreground">Selesai (WIB)</label>
              <input
                type="time"
                value={newEnd}
                onChange={(e) => setNewEnd(e.target.value)}
                className="mt-1 block px-3.5 py-2.5 bg-card border border-border rounded-xl text-sm font-mono font-bold outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-1.5"
            >
              <Plus size={15} />
              Tambah Slot
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {DAY_ORDER.map((day) => {
            const dayItems = weekly
              .map((w, idx) => ({ w, idx }))
              .filter(({ w }) => w.day_of_week === day)
              .sort((a, b) => a.w.start_minute - b.w.start_minute);

            return (
              <div key={day} className="bg-muted/30 border border-border rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm">{DAY_NAMES[day]}</span>
                  <span className="text-[10px] font-black text-muted-foreground uppercase">{dayItems.length} blok</span>
                </div>

                {dayItems.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-2">Tidak ada jam kosong</p>
                ) : (
                  <div className="space-y-2">
                    {dayItems.map(({ w, idx }) => {
                      const spanMin = w.end_minute - w.start_minute;
                      return (
                        <div key={idx} className="bg-card border border-border rounded-xl px-3 py-2 flex items-center justify-between gap-2">
                          <div>
                            <p className="font-mono font-bold text-xs">
                              {minutesToTime(w.start_minute)} – {minutesToTime(w.end_minute)}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {spanMin}m {spanMin >= 90 ? '(Private & PREM)' : spanMin >= 60 ? '(Private 60m)' : '(<60m)'}
                            </p>
                          </div>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleRemoveWeekly(idx)}
                              className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Date Overrides for 1-Time Classes (OTR / CU) */}
      <div className="bg-card border border-border rounded-[2rem] p-7 space-y-5">
        <div>
          <h3 className="text-xl font-black flex items-center gap-2">
            <Calendar size={20} className="text-amber-500" />
            Override Tanggal Spesifik (untuk OTR / CU 1x)
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Tambahkan <strong>BLOCK</strong> (cuti / sibuk / otomatis dibuat saat klik Tandai Menang OTR/CU) atau <strong>EXTRA</strong> (jam kosong tambahan khusus tanggal tertentu).
          </p>
        </div>

        {isAdmin && (
          <form onSubmit={handleCreateOverride} className="p-4 bg-muted/40 border border-border rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
            <div>
              <label className="text-[10px] font-black uppercase text-muted-foreground">Tanggal</label>
              <input
                type="date"
                required
                value={ovDate}
                onChange={(e) => setOvDate(e.target.value)}
                className="mt-1 w-full px-3 py-2 bg-card border border-border rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-muted-foreground">Tipe</label>
              <select
                value={ovKind}
                onChange={(e) => setOvKind(e.target.value as DateOverrideKind)}
                className="mt-1 w-full px-3 py-2 bg-card border border-border rounded-xl text-xs font-bold"
              >
                <option value="BLOCK">BLOCK (Sibuk)</option>
                <option value="EXTRA">EXTRA (Luang)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-muted-foreground">Mulai</label>
              <input
                type="time"
                value={ovStart}
                onChange={(e) => setOvStart(e.target.value)}
                className="mt-1 w-full px-3 py-2 bg-card border border-border rounded-xl text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-muted-foreground">Selesai</label>
              <input
                type="time"
                value={ovEnd}
                onChange={(e) => setOvEnd(e.target.value)}
                className="mt-1 w-full px-3 py-2 bg-card border border-border rounded-xl text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-muted-foreground">Catatan</label>
              <input
                type="text"
                placeholder="mis. Cuti / Libur"
                value={ovReason}
                onChange={(e) => setOvReason(e.target.value)}
                className="mt-1 w-full px-3 py-2 bg-card border border-border rounded-xl text-xs font-bold"
              />
            </div>
            <button
              type="submit"
              disabled={addingOv}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Plus size={14} /> Tambah
            </button>
          </form>
        )}

        {overrides.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">Belum ada override tanggal khusus.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {overrides.map((ov) => (
              <div key={ov.id} className="bg-muted/30 border border-border rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                      ov.kind === 'BLOCK' ? 'bg-rose-500/15 text-rose-500' : 'bg-emerald-500/15 text-emerald-500'
                    }`}>
                      {ov.kind}
                    </span>
                    <span className="font-mono font-black text-xs">{ov.date}</span>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground mt-1">
                    {minutesToTime(ov.start_minute)} – {ov.end_minute >= 1440 ? '24:00' : minutesToTime(ov.end_minute)} WIB
                  </p>
                  {ov.reason && <p className="text-xs text-muted-foreground truncate mt-0.5">{ov.reason}</p>}
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => onDeleteOverride(ov.id)}
                    className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleTab;

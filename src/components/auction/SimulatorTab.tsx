import React, { useState } from 'react';
import apiClient from '../../api/client';
import type { SimulateResult } from '../../types';
import toast from 'react-hot-toast';
import { CheckCircle2, Play, Sparkles, XCircle, Zap } from 'lucide-react';

interface SimulatorTabProps {
  accountId: number;
}

const DAY_LABELS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const SAMPLE_MESSAGES: { label: string; text: string }[] = [
  {
    label: 'UNITY 2 Slot (AND)',
    text: 'Need tutor UNITY\n(FRI 20.30, SAT 12.00)\nhttps://bootcamp.amocrm.ru/leads/detail/29025198',
  },
  {
    label: 'UNITY + History Trap + Full Eng',
    text: 'Need tutor UNITY private\nKelas baru lanjutan dari AI to FE to PP2\n(SAT 12.00, FRI 20.30)\nTutor perempuan/laki2, full english\nhttps://bootcamp.amocrm.ru/leads/detail/29025198',
  },
  {
    label: 'VP Pilihan OR + Perempuan',
    text: 'NEED TUTOR PRIVATE\nVP\nJumat atau Sabtu pkl. 19:00 WIB (1 kali seminggu)\nPerempuan\nFull English\nhttps://bootcamp.amocrm.ru/leads/detail/28851022',
  },
  {
    label: 'OTR PREM Hari Ini (90m)',
    text: 'NEED TUTOR OTR\nTutor Sakit\n\nHari ini, 19.00 WIB\nCK Group PREM\nLesson 26\nhttps://lms.algonova.id/group/view/2038808',
  },
  {
    label: 'CU Tanpa Nama Hari',
    text: 'NEED TUTOR\nCU 1x\nDGS, Lesson 1\n\nJadwal, Tgl 24 Nov 2026, jam 19.00\nTutor bebas\nBahasa indonesia',
  },
  {
    label: 'DG Junior OR (WIT -> WIB)',
    text: 'IND 1-1 DG 12235 (WED 14.00) https://lms.algonova.id/group/view/2128361 NEED TUTOR PRIVATE DG JUNIOR 📍GRAP DES JR\n\njadwal :\nREQUEST : SENIN / RABU / SABTU 16.00 WIT = 14:00 WIB / MINGGU 19.00 WIT = 17:00 WIB\n\nnote :\n- bahasa indonesia\n- male/female aman gpp..',
  },
  {
    label: 'FR NO NEGO',
    text: 'NEED TUTOR FOREVER REPLACEMENT\n\nIND 1-1 DL 413 (WED 18.30) <— NO NEGO\nTutor Perempuan\nBahasa Indonesia',
  },
];

const fmtMin = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

const SimulatorTab: React.FC<SimulatorTabProps> = ({ accountId }) => {
  const [text, setText] = useState(SAMPLE_MESSAGES[0].text);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SimulateResult | null>(null);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setRunning(true);
    try {
      const res = await apiClient.post<SimulateResult>(`/accounts/${accountId}/auction/simulate`, { text });
      setResult(res.data);
    } catch {
      toast.error('Gagal menjalankan simulasi parser.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div className="xl:col-span-6 bg-card border border-border rounded-[2rem] p-7 space-y-5">
        <div>
          <h3 className="text-xl font-black">Simulator Parser & Matcher</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Tempel pesan lelang CS di sini untuk menguji hasil parsing dan kecocokan dengan profil + jadwal kosongmu secara aman (tanpa mengirim ke Telegram).
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {SAMPLE_MESSAGES.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setText(s.text)}
              className="px-3 py-1.5 bg-muted hover:bg-indigo-600/15 hover:text-indigo-400 rounded-xl text-[11px] font-bold transition-all"
            >
              {s.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSimulate} className="space-y-4">
          <textarea
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tempel pesan CS di sini..."
            className="w-full p-4 bg-muted border border-border rounded-2xl font-mono text-xs outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={running}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Play size={15} />
            {running ? 'Menganalisis...' : 'Test Parse & Match'}
          </button>
        </form>
      </div>

      <div className="xl:col-span-6 bg-card border border-border rounded-[2rem] p-7 space-y-5">
        <h3 className="text-xl font-black">Hasil Evaluasi</h3>

        {!result ? (
          <div className="py-20 text-center text-muted-foreground text-sm">
            Klik <strong>Test Parse & Match</strong> untuk melihat hasil ekstraksi dan simulasi keputusan bot.
          </div>
        ) : (
          <div className="space-y-5">
            {/* Decision Banner */}
            <div className={`p-5 rounded-2xl border flex items-start gap-3 ${
              result.would_bid
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              {result.would_bid ? <CheckCircle2 size={22} className="shrink-0 mt-0.5" /> : <XCircle size={22} className="shrink-0 mt-0.5" />}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="font-black text-sm uppercase tracking-wider">
                    {result.would_bid ? `COCOK — AKAN MEMBALAS (${result.decision})` : `DILEWATI (${result.decision})`}
                  </p>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/20 text-[10px] font-mono">
                    <Zap size={11} /> {result.parse_micros} µs · {result.parser_source}
                  </span>
                </div>
                {result.would_bid && result.reply_text && (
                  <p className="mt-2 text-sm font-mono bg-black/20 px-3 py-2 rounded-xl text-white">
                    Balasan: "{result.reply_text}"
                  </p>
                )}
                {result.skip_reason && (
                  <p className="mt-1 text-xs font-medium">{result.skip_reason}</p>
                )}
              </div>
            </div>

            {/* Extracted Fields */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Course', value: result.parsed.course || '—' },
                { label: 'Jenis Lelang', value: result.parsed.auction_type || '—' },
                { label: 'Format & Durasi', value: `${result.parsed.class_format || '—'} (${result.parsed.duration_min}m)` },
                { label: 'Syarat Gender', value: result.parsed.required_gender + (result.parsed.no_nego ? ' (NO NEGO)' : '') },
                { label: 'Syarat Bahasa', value: result.parsed.language },
                { label: 'Confidence', value: result.parsed.confidence },
              ].map((cell, i) => (
                <div key={i} className="bg-muted/40 border border-border rounded-xl p-3">
                  <p className="text-[10px] font-black uppercase text-muted-foreground">{cell.label}</p>
                  <p className="font-black text-xs mt-1">{cell.value}</p>
                </div>
              ))}
            </div>

            {/* Parsed Schedules */}
            <div className="bg-muted/40 border border-border rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Jadwal Terdeteksi (WIB)
                </span>
                {result.parsed.schedule_logic && (
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 text-[10px] font-black">
                    LOGIC: {result.parsed.schedule_logic}
                  </span>
                )}
              </div>
              {result.parsed.schedules.length === 0 ? (
                <p className="text-xs text-rose-400 italic">Tidak ada jadwal terdeteksi.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {result.parsed.schedules.map((s, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-mono font-bold">
                      {DAY_LABELS[s.day_of_week]} {fmtMin(s.start_minute)} WIB
                      {s.specific_date ? ` (${s.specific_date})` : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {result.parsed.has_stop_keyword && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-400 font-bold flex items-center gap-2">
                <Sparkles size={14} /> Stop keyword terdeteksi: {result.parsed.stop_keyword_found}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulatorTab;

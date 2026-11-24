import React from 'react';
import type { AuctionCatalog, ClassAuctionProfile } from '../../types';
import {
  Save,
  ShieldAlert,
  Zap,
  Check,
  Sparkles,
  Bell,
  MessageSquare,
} from 'lucide-react';

interface ProfileTabProps {
  profile: ClassAuctionProfile;
  catalog: AuctionCatalog;
  isAdmin: boolean;
  saving: boolean;
  onChange: (next: ClassAuctionProfile) => void;
  onSave: () => void;
}

const AUCTION_TYPE_LABELS: Record<string, { title: string; desc: string }> = {
  NEW: { title: 'NEW (Kelas Baru)', desc: 'Need Tutor / kelas baru / graduation' },
  OTR: { title: 'OTR (Pengganti 1x)', desc: 'One Time Replacement / Cuti / Sakit' },
  CU: { title: 'CU / EC (Catch Up)', desc: 'Susulan 1x / Extra Class (60m)' },
  FR: { title: 'FR (Forever Replacement)', desc: 'Pengganti permanen kelas berjalan' },
};

const FORMAT_LABELS: Record<string, { title: string; desc: string }> = {
  PRIVATE: { title: 'Private / 1-1', desc: 'Default durasi 60 menit' },
  GROUP: { title: 'Group / PREM', desc: 'Default durasi 90 menit (termasuk kode IND-XX-NNN)' },
};

const LANGUAGE_LABELS: Record<string, string> = {
  INDONESIA: 'Bahasa Indonesia',
  BILINGUAL: 'Bilingual (Indo + Eng)',
  FULL_ENGLISH: 'Full English',
};

const ProfileTab: React.FC<ProfileTabProps> = ({
  profile,
  catalog,
  isAdmin,
  saving,
  onChange,
  onSave,
}) => {
  const toggleArrayItem = (field: 'allowed_courses' | 'allowed_languages' | 'allowed_auction_types' | 'allowed_formats', value: string) => {
    const current = profile[field] ?? [];
    const exists = current.includes(value);
    const next = exists ? current.filter((v) => v !== value) : [...current, value];
    onChange({ ...profile, [field]: next });
  };

  const updateReplyOverride = (auctionType: string, value: string) => {
    onChange({
      ...profile,
      reply_overrides: {
        ...(profile.reply_overrides ?? {}),
        [auctionType]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Master Switch & Shadow / Dry-Run Banner */}
      <div className={`rounded-[2rem] p-6 border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        profile.dry_run
          ? 'bg-amber-500/10 border-amber-500/30'
          : 'bg-emerald-500/10 border-emerald-500/30'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            profile.dry_run ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'
          }`}>
            {profile.dry_run ? <ShieldAlert size={24} /> : <Zap size={24} />}
          </div>
          <div>
            <h3 className="font-black text-lg">
              {profile.dry_run ? 'Shadow / Dry-Run Mode AKTIF (Aman — Tidak Mengirim Pesan)' : 'LIVE AUTO-BID AKTIF (Instan 0ms)'}
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              {profile.dry_run
                ? 'Bot tetap memantau grup secara real-time, mem-parse, dan mencatat hasil kecocokan di tab Riwayat Lelang tanpa mengirim balasan ke Telegram.'
                : 'Bot langsung membalas pesan CS yang cocok di grup pantauan begitu pesan masuk.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 shrink-0">
          <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider cursor-pointer bg-card px-4 py-2.5 rounded-xl border border-border">
            <input
              type="checkbox"
              disabled={!isAdmin}
              checked={profile.is_active}
              onChange={(e) => onChange({ ...profile, is_active: e.target.checked })}
              className="w-4 h-4 accent-emerald-600"
            />
            Engine Aktif
          </label>
          <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider cursor-pointer bg-card px-4 py-2.5 rounded-xl border border-border">
            <input
              type="checkbox"
              disabled={!isAdmin}
              checked={profile.dry_run}
              onChange={(e) => onChange({ ...profile, dry_run: e.target.checked })}
              className="w-4 h-4 accent-amber-500"
            />
            Dry-Run Mode
          </label>
        </div>
      </div>

      {/* Course Capabilities */}
      <div className="bg-card border border-border rounded-[2rem] p-7 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black">Mata Pelajaran yang Dikuasai ({profile.allowed_courses.length} / {catalog.courses.length})</h3>
            <p className="text-xs text-muted-foreground">Klik mata pelajaran Algonova yang bisa kamu ajar. Pesan di luar daftar ini otomatis dilewati.</p>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onChange({ ...profile, allowed_courses: catalog.courses.map((c) => c.code) })}
                className="px-3 py-1.5 bg-muted hover:bg-border rounded-xl text-[10px] font-black uppercase tracking-wider"
              >
                Pilih Semua
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...profile, allowed_courses: [] })}
                className="px-3 py-1.5 bg-muted hover:bg-border rounded-xl text-[10px] font-black uppercase tracking-wider"
              >
                Kosongkan
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {catalog.courses.map((course) => {
            const active = profile.allowed_courses.includes(course.code);
            return (
              <button
                key={course.code}
                type="button"
                disabled={!isAdmin}
                onClick={() => toggleArrayItem('allowed_courses', course.code)}
                className={`text-left p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  active
                    ? 'bg-indigo-600/10 border-indigo-500 ring-1 ring-indigo-500/30'
                    : 'bg-muted/30 border-border hover:border-indigo-500/30'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-black text-xs px-2 py-0.5 rounded-md ${
                      active ? 'bg-indigo-600 text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      {course.code}
                    </span>
                    <span className="font-bold text-sm truncate">{course.name}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5 truncate">
                    Alias: {course.aliases.join(', ')}
                  </p>
                </div>
                {active && <Check size={16} className="text-indigo-500 shrink-0 mt-0.5" />}
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-2.5 text-xs font-medium text-muted-foreground pt-2 cursor-pointer">
          <input
            type="checkbox"
            disabled={!isAdmin}
            checked={profile.generic_dg_matches_any}
            onChange={(e) => onChange({ ...profile, generic_dg_matches_any: e.target.checked })}
            className="w-4 h-4 accent-indigo-600"
          />
          Jika CS hanya menulis <code>"Graphic Design"</code> tanpa Junior/Senior, anggap cocok bila saya menguasai <strong>DGJ atau DGS</strong> (jika mati, dipetakan ke DGJ).
        </label>
      </div>

      {/* Tutor Identity, Languages, Types & Formats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender & Languages */}
        <div className="bg-card border border-border rounded-[2rem] p-7 space-y-6">
          <h3 className="text-lg font-black">Profil Gender & Bahasa</h3>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Gender Saya</label>
            <div className="grid grid-cols-2 gap-3">
              {(['MALE', 'FEMALE'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  disabled={!isAdmin}
                  onClick={() => onChange({ ...profile, tutor_gender: g })}
                  className={`py-3 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all ${
                    profile.tutor_gender === g
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-muted/40 border-border text-muted-foreground'
                  }`}
                >
                  {g === 'MALE' ? 'Laki-laki' : 'Perempuan'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-border">
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div>
                <p className="text-sm font-bold">Izinkan Nego Gender</p>
                <p className="text-xs text-muted-foreground">Bila kelas meminta gender berbeda, tetap bid dengan template nego gender.</p>
              </div>
              <input
                type="checkbox"
                disabled={!isAdmin}
                checked={profile.allow_gender_nego}
                onChange={(e) => onChange({ ...profile, allow_gender_nego: e.target.checked })}
                className="w-5 h-5 accent-indigo-600"
              />
            </label>

            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div>
                <p className="text-sm font-bold">Hormati Tanda "NO NEGO"</p>
                <p className="text-xs text-muted-foreground">Lewati otomatis jika gender beda dan pesan mencantumkan NO NEGO.</p>
              </div>
              <input
                type="checkbox"
                disabled={!isAdmin}
                checked={profile.respect_no_nego}
                onChange={(e) => onChange({ ...profile, respect_no_nego: e.target.checked })}
                className="w-5 h-5 accent-indigo-600"
              />
            </label>
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bahasa Pengajaran</label>
            <div className="flex flex-wrap gap-2">
              {catalog.languages.map((lang) => {
                const active = profile.allowed_languages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    disabled={!isAdmin}
                    onClick={() => toggleArrayItem('allowed_languages', lang)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      active
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-muted/40 border-border text-muted-foreground'
                    }`}
                  >
                    {LANGUAGE_LABELS[lang] || lang}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Auction Types & Formats */}
        <div className="bg-card border border-border rounded-[2rem] p-7 space-y-6">
          <h3 className="text-lg font-black">Jenis Lelang & Format Kelas</h3>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Jenis Lelang Aktif</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {catalog.auction_types.map((t) => {
                const active = profile.allowed_auction_types.includes(t);
                const meta = AUCTION_TYPE_LABELS[t];
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={!isAdmin}
                    onClick={() => toggleArrayItem('allowed_auction_types', t)}
                    className={`text-left p-3.5 rounded-2xl border transition-all ${
                      active ? 'bg-indigo-600/10 border-indigo-500' : 'bg-muted/30 border-border opacity-60'
                    }`}
                  >
                    <p className="font-black text-xs">{meta?.title || t}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{meta?.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Format Kelas & Durasi</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {catalog.formats.map((f) => {
                const active = profile.allowed_formats.includes(f);
                const meta = FORMAT_LABELS[f];
                return (
                  <button
                    key={f}
                    type="button"
                    disabled={!isAdmin}
                    onClick={() => toggleArrayItem('allowed_formats', f)}
                    className={`text-left p-3.5 rounded-2xl border transition-all ${
                      active ? 'bg-indigo-600/10 border-indigo-500' : 'bg-muted/30 border-border opacity-60'
                    }`}
                  >
                    <p className="font-black text-xs">{meta?.title || f}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{meta?.desc}</p>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Durasi Private (menit)</label>
                <input
                  type="number"
                  disabled={!isAdmin}
                  value={profile.private_duration_min}
                  onChange={(e) => onChange({ ...profile, private_duration_min: Number(e.target.value) })}
                  className="mt-1 w-full px-3 py-2 bg-muted border border-border rounded-xl text-sm font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Durasi Group/PREM (menit)</label>
                <input
                  type="number"
                  disabled={!isAdmin}
                  value={profile.group_duration_min}
                  onChange={(e) => onChange({ ...profile, group_duration_min: Number(e.target.value) })}
                  className="mt-1 w-full px-3 py-2 bg-muted border border-border rounded-xl text-sm font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reply Templates & Operational Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-[2rem] p-7 space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-indigo-500" />
            <h3 className="text-lg font-black">Template Balasan</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Balasan Default</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={profile.default_reply}
                onChange={(e) => onChange({ ...profile, default_reply: e.target.value })}
                placeholder="Me"
                className="mt-1 w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Balasan Nego Gender</label>
              <input
                type="text"
                disabled={!isAdmin}
                value={profile.gender_nego_reply}
                onChange={(e) => onChange({ ...profile, gender_nego_reply: e.target.value })}
                placeholder="Me, nego gender"
                className="mt-1 w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-bold"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Override per Jenis Lelang (kosongkan = pakai Default)
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {catalog.auction_types.map((t) => (
                <div key={t}>
                  <span className="text-[10px] font-bold text-muted-foreground">{t}</span>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={profile.reply_overrides?.[t] ?? ''}
                    onChange={(e) => updateReplyOverride(t, e.target.value)}
                    placeholder={`Default (${profile.default_reply || 'Me'})`}
                    className="mt-0.5 w-full px-3 py-2 bg-muted border border-border rounded-xl text-xs font-bold"
                  />
                </div>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-xs font-medium pt-2 cursor-pointer">
            <input
              type="checkbox"
              disabled={!isAdmin}
              checked={profile.include_matched_slot_on_or}
              onChange={(e) => onChange({ ...profile, include_matched_slot_on_or: e.target.checked })}
              className="w-4 h-4 accent-indigo-600"
            />
            Sertakan slot terpilih pada jadwal pilihan OR (contoh: <code>"Me, Sabtu 19:00"</code>)
          </label>
        </div>

        <div className="bg-card border border-border rounded-[2rem] p-7 space-y-4">
          <h3 className="text-lg font-black">Kecepatan, AI Fallback & Keamanan</h3>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Min Delay (ms)</label>
              <input
                type="number"
                min={0}
                disabled={!isAdmin}
                value={profile.min_delay_ms}
                onChange={(e) => onChange({ ...profile, min_delay_ms: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-2 bg-muted border border-border rounded-xl text-sm font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Max Delay (ms)</label>
              <input
                type="number"
                min={0}
                disabled={!isAdmin}
                value={profile.max_delay_ms}
                onChange={(e) => onChange({ ...profile, max_delay_ms: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-2 bg-muted border border-border rounded-xl text-sm font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Cooldown (detik)</label>
              <input
                type="number"
                min={0}
                disabled={!isAdmin}
                value={profile.slot_cooldown_sec}
                onChange={(e) => onChange({ ...profile, slot_cooldown_sec: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-2 bg-muted border border-border rounded-xl text-sm font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stop Keywords (pisahkan koma)</label>
            <input
              type="text"
              disabled={!isAdmin}
              value={profile.stop_keywords}
              onChange={(e) => onChange({ ...profile, stop_keywords: e.target.value })}
              className="mt-1 w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-xs font-mono"
            />
          </div>

          <div className="space-y-3 pt-2 border-t border-border">
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-purple-400" />
                <div>
                  <p className="text-xs font-bold">Gemini JSON Fallback (Format Ambigu)</p>
                  <p className="text-[11px] text-muted-foreground">Hanya aktif jika parser &lt;1ms tidak yakin (LOW confidence).</p>
                </div>
              </div>
              <input
                type="checkbox"
                disabled={!isAdmin}
                checked={profile.enable_ai_fallback}
                onChange={(e) => onChange({ ...profile, enable_ai_fallback: e.target.checked })}
                className="w-4 h-4 accent-purple-600"
              />
            </label>

            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div className="flex items-center gap-2">
                <Bell size={15} className="text-sky-400" />
                <div>
                  <p className="text-xs font-bold">Notifikasi Saved Messages Telegram (Async 0ms)</p>
                  <p className="text-[11px] text-muted-foreground">Kirim ringkasan otomatis ke Saved Messages setelah bid terkirim.</p>
                </div>
              </div>
              <input
                type="checkbox"
                disabled={!isAdmin}
                checked={profile.notify_saved_messages}
                onChange={(e) => onChange({ ...profile, notify_saved_messages: e.target.checked })}
                className="w-4 h-4 accent-sky-600"
              />
            </label>

            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div>
                <p className="text-xs font-bold">Abaikan Pesan Reply Tutor Lain</p>
                <p className="text-[11px] text-muted-foreground">Tetap memproses postingan utama di dalam forum topic.</p>
              </div>
              <input
                type="checkbox"
                disabled={!isAdmin}
                checked={profile.ignore_replies}
                onChange={(e) => onChange({ ...profile, ignore_replies: e.target.checked })}
                className="w-4 h-4 accent-indigo-600"
              />
            </label>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Menyimpan...' : 'Simpan Profil Tutor'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileTab;

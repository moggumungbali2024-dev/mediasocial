import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { usePortal } from '../context/PortalContext.tsx';
import {
  MessageSquare,
  X,
  Send,
  Phone,
  CheckCircle2,
  Copy,
  ExternalLink,
  Store,
  Sparkles,
  FileText,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Branch } from '../types.ts';

interface WhatsAppBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultBranch?: Branch | null;
  defaultTemplateType?: 'design_ready' | 'cutoff_warning' | 'invoice_issued' | 'influencer_visit';
}

export const WhatsAppBroadcastModal: React.FC<WhatsAppBroadcastModalProps> = ({
  isOpen,
  onClose,
  defaultBranch,
  defaultTemplateType = 'design_ready'
}) => {
  const {
    branches,
    currentBranch,
    whitelabelConfig,
    themeColors,
    simulatedDate,
    users,
    language
  } = usePortal();

  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    defaultBranch?.id || currentBranch?.id || branches[0]?.id || ''
  );
  const [templateType, setTemplateType] = useState(defaultTemplateType);
  const [customPhone, setCustomPhone] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const targetBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  // Find store manager / owner contact for this branch
  const branchUser = users.find(
    (u) => u.branch_id === targetBranch.id && (u.role === 'branch_manager' || u.role === 'branch_owner')
  );

  const phoneRaw = customPhone || branchUser?.phone || targetBranch.phone || '+6281234567890';
  // Clean phone number for wa.me: remove non-numeric except leading +
  const phoneClean = phoneRaw.replace(/[^0-9]/g, '');

  const generateMessageText = (): string => {
    const brandName = whitelabelConfig.brand_name;
    const branchName = targetBranch.name;
    const bankInfo = `${whitelabelConfig.bank_name} (${whitelabelConfig.bank_account_number} a/n ${whitelabelConfig.bank_account_name})`;

    switch (templateType) {
      case 'design_ready':
        return `Halo ${branchUser?.full_name || 'Bapak/Ibu Store Manager'} - ${branchName} 🍜\n\nKabar gembira! Request materi desain & konten sosial media Anda telah selesai dikerjakan oleh tim kreatif ${brandName} HQ dan siap untuk ditayangkan.\n\nSilakan cek portal dan unduh aset final di:\n${window.location.origin}\n\nCatatan: ${customNote || 'Mohon jadwalkan postingan sesuai waktu prime time outlet.'}\n\nTerima kasih,\nTim Kreatif ${brandName} HQ`;

      case 'cutoff_warning':
        return `PENTING: Peringatan Cut-off Promo Bulanan (${brandName} HQ) ⚠️\n\nHalo ${branchName},\nMengingatkan bahwa batas akhir (Cut-off) pengajuan materi promo untuk bulan depan jatuh pada tanggal 25 ${new Date().toLocaleString('id-ID', { month: 'long' })} pukul 23:59 WITA.\n\nSisa waktu: 3 Hari lagi. Pastikan promo outlet Anda telah disubmit melalui Portal Sosial Media agar dapat masuk jadwal rotasi tepat waktu.\n\nSubmit promo sekarang: ${window.location.origin}\n\nSalam,\nOperasional ${brandName}`;

      case 'invoice_issued':
        return `Notifikasi Tagihan Retainer Bulanan - ${branchName} 🧾\n\nHalo ${branchUser?.full_name || 'Owner'} ${branchName},\nInvoice retainer bulanan dan layanan konten outsource Anda untuk periode berjalan telah terbit.\n\nNominal: Rp${whitelabelConfig.default_monthly_retainer.toLocaleString('id-ID')}\nTransfer ke: ${bankInfo}\nJatuh Tempo: 7 hari kalender.\n\nSetelah melakukan transfer, harap upload bukti bayar di portal:\n${window.location.origin}\n\nTerima kasih atas kerjasamanya!`;

      case 'influencer_visit':
        return `Konfirmasi Jadwal Kunjungan Influencer - ${branchName} 📸\n\nHalo tim ${branchName},\nKami telah menjadwalkan kunjungan Food Influencer/KOL ke outlet Anda:\n\nInfluencer: @madediningbali\nJadwal: Weekend ini (18:00 WITA)\nVoucher Code: MANDABALI15 (Diskon 15%)\n\nMohon siapkan 2 menu signature dan sambut kedatangan mereka dengan ramah.\n\nSalam,\nMarketing ${brandName} HQ`;

      default:
        return `Halo ${branchName}, pesan resmi dari ${brandName} HQ.`;
    }
  };

  const messageText = generateMessageText();
  const encodedText = encodeURIComponent(messageText);
  const waUrl = `https://wa.me/${phoneClean}?text=${encodedText}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500 text-white shadow-sm">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white font-['Space_Grotesk']">
                WhatsApp Dispatcher &amp; Reminder
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kirim notifikasi instan 1-klik ke Store Manager / Owner Cabang via WhatsApp
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Branch & Phone Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Pilih Target Cabang
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.location})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Nomor WhatsApp Penerima
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={phoneRaw}
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-emerald-500 pl-8"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>
          </div>

          {/* Template Selector Tabs */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
              Pilih Jenis Template Pesan
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setTemplateType('design_ready')}
                className={`p-2.5 rounded-2xl border text-left transition font-semibold ${
                  templateType === 'design_ready'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-300 font-bold shadow-2xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                🎨 Desain Selesai
              </button>

              <button
                type="button"
                onClick={() => setTemplateType('cutoff_warning')}
                className={`p-2.5 rounded-2xl border text-left transition font-semibold ${
                  templateType === 'cutoff_warning'
                    ? 'border-red-500 bg-red-50 dark:bg-red-950/60 text-red-950 dark:text-red-300 font-bold shadow-2xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                ⚠️ Cut-off H-3
              </button>

              <button
                type="button"
                onClick={() => setTemplateType('invoice_issued')}
                className={`p-2.5 rounded-2xl border text-left transition font-semibold ${
                  templateType === 'invoice_issued'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-300 font-bold shadow-2xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                🧾 Invoice Terbit
              </button>

              <button
                type="button"
                onClick={() => setTemplateType('influencer_visit')}
                className={`p-2.5 rounded-2xl border text-left transition font-semibold ${
                  templateType === 'influencer_visit'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/60 text-purple-950 dark:text-purple-300 font-bold shadow-2xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                📸 Influencer Visit
              </button>
            </div>
          </div>

          {/* Generated Text Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Preview Pesan WhatsApp:</span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Pesan'}</span>
              </button>
            </div>

            <textarea
              rows={8}
              readOnly
              value={messageText}
              className="w-full text-xs p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono leading-relaxed text-slate-800 dark:text-slate-200 outline-hidden"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Tujuan: <strong>+{phoneClean}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
            >
              Tutup
            </button>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              <span>Buka WhatsApp Web / App</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

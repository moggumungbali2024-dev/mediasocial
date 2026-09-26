import React from 'react';
import { usePortal } from '../context/PortalContext.tsx';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Download,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Building,
  Check,
  FileX
} from 'lucide-react';
import { Invoice } from '../types.ts';

interface PaymentProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export const PaymentProofModal: React.FC<PaymentProofModalProps> = ({
  isOpen,
  onClose,
  invoice
}) => {
  const {
    branches,
    whitelabelConfig,
    verifyPayment,
    isHQ,
    language,
    t
  } = usePortal();

  if (!isOpen || !invoice) return null;

  const branchObj = branches.find((b) => b.id === invoice.branch_id);
  const proofUrl = invoice.proof_url || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800';

  const handleVerify = () => {
    verifyPayment(invoice.id, true);
    onClose();
  };

  const handleReject = () => {
    verifyPayment(invoice.id, false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-orange-500 text-white shadow-sm">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white font-['Space_Grotesk']">
                {t('paymentProofInspectTitle')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Invoice: <strong className="font-mono text-slate-800 dark:text-slate-200">{invoice.invoice_number}</strong> ({branchObj?.name})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Invoice Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase">{t('totalInvoice')}</span>
              <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                {whitelabelConfig.currency_symbol} {invoice.total_amount.toLocaleString()}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase">{t('paymentStatus')}</span>
              <div className="mt-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  invoice.status === 'paid'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    : invoice.status === 'proof_uploaded'
                    ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                }`}>
                  {invoice.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase">{language === 'ko' ? '납부 기한' : 'Due Date'}</span>
              <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mt-1">
                {invoice.due_date}
              </div>
            </div>
          </div>

          {/* Transfer Proof Notes */}
          {invoice.proof_notes && (
            <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs space-y-1">
              <div className="font-bold text-amber-950 dark:text-amber-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>{t('senderNote')}:</span>
              </div>
              <p className="text-amber-900 dark:text-amber-200 font-mono text-[11px] leading-relaxed">
                "{invoice.proof_notes}"
              </p>
            </div>
          )}

          {/* Visual Proof Slip Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">{t('receiptSlip')}:</span>
              <a
                href={proofUrl}
                target="_blank"
                rel="noreferrer"
                className="text-orange-600 dark:text-orange-400 hover:underline font-bold flex items-center gap-1 text-[11px]"
              >
                <span>{language === 'ko' ? '원본 이미지 보기' : 'Open Full Image'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden flex items-center justify-center max-h-96 group relative">
              <img
                src={proofUrl}
                alt="Payment Proof"
                className="max-h-96 w-auto object-contain rounded-xl transition duration-300"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
          >
            {t('close')}
          </button>

          {isHQ && invoice.status !== 'paid' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReject}
                className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-400 font-bold text-xs border border-red-200 dark:border-red-800 transition flex items-center gap-1.5"
              >
                <FileX className="w-4 h-4" />
                <span>{t('rejectProof')}</span>
              </button>

              <button
                type="button"
                onClick={handleVerify}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{t('verifyMarkPaid')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { usePortal } from '../context/PortalContext.tsx';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  Building2,
  CreditCard,
  QrCode,
  ShieldCheck,
  Calendar,
  Share2
} from 'lucide-react';
import { Invoice } from '../types.ts';

interface PrintableInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export const PrintableInvoiceModal: React.FC<PrintableInvoiceModalProps> = ({
  isOpen,
  onClose,
  invoice
}) => {
  const { whitelabelConfig, branches, themeColors, language } = usePortal();

  if (!isOpen || !invoice) return null;

  const isKo = language === 'ko';
  const branch = branches.find((b) => b.id === invoice.branch_id) || branches[0];
  const isPaid = invoice.status === 'paid';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Hidden on print) */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/90 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-slate-900 dark:text-white font-['Space_Grotesk']">
              Official Invoice Preview: {invoice.invoice_number}
            </span>
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                isPaid ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
              }`}
            >
              {isPaid ? (isKo ? 'PAID / 결제완료' : 'PAID / SETTLED') : (isKo ? '미결제 (UNPAID)' : 'UNPAID')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isKo ? '인쇄 / PDF 저장' : 'Print / Save as PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Paper */}
        <div className="p-8 sm:p-10 space-y-6 overflow-y-auto bg-white text-slate-900 font-sans print:p-0 relative">
          {/* Watermark Stamp */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-10 rotate-[-25deg] text-center z-0">
            <div
              className={`text-7xl sm:text-8xl font-black uppercase tracking-widest border-8 rounded-3xl p-6 ${
                isPaid ? 'border-emerald-600 text-emerald-600' : 'border-red-600 text-red-600'
              }`}
            >
              {isPaid ? (isKo ? 'PAID / 결제완료' : 'PAID / SETTLED') : 'OFFICIAL INVOICE'}
            </div>
          </div>

          {/* 1. Header: Brand Info & Invoice Title */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b-2 border-slate-900 relative z-10">
            <div className="flex items-center gap-3">
              {whitelabelConfig.brand_logo_url ? (
                <img
                  src={whitelabelConfig.brand_logo_url}
                  alt="Logo"
                  className="w-14 h-14 object-contain rounded-2xl bg-white p-1 border border-slate-200"
                />
              ) : (
                <div
                  style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl tracking-tighter shadow-md"
                >
                  {whitelabelConfig.brand_monogram || 'MG'}
                </div>
              )}
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 font-['Space_Grotesk'] uppercase">
                  {whitelabelConfig.company_legal_name}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {whitelabelConfig.brand_name} {whitelabelConfig.brand_subtitle}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {whitelabelConfig.hq_address} • {whitelabelConfig.contact_whatsapp}
                </p>
              </div>
            </div>

            <div className="sm:text-right">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight font-['Space_Grotesk'] uppercase">
                INVOICE
              </h2>
              <div className="font-mono text-xs font-bold text-slate-700 mt-1">
                {invoice.invoice_number}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Issue Date: <strong>{invoice.created_at || '2026-09-21'}</strong>
              </div>
              <div className="text-[11px] text-red-600 font-semibold">
                Due Date: <strong>{invoice.due_date}</strong>
              </div>
            </div>
          </div>

          {/* 2. Bill To & Branch Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                BILL TO (CLIENT OUTLET)
              </span>
              <h3 className="font-black text-sm text-slate-900">{branch.name}</h3>
              <p className="text-xs text-slate-600 mt-0.5">{branch.location}, {branch.city}</p>
              <p className="text-xs text-slate-600 font-medium mt-1">
                PIC / Store Manager: <strong>{branch.contact_person}</strong> ({branch.phone})
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                PAYMENT DETAILS
              </span>
              <div className="text-xs space-y-1">
                <div>Bank: <strong className="text-slate-900">{whitelabelConfig.bank_name}</strong></div>
                <div>Account No: <strong className="font-mono text-slate-900">{whitelabelConfig.bank_account_number}</strong></div>
                <div>Account Name: <strong className="text-slate-900">{whitelabelConfig.bank_account_name}</strong></div>
                {whitelabelConfig.bank_swift_code && (
                  <div>SWIFT Code: <strong className="font-mono text-slate-900">{whitelabelConfig.bank_swift_code}</strong></div>
                )}
              </div>
            </div>
          </div>

          {/* 3. Itemized Table */}
          <div className="relative z-10">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b-2 border-slate-900 text-slate-900 font-black">
                  <th className="py-2.5 px-2">DESCRIPTION</th>
                  <th className="py-2.5 px-2 text-center">QTY</th>
                  <th className="py-2.5 px-2 text-right">UNIT PRICE</th>
                  <th className="py-2.5 px-2 text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-2">
                    <div className="font-bold text-slate-900">Monthly Social Media Outsource Retainer</div>
                    <div className="text-[11px] text-slate-500">
                      Include up to {whitelabelConfig.max_monthly_design_requests} design requests &amp; {whitelabelConfig.max_monthly_active_promos} promo campaigns (Periode: {invoice.period_month})
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center font-bold">1 Month</td>
                  <td className="py-3 px-2 text-right font-mono">
                    Rp{invoice.retainer_fee.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-2 text-right font-bold font-mono">
                    Rp{invoice.retainer_fee.toLocaleString('id-ID')}
                  </td>
                </tr>

                {invoice.visit_fee > 0 && (
                  <tr>
                    <td className="py-3 px-2">
                      <div className="font-bold text-slate-900">On-Site Photoshoot &amp; Video Production Visit</div>
                      <div className="text-[11px] text-slate-500">
                        Crew visit for Reels capture, high-res menu photoshoot &amp; b-roll assets.
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center font-bold">1 Session</td>
                    <td className="py-3 px-2 text-right font-mono">
                      Rp{invoice.visit_fee.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-2 text-right font-bold font-mono">
                      Rp{invoice.visit_fee.toLocaleString('id-ID')}
                    </td>
                  </tr>
                )}

                {invoice.ad_budget > 0 && (
                  <tr>
                    <td className="py-3 px-2">
                      <div className="font-bold text-slate-900">Meta &amp; Google Ads Campaign Deposit</div>
                      <div className="text-[11px] text-slate-500">
                        Targeted radius ads boosting for outlet local foodies.
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center font-bold">Deposit</td>
                    <td className="py-3 px-2 text-right font-mono">
                      Rp{invoice.ad_budget.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-2 text-right font-bold font-mono">
                      Rp{invoice.ad_budget.toLocaleString('id-ID')}
                    </td>
                  </tr>
                )}

                {invoice.custom_items &&
                  invoice.custom_items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-2 font-bold text-slate-900">{item.name}</td>
                      <td className="py-3 px-2 text-center font-bold">1</td>
                      <td className="py-3 px-2 text-right font-mono">
                        Rp{item.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-2 text-right font-bold font-mono">
                        Rp{item.amount.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* 4. Grand Total Summary */}
          <div className="pt-4 border-t-2 border-slate-900 flex justify-end relative z-10">
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono">Rp{invoice.total_amount.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>PPN / Tax (0% Franchise Retainer):</span>
                <span className="font-mono">Rp0</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>TOTAL AMOUNT:</span>
                <span className="font-mono text-base" style={{ color: themeColors.primary }}>
                  Rp{invoice.total_amount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* 5. Footer Notes & Authorization Stamp */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 text-[11px] text-slate-500 relative z-10">
            <div>
              <span className="font-bold text-slate-800 block mb-1">Important Notice:</span>
              <p className="leading-relaxed">
                {whitelabelConfig.invoice_note_footer ||
                  (isKo 
                    ? '송금 시 이체 메모에 청구서 번호를 기재해주세요. 영수증은 발행일로부터 7일 이내에 포털에 업로드해야 합니다.' 
                    : 'Please include the Invoice Number in your bank transfer description. Payment slips must be uploaded to the portal within 7 days of invoice issuance.')}
              </p>
            </div>

            <div className="sm:text-right">
              <div className="font-bold text-slate-800 uppercase">Authorized by HQ Finance</div>
              <div className="text-[10px] text-slate-400 mt-1">{whitelabelConfig.company_legal_name}</div>
              <div className="mt-4 inline-flex items-center gap-1 text-emerald-600 font-bold font-mono text-[10px] bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Digitally Verified &amp; Signed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

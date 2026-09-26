import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext.tsx';
import {
  TrendingUp,
  Tag,
  DollarSign,
  Users2,
  Sparkles,
  Plus,
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  Flame,
  Percent,
  Calculator,
  QrCode
} from 'lucide-react';
import { InfluencerVoucherCampaign } from '../types.ts';

export const InfluencerRoiTracker: React.FC = () => {
  const {
    voucherCampaigns,
    redeemVoucherCode,
    addVoucherCampaign,
    influencers,
    branches,
    themeColors,
    language
  } = usePortal();

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isCashierModalOpen, setIsCashierModalOpen] = useState(false);

  // Cashier simulation state
  const [cashierCode, setCashierCode] = useState('');
  const [cashierOrderAmount, setCashierOrderAmount] = useState<number>(250000);
  const [redeemFeedback, setRedeemFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // New campaign state
  const [newInfluencerId, setNewInfluencerId] = useState(influencers[0]?.id || '');
  const [newBranchId, setNewBranchId] = useState(branches[0]?.id || '');
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState(15);
  const [newValidUntil, setNewValidUntil] = useState('2026-10-31');
  const [newCost, setNewCost] = useState(1000000);

  // Aggregate stats
  const totalRedemptions = voucherCampaigns.reduce((acc, curr) => acc + curr.redemption_count, 0);
  const totalSalesDriven = voucherCampaigns.reduce((acc, curr) => acc + curr.total_sales_driven, 0);
  const totalCostSpent = voucherCampaigns.reduce((acc, curr) => acc + curr.cost_spent, 0);
  const overallRoiMultiplier = totalCostSpent > 0 ? (totalSalesDriven / totalCostSpent).toFixed(1) : '0';

  const handleRedeemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cashierCode) return;
    const res = redeemVoucherCode(cashierCode, Number(cashierOrderAmount));
    setRedeemFeedback(res);
    if (res.success) {
      setTimeout(() => {
        setRedeemFeedback(null);
        setIsCashierModalOpen(false);
        setCashierCode('');
      }, 2000);
    }
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const inf = influencers.find((i) => i.id === newInfluencerId) || influencers[0];
    const br = branches.find((b) => b.id === newBranchId) || branches[0];

    addVoucherCampaign({
      influencer_id: inf.id,
      influencer_name: inf.name,
      influencer_handle: inf.handle,
      branch_id: br.id,
      branch_name: br.name,
      code: newCode.toUpperCase().replace(/\s/g, ''),
      discount_percent: Number(newDiscount),
      valid_until: newValidUntil,
      cost_spent: Number(newCost),
      status: 'active'
    });

    setIsNewModalOpen(false);
    setNewCode('');
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="font-extrabold text-base text-slate-900 dark:text-white font-['Space_Grotesk']">
              {language === 'ko' ? '인플루언서 ROI & 바우처 전환 추적기' : 'Influencer ROI & Voucher Redemption Analytics'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Lacak performa konversi voucher diskon yang dibagikan influencer ke omzet riil per outlet
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Cashier Simulator Button */}
          <button
            type="button"
            onClick={() => setIsCashierModalOpen(true)}
            className="px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Simulasi Kasir (Redeem Code)</span>
          </button>

          {/* New Campaign Button */}
          <button
            type="button"
            onClick={() => setIsNewModalOpen(true)}
            style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
            className="px-4 py-2 rounded-2xl text-xs font-bold transition shadow-md flex items-center gap-1.5 hover:opacity-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Voucher Baru</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Omzet Dari Influencer</span>
            <div className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white font-['Space_Grotesk']">
            Rp{totalSalesDriven.toLocaleString('id-ID')}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
            <span>↑ Direct Attribution</span>
          </span>
        </div>

        {/* Total Redemptions */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Total Voucher Diklaim</span>
            <div className="p-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 font-bold">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white font-['Space_Grotesk']">
            {totalRedemptions} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Pelanggan</span>
          </div>
          <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold">Across all active branches</span>
        </div>

        {/* Total Cost */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Biaya KOL / Barter Meals</span>
            <div className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-bold">
              <Users2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white font-['Space_Grotesk']">
            Rp{totalCostSpent.toLocaleString('id-ID')}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">{voucherCampaigns.length} Campaign Aktif</span>
        </div>

        {/* ROI Multiplier */}
        <div
          style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
          className="p-4 rounded-3xl shadow-md space-y-1 transition-colors duration-300"
        >
          <div className="flex items-center justify-between text-xs text-white/80 font-medium">
            <span>Marketing ROI Ratio</span>
            <Flame className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-black text-white font-['Space_Grotesk']">
            {overallRoiMultiplier}x ROI
          </div>
          <span className="text-[10px] text-white/90 font-bold">Rp1 Modal = Rp{overallRoiMultiplier} Omzet</span>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider font-['Space_Grotesk']">
            Daftar Kode Promo &amp; Performa Cabang
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Live POS Integration</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                <th className="py-3 px-4">KODE VOUCHER</th>
                <th className="py-3 px-4">INFLUENCER / KOL</th>
                <th className="py-3 px-4">TARGET CABANG</th>
                <th className="py-3 px-4 text-center">DISKON</th>
                <th className="py-3 px-4 text-center">REDEEM</th>
                <th className="py-3 px-4 text-right">TOTAL OMZET</th>
                <th className="py-3 px-4 text-center">EST. ROI</th>
                <th className="py-3 px-4 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {voucherCampaigns.map((camp) => {
                const roi = camp.cost_spent > 0 ? (camp.total_sales_driven / camp.cost_spent).toFixed(1) : '0';

                return (
                  <tr key={camp.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                          {camp.code}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{camp.influencer_name}</div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{camp.influencer_handle}</div>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {camp.branch_name}
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-amber-700 dark:text-amber-400 font-mono">
                      {camp.discount_percent}% OFF
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="font-black text-xs text-slate-900 dark:text-white">{camp.redemption_count}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Orders</span>
                    </td>

                    <td className="py-3 px-4 text-right font-black font-mono text-slate-900 dark:text-white">
                      Rp{camp.total_sales_driven.toLocaleString('id-ID')}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full font-black text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {roi}x
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        {camp.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Cashier POS Simulator */}
      {isCashierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white font-['Space_Grotesk']">
                  Simulasi Kasir POS (Redeem Voucher)
                </h3>
              </div>
              <button
                onClick={() => setIsCashierModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {redeemFeedback && (
              <div
                className={`p-3 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
                  redeemFeedback.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{redeemFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleRedeemSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Masukkan Kode Voucher (Contoh: MANDABALI15 / HUNTERCANGGU)
                </label>
                <input
                  type="text"
                  required
                  placeholder="MANDABALI15"
                  value={cashierCode}
                  onChange={(e) => setCashierCode(e.target.value.toUpperCase())}
                  className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-black text-sm uppercase focus:ring-2 focus:ring-slate-900 dark:focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nilai Transaksi Pesanan Pelanggan (Rp)
                </label>
                <input
                  type="number"
                  min={50000}
                  step={10000}
                  required
                  value={cashierOrderAmount}
                  onChange={(e) => setCashierOrderAmount(Number(e.target.value))}
                  className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-sm focus:ring-2 focus:ring-slate-900 dark:focus:ring-orange-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCashierModalOpen(false)}
                  className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
                  className="px-5 py-2 rounded-2xl font-bold shadow-md cursor-pointer"
                >
                  Proses Diskon &amp; Rekam ROI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Create New Voucher Campaign */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white font-['Space_Grotesk']">
                  Buat Campaign Voucher Influencer Baru
                </h3>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Pilih Influencer</label>
                  <select
                    value={newInfluencerId}
                    onChange={(e) => {
                      setNewInfluencerId(e.target.value);
                      const inf = influencers.find((i) => i.id === e.target.value);
                      if (inf) {
                        const clean = inf.name.split(' ')[0].toUpperCase();
                        setNewCode(`${clean}15`);
                      }
                    }}
                    className="w-full p-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium cursor-pointer"
                  >
                    {influencers.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({i.handle})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Target Cabang</label>
                  <select
                    value={newBranchId}
                    onChange={(e) => setNewBranchId(e.target.value)}
                    className="w-full p-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium cursor-pointer"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Kode Voucher</label>
                  <input
                    type="text"
                    required
                    placeholder="EATS15"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    className="w-full p-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Diskon (%)</label>
                  <input
                    type="number"
                    min={5}
                    max={50}
                    value={newDiscount}
                    onChange={(e) => setNewDiscount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Biaya Kolaborasi (Rp)</label>
                  <input
                    type="number"
                    min={0}
                    step={100000}
                    value={newCost}
                    onChange={(e) => setNewCost(Number(e.target.value))}
                    className="w-full p-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Berlaku Hingga</label>
                  <input
                    type="date"
                    required
                    value={newValidUntil}
                    onChange={(e) => setNewValidUntil(e.target.value)}
                    className="w-full p-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: themeColors.primary, color: themeColors.textOnPrimary }}
                  className="px-5 py-2 rounded-2xl font-bold shadow-md cursor-pointer"
                >
                  Simpan Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { BankProduct } from '../types/market';
import { Landmark, PiggyBank, Briefcase, Home, Car, Calculator, CheckCircle2, Percent } from 'lucide-react';
import { motion } from 'motion/react';

interface BankRatesTrackerProps {
  bankProducts: BankProduct[];
  usdToKhrRate: number;
}

export const BankRatesTracker: React.FC<BankRatesTrackerProps> = ({
  bankProducts,
  usdToKhrRate,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<'KHR' | 'USD'>('KHR');
  const [selectedTenure, setSelectedTenure] = useState<'12M' | '6M'>('12M');
  const [activeTabType, setActiveTabType] = useState<'deposit' | 'loans'>('deposit');

  // Calculator State
  const [calcType, setCalcType] = useState<'deposit' | 'loan'>('deposit');
  const [calcPrincipal, setCalcPrincipal] = useState<number>(10000); // $10,000 or 40,000,000 KHR
  const [calcRate, setCalcRate] = useState<number>(7.5); // %
  const [calcYears, setCalcYears] = useState<number>(1);
  const [calcCurrency, setCalcCurrency] = useState<'USD' | 'KHR'>('USD');

  // Deposit Return Calculation
  const depositEarnedInterest = (calcPrincipal * (calcRate / 100) * calcYears);
  const depositTotalReturn = calcPrincipal + depositEarnedInterest;

  // Loan EMI Calculation
  // Monthly rate = r / 1200
  // EMI = P * r * (1+r)^n / ((1+r)^n - 1)
  const monthlyRate = calcRate / 12 / 100;
  const totalMonths = calcYears * 12;
  const loanMonthlyPayment =
    monthlyRate > 0
      ? (calcPrincipal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
      : calcPrincipal / totalMonths;
  const loanTotalPayment = loanMonthlyPayment * totalMonths;
  const loanTotalInterest = loanTotalPayment - calcPrincipal;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-medium tracking-wide">
            <span>ធនាគារពាណិជ្ជកម្ម និងគ្រឹះស្ថានហិរញ្ញវត្ថុកម្ពុជា</span>
            <span aria-hidden="true">·</span>
            <span>ប្រៀបធៀបអត្រាការប្រាក់ប្រចាំឆ្នាំ (% p.a.)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            អត្រាការប្រាក់សេវាកម្មហិរញ្ញវត្ថុ (បញ្ញើសន្សំ និងប្រាក់កម្ចី)
          </h1>
        </div>

        {/* View Switcher Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg shrink-0 self-start md:self-auto">
          <button
            onClick={() => setActiveTabType('deposit')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTabType === 'deposit'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PiggyBank className="w-3.5 h-3.5" />
            <span>ប្រាក់បញ្ញើសន្សំ (Deposit)</span>
          </button>
          <button
            onClick={() => setActiveTabType('loans')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTabType === 'loans'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>ប្រាក់កម្ចី (Loans)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Comparison Table & Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Comparison Table (2 spans) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          {activeTabType === 'deposit' ? (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-bold text-white text-base">
                    តារាងប្រៀបធៀបអត្រាការប្រាក់បញ្ញើមានកាលកំណត់ (Fixed Term Deposit)
                  </h3>
                  <div className="text-xs text-slate-400">
                    អត្រាការប្រាក់គិតជាភាគរយក្នុង ១ ឆ្នាំ (% ក្នុងមួយឆ្នាំ)
                  </div>
                </div>

                {/* Sub filters */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded-lg">
                    <button
                      onClick={() => setSelectedCurrency('KHR')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                        selectedCurrency === 'KHR'
                          ? 'bg-emerald-500 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ប្រាក់រៀល (KHR)
                    </button>
                    <button
                      onClick={() => setSelectedCurrency('USD')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                        selectedCurrency === 'USD'
                          ? 'bg-amber-400 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ដុល្លារ (USD)
                    </button>
                  </div>

                  <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded-lg">
                    <button
                      onClick={() => setSelectedTenure('12M')}
                      className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
                        selectedTenure === '12M'
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ១២ ខែ
                    </button>
                    <button
                      onClick={() => setSelectedTenure('6M')}
                      className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
                        selectedTenure === '6M'
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ៦ ខែ
                    </button>
                  </div>
                </div>
              </div>

              {/* Deposit Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs text-slate-400">
                      <th className="py-2.5 px-3">ឈ្មោះធនាគារ</th>
                      <th className="py-2.5 px-3 text-right">កាលកំណត់ {selectedTenure === '12M' ? '១២ ខែ' : '៦ ខែ'}</th>
                      <th className="py-2.5 px-3 text-right">បញ្ញើធម្មតា (Savings)</th>
                      <th className="py-2.5 px-3 text-right">ចំណាត់ថ្នាក់</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {bankProducts.map((bank) => {
                      const rate =
                        selectedCurrency === 'KHR'
                          ? selectedTenure === '12M'
                            ? bank.fixedDepositKHR_12M
                            : bank.fixedDepositKHR_6M
                          : selectedTenure === '12M'
                          ? bank.fixedDepositUSD_12M
                          : bank.fixedDepositUSD_6M;

                      const savingsRate =
                        selectedCurrency === 'KHR' ? bank.savingsKHR : bank.savingsUSD;

                      return (
                        <tr
                          key={bank.bankId}
                          className="hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3 px-3 font-sans font-medium text-white flex items-center gap-2.5">
                            <span
                              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0 font-mono"
                              style={{ backgroundColor: bank.color }}
                            >
                              {bank.logoText}
                            </span>
                            <div>
                              <div className="font-semibold text-slate-100">
                                {bank.bankNameKhmer}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {bank.bankNameEng}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-base tabular-nums">
                            <span className={selectedCurrency === 'KHR' ? 'text-emerald-400' : 'text-amber-400'}>
                              {rate.toFixed(2)}%
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right text-slate-300 tabular-nums">
                            {savingsRate.toFixed(2)}%
                          </td>
                          <td className="py-3 px-3 text-right font-sans text-xs text-slate-400">
                            {bank.rating}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <h3 className="font-bold text-white text-base">
                  តារាងអត្រាការប្រាក់កម្ចីធនាគារ (Loan Products p.a.)
                </h3>
                <div className="text-xs text-slate-400">
                  អត្រាការប្រាក់ប្រចាំឆ្នាំសម្រាប់កម្ចីទិញផ្ទះ រថយន្ត និងអាជីវកម្ម
                </div>
              </div>

              {/* Loan Products Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs text-slate-400">
                      <th className="py-2.5 px-3">ធនាគារ</th>
                      <th className="py-2.5 px-3 text-right">កម្ចីទិញផ្ទះ (Home)</th>
                      <th className="py-2.5 px-3 text-right">កម្ចីរថយន្ត (Auto)</th>
                      <th className="py-2.5 px-3 text-right">កម្ចីអាជីវកម្ម (SME)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {bankProducts.map((bank) => (
                      <tr
                        key={bank.bankId}
                        className="hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-3 font-sans font-medium text-white flex items-center gap-2.5">
                          <span
                            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0 font-mono"
                            style={{ backgroundColor: bank.color }}
                          >
                            {bank.logoText}
                          </span>
                          <span className="font-semibold text-slate-200">
                            {bank.bankNameKhmer}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-emerald-400 font-semibold tabular-nums">
                          {bank.housingLoanUSD.toFixed(2)}%
                        </td>
                        <td className="py-3 px-3 text-right text-sky-400 font-semibold tabular-nums">
                          {bank.autoLoanUSD.toFixed(2)}%
                        </td>
                        <td className="py-3 px-3 text-right text-amber-400 font-semibold tabular-nums">
                          {bank.smeLoanUSD.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Financial Loan & Savings Calculator (1 span) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">គណនាការប្រាក់រហ័ស</h3>
                <div className="text-xs text-slate-400">ប្រាក់ចំណេញសន្សំ ឬការបង់កម្ចី</div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {/* Type Switcher */}
              <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
                <button
                  onClick={() => {
                    setCalcType('deposit');
                    setCalcRate(7.5);
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    calcType === 'deposit'
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ការប្រាក់សន្សំ (Deposit)
                </button>
                <button
                  onClick={() => {
                    setCalcType('loan');
                    setCalcRate(7.2);
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    calcType === 'loan'
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  បង់រំលស់កម្ចី (Loan)
                </button>
              </div>

              {/* Currency & Principal Amount */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">រូបិយប័ណ្ណ</label>
                  <select
                    value={calcCurrency}
                    onChange={(e) => {
                      const cur = e.target.value as 'USD' | 'KHR';
                      setCalcCurrency(cur);
                      setCalcPrincipal(cur === 'USD' ? 10000 : 40000000);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="USD">ដុល្លារ ($ USD)</option>
                    <option value="KHR">ប្រាក់រៀល (៛ KHR)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">ចំនួនទឹកប្រាក់ដើម</label>
                  <input
                    type="number"
                    min="100"
                    step={calcCurrency === 'USD' ? '100' : '100000'}
                    value={calcPrincipal}
                    onChange={(e) => setCalcPrincipal(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Interest Rate & Duration */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">អត្រាការប្រាក់ (% ឆ្នាំ)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    step="0.1"
                    value={calcRate}
                    onChange={(e) => setCalcRate(Math.max(0.1, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">រយៈពេល (ឆ្នាំ)</label>
                  <input
                    type="number"
                    min="1"
                    max="25"
                    value={calcYears}
                    onChange={(e) => setCalcYears(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Summary Calculations */}
              {calcType === 'deposit' ? (
                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2 mt-3">
                  <div className="text-xs text-slate-400">ប្រាក់ចំណេញការប្រាក់សរុប ({calcYears} ឆ្នាំ)</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
                    +{depositEarnedInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
                    {calcCurrency === 'USD' ? '$' : '៛'}
                  </div>
                  <div className="text-xs text-slate-400 pt-1.5 border-t border-slate-800 flex justify-between">
                    <span>ទឹកប្រាក់សរុបទទួលបាន:</span>
                    <span className="font-mono text-white font-semibold">
                      {depositTotalReturn.toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
                      {calcCurrency === 'USD' ? '$' : '៛'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2 mt-3">
                  <div className="text-xs text-slate-400">ប្រាក់ត្រូវបង់ប្រចាំខែ (Monthly Repayment)</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-amber-400">
                    {loanMonthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
                    {calcCurrency === 'USD' ? '$' : '៛'} /ខែ
                  </div>
                  <div className="text-xs text-slate-400 pt-1.5 border-t border-slate-800 space-y-1">
                    <div className="flex justify-between">
                      <span>ការប្រាក់សរុបត្រូវបង់:</span>
                      <span className="font-mono text-rose-400 font-semibold">
                        {loanTotalInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
                        {calcCurrency === 'USD' ? '$' : '៛'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>ប្រាក់សរុបទាំងដើមនិងការ:</span>
                      <span className="font-mono text-white font-semibold">
                        {loanTotalPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
                        {calcCurrency === 'USD' ? '$' : '៛'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            ℹ️ អត្រាជាក់ស្តែងអាចមានការប្រែប្រួលតាមលក្ខខណ្ឌ និងការវាយតម្លៃរបស់ធនាគារនីមួយៗ។
          </div>
        </div>
      </div>
    </div>
  );
};

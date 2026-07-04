/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { Transaction, Category } from '../types';
import { formatCurrency, DEFAULT_CATEGORIES, getMonthLabel } from '../utils';
import { Icon } from './Icon';
import { Coins, TrendingUp, TrendingDown, CreditCard, Activity } from 'lucide-react';

interface AnalyticsProps {
  transactions: Transaction[];
  categories: Category[];
  currentMonth: string;
  currency: string;
}

export function Analytics({
  transactions,
  categories,
  currentMonth,
  currency
}: AnalyticsProps) {
  // --- Active Donut Arc state ---
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // --- 1. Category Breakdown for currentMonth ---
  const currentMonthExpenses = useMemo(() => {
    return transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonth));
  }, [transactions, currentMonth]);

  const totalExpenseAmount = useMemo(() => {
    return currentMonthExpenses.reduce((acc, t) => acc + t.amount, 0);
  }, [currentMonthExpenses]);

  const categoryBreakdownData = useMemo(() => {
    const sumMap: Record<string, number> = {};
    
    // Sum by category
    currentMonthExpenses.forEach(t => {
      sumMap[t.category] = (sumMap[t.category] || 0) + t.amount;
    });

    // Create sorted list
    return Object.entries(sumMap)
      .map(([id, amount]) => {
        const cat = categories.find(c => c.id === id) || DEFAULT_CATEGORIES.find(c => c.id === id);
        return {
          id,
          name: cat?.name || id,
          amount,
          percentage: totalExpenseAmount > 0 ? (amount / totalExpenseAmount) * 100 : 0,
          colorClass: cat?.colorClass || 'slate',
          color: cat?.color || ''
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [currentMonthExpenses, categories, totalExpenseAmount]);

  // --- 2. Calculate Donut Chart Angles & Coordinates ---
  const donutSegments = useMemo(() => {
    let accumulatedAngle = 0;
    const r = 55; // outer radius
    const innerR = 40; // inner radius
    const cx = 70;
    const cy = 70;

    return categoryBreakdownData.map(cat => {
      const angleSize = (cat.percentage / 100) * 360;
      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + angleSize;
      accumulatedAngle = endAngle;

      // Convert angles to polar coordinates (adjusting -90 to start at top)
      const startRad = ((startAngle - 90) * Math.PI) / 180;
      const endRad = ((endAngle - 90) * Math.PI) / 180;

      // Outer points
      const x1 = cx + r * Math.cos(startRad);
      const y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad);
      const y2 = cy + r * Math.sin(endRad);

      // Inner points
      const xi1 = cx + innerR * Math.cos(startRad);
      const yi1 = cy + innerR * Math.sin(startRad);
      const xi2 = cx + innerR * Math.cos(endRad);
      const yi2 = cy + innerR * Math.sin(endRad);

      // Large arc flag
      const largeArc = angleSize > 180 ? 1 : 0;

      // SVG Path: Move to inner start, line to outer start, arc to outer end, line to inner end, reverse arc back to inner start, close
      const pathData = `
        M ${xi1} ${yi1}
        L ${x1} ${y1}
        A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}
        L ${xi2} ${yi2}
        A ${innerR} ${innerR} 0 ${largeArc} 0 ${xi1} ${yi1}
        Z
      `.trim();

      return {
        ...cat,
        pathData,
        centerAngle: startAngle + angleSize / 2
      };
    });
  }, [categoryBreakdownData]);

  // Active hover category for centerpiece info
  const activeDonutInfo = useMemo(() => {
    if (hoveredCategory) {
      return donutSegments.find(s => s.id === hoveredCategory) || null;
    }
    // Default to the largest expense category if any, or general total
    return donutSegments[0] || null;
  }, [hoveredCategory, donutSegments]);


  // --- 3. Monthly Comparison (Last 5 Months) ---
  const monthlyTimelineData = useMemo(() => {
    const result: Record<string, { income: number; expense: number }> = {};
    const now = new Date();

    // Setup past 5 months keys (YYYY-MM)
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().substring(0, 7);
      result[key] = { income: 0, expense: 0 };
    }

    // Populate actual values
    transactions.forEach(t => {
      const mKey = t.date.substring(0, 7);
      if (result[mKey]) {
        if (t.type === 'income') {
          result[mKey].income += t.amount;
        } else {
          result[mKey].expense += t.amount;
        }
      }
    });

    // Format list for charting
    const monthsList = Object.entries(result).map(([monthKey, values]) => {
      const label = getMonthLabel(monthKey).split(' ')[0]; // just month name, e.g. "Junio"
      return {
        key: monthKey,
        label,
        income: values.income,
        expense: values.expense
      };
    });

    // Find max value in either column for scaling
    const maxVal = Math.max(...monthsList.flatMap(m => [m.income, m.expense]), 1000);

    return {
      list: monthsList,
      maxVal
    };
  }, [transactions]);


  // --- 4. Payment Method breakdown for currentMonth ---
  const paymentMethodStats = useMemo(() => {
    const methodCounts: Record<string, number> = {
      'Tarjeta': 0,
      'Efectivo': 0,
      'Bizum': 0,
      'Transferencia': 0
    };

    currentMonthExpenses.forEach(t => {
      if (methodCounts[t.paymentMethod] !== undefined) {
        methodCounts[t.paymentMethod] += t.amount;
      }
    });

    const total = Object.values(methodCounts).reduce((acc, val) => acc + val, 0);

    return Object.entries(methodCounts).map(([name, amount]) => ({
      name,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);
  }, [currentMonthExpenses]);

  // Determine color variables based on tailwind standard categories
  const getFillColor = (colorClass: string) => {
    const colors: Record<string, string> = {
      indigo: '#4f46e5', // indigo-600
      emerald: '#10b981', // emerald-500
      blue: '#3b82f6', // blue-500
      amber: '#f59e0b', // amber-500
      orange: '#f97316', // orange-500
      rose: '#f43f5e', // rose-500
      violet: '#8b5cf6', // violet-500
      fuchsia: '#d946ef', // fuchsia-500
      slate: '#64748b' // slate-500
    };
    return colors[colorClass] || '#64748b';
  };

  return (
    <div className="space-y-8">
      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Card: Category Donut Breakdown (7-wide) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-1 mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Gastos por Categoría
            </h3>
            <p className="text-xs text-slate-400">
              Distribución porcentual de los gastos correspondientes al mes de {getMonthLabel(currentMonth)}.
            </p>
          </div>

          {categoryBreakdownData.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-sm">
              <Coins size={36} className="mx-auto text-slate-300 mb-2" />
              <span>Registra gastos este mes para analizar su distribución.</span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-around gap-8">
              {/* Donut SVG Ring */}
              <div className="relative w-48 h-48 flex-shrink-0">
                <svg viewBox="0 0 140 140" className="w-full h-full">
                  {donutSegments.map(seg => (
                    <path
                      key={seg.id}
                      d={seg.pathData}
                      fill={getFillColor(seg.colorClass)}
                      className="cursor-pointer transition-all duration-300 hover:opacity-90 hover:stroke-white dark:hover:stroke-slate-900 hover:stroke-2"
                      style={{
                        transformOrigin: '70px 70px',
                        transform: hoveredCategory === seg.id ? 'scale(1.04)' : 'scale(1)'
                      }}
                      onMouseEnter={() => setHoveredCategory(seg.id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    />
                  ))}
                </svg>

                {/* Donut Center Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
                  {activeDonutInfo ? (
                    <>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate max-w-[120px]">
                        {activeDonutInfo.name}
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {formatCurrency(activeDonutInfo.amount, currency)}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded-full mt-1 border border-indigo-100 dark:border-indigo-900/10">
                        {activeDonutInfo.percentage.toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Total Gastos
                      </span>
                      <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(totalExpenseAmount, currency)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Category Legend list */}
              <div className="flex-1 space-y-2.5 w-full">
                {categoryBreakdownData.slice(0, 6).map(cat => (
                  <div 
                    key={cat.id}
                    className={`flex items-center justify-between p-1.5 rounded-lg transition cursor-pointer ${
                      hoveredCategory === cat.id ? 'bg-slate-50 dark:bg-slate-800' : ''
                    }`}
                    onMouseEnter={() => setHoveredCategory(cat.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-3 h-3 rounded-md" 
                        style={{ backgroundColor: getFillColor(cat.colorClass) }}
                      />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {cat.name}
                      </span>
                    </div>
                    <div className="text-right flex items-center gap-3 font-mono">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(cat.amount, currency)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {cat.percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Card: Monthly Comparison Bar Chart (5-wide) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-1 mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Ingresos vs Gastos
            </h3>
            <p className="text-xs text-slate-400">
              Evolución comparativa de ingresos (verde) y gastos (negro) de los últimos 5 meses.
            </p>
          </div>

          {/* SVG Double Bar Chart */}
          <div className="h-44 w-full relative">
            <svg viewBox="0 0 280 160" className="w-full h-full overflow-visible">
              {/* Horizontal Gridlines */}
              <line x1="0" y1="20" x2="280" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" className="dark:stroke-slate-800" />
              <line x1="0" y1="60" x2="280" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" className="dark:stroke-slate-800" />
              <line x1="0" y1="100" x2="280" y2="100" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" className="dark:stroke-slate-800" />
              <line x1="0" y1="140" x2="280" y2="140" stroke="#e2e8f0" strokeWidth="1" className="dark:stroke-slate-700" />

              {/* Monthly bars */}
              {monthlyTimelineData.list.map((m, index) => {
                const spaceBetween = 56; // spacing multiplier
                const startX = index * spaceBetween + 15;
                const chartHeight = 120; // max chart height starting at y=140 upwards to y=20
                
                // Scale bar heights relative to max value
                const incHeight = (m.income / monthlyTimelineData.maxVal) * chartHeight;
                const expHeight = (m.expense / monthlyTimelineData.maxVal) * chartHeight;

                // bar coordinates
                const incY = 140 - incHeight;
                const expY = 140 - expHeight;

                return (
                  <g key={m.key} className="group cursor-pointer">
                    {/* Tooltip hovering indicator */}
                    <rect
                      x={startX - 10}
                      y="10"
                      width="45"
                      height="135"
                      fill="transparent"
                      className="hover:fill-slate-500/5 transition-colors"
                      title={`Ingresos: ${m.income} €, Gastos: ${m.expense} €`}
                    />

                    {/* Income Bar (Green) */}
                    <rect
                      x={startX}
                      y={incY}
                      width="10"
                      height={Math.max(incHeight, 2)} // ensure at least 2px height
                      rx="3"
                      fill="#10b981" // emerald-500
                      className="transition-all duration-300 hover:opacity-85"
                    />

                    {/* Expense Bar (Black/Indigo) */}
                    <rect
                      x={startX + 13}
                      y={expY}
                      width="10"
                      height={Math.max(expHeight, 2)}
                      rx="3"
                      fill="#0f172a" // slate-900 (light mode)
                      className="dark:fill-indigo-500 transition-all duration-300 hover:opacity-85"
                    />

                    {/* X-Axis labels (Months names) */}
                    <text
                      x={startX + 11}
                      y="154"
                      textAnchor="middle"
                      className="text-[10px] font-semibold fill-slate-400 font-sans"
                    >
                      {m.label}
                    </text>

                    {/* Hover Tooltip Text (Floating values at top of bars) */}
                    <text
                      x={startX + 11}
                      y={Math.min(incY, expY) - 5}
                      textAnchor="middle"
                      className="text-[8px] font-bold font-mono fill-indigo-600 dark:fill-indigo-400 opacity-0 group-hover:opacity-100 transition-all pointer-events-none"
                    >
                      {formatCurrency(m.income - m.expense, currency).split(',')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend indicator */}
          <div className="flex justify-center gap-6 mt-4 text-[10px] font-semibold text-slate-500 border-t border-slate-50 dark:border-slate-800/50 pt-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
              <span>Ingresos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-slate-900 dark:bg-indigo-500 rounded-full" />
              <span>Gastos</span>
            </div>
          </div>
        </div>

      </div>

      {/* Payment Method Distribution Widget */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs" id="payment-methods-analytics-section">
        <div className="space-y-1 mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Distribución por Método de Pago
          </h3>
          <p className="text-xs text-slate-400">
            ¿Cómo abonas tus gastos corrientes? Analiza el volumen de transacciones de este mes agrupado por canal de pago.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {paymentMethodStats.map(method => (
            <div 
              key={method.name}
              className="p-4 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl space-y-2.5"
            >
              <div className="flex items-center gap-2 justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {method.name}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-800">
                  {method.percentage.toFixed(0)}%
                </span>
              </div>
              
              <div className="space-y-1">
                <p className="text-lg font-bold text-slate-800 dark:text-white">
                  {formatCurrency(method.amount, currency)}
                </p>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                  <div 
                    className="bg-slate-900 dark:bg-indigo-500 h-1.5 rounded-full" 
                    style={{ width: `${method.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

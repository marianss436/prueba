/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { Category, Budget, Transaction } from '../types';
import { formatCurrency, DEFAULT_CATEGORIES } from '../utils';
import { Icon } from './Icon';
import { Edit2, Check, X, AlertTriangle, ShieldCheck, DollarSign } from 'lucide-react';

interface BudgetSettingsProps {
  categories: Category[];
  budgets: Budget[];
  transactions: Transaction[];
  currentMonth: string;
  currency: string;
  onSaveBudget: (categoryId: string, limit: number) => void;
}

export function BudgetSettings({
  categories,
  budgets,
  transactions,
  currentMonth,
  currency,
  onSaveBudget
}: BudgetSettingsProps) {
  // Store which category is currently being edited inline
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editLimitValue, setEditLimitValue] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Calculate actual spent per category for the selected currentMonth
  const categoryExpenses = useMemo(() => {
    const expenses: Record<string, number> = {};
    
    // Initialise categories
    categories.forEach(c => {
      expenses[c.id] = 0;
    });

    // Sum transactions in this month
    transactions.forEach(t => {
      if (t.type === 'expense' && t.date.startsWith(currentMonth)) {
        expenses[t.category] = (expenses[t.category] || 0) + t.amount;
      }
    });

    return expenses;
  }, [transactions, currentMonth, categories]);

  // Aggregate stats
  const totalBudgetLimit = useMemo(() => {
    return budgets.reduce((acc, b) => acc + b.limit, 0);
  }, [budgets]);

  const totalSpentInMonth = useMemo(() => {
    return (Object.values(categoryExpenses) as number[]).reduce((acc, val) => acc + val, 0);
  }, [categoryExpenses]);

  const totalRemaining = totalBudgetLimit - totalSpentInMonth;

  // Handle opening inline editor
  const handleStartEdit = (categoryId: string, currentLimit: number) => {
    setEditingCategoryId(categoryId);
    setEditLimitValue(currentLimit.toString());
    setErrorMsg('');
  };

  // Handle saving inline budget limit
  const handleSaveEdit = (categoryId: string) => {
    const limitNum = parseFloat(editLimitValue);
    if (isNaN(limitNum) || limitNum < 0) {
      setErrorMsg('Introduce un límite válido mayor o igual a 0');
      return;
    }
    
    onSaveBudget(categoryId, limitNum);
    setEditingCategoryId(null);
  };

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Total Presupuestado */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Total Límite Presupuestado
          </h4>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalBudgetLimit, currency)}
          </p>
          <p className="text-[10px] text-slate-400 mt-2">
            Suma de los límites máximos definidos para todas las categorías.
          </p>
        </div>

        {/* Card 2: Consumido */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Gastado este Mes
          </h4>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalSpentInMonth, currency)}
          </p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3">
            <div 
              className={`h-1.5 rounded-full transition-all ${
                totalSpentInMonth > totalBudgetLimit ? 'bg-rose-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${Math.min(100, totalBudgetLimit > 0 ? (totalSpentInMonth / totalBudgetLimit) * 100 : 0)}%` }}
            />
          </div>
        </div>

        {/* Card 3: Disponible */}
        <div className={`p-6 rounded-2xl border shadow-xs ${
          totalRemaining >= 0 
            ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-400' 
            : 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/30 text-rose-900 dark:text-rose-400'
        }`}>
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-1">
            {totalRemaining >= 0 ? 'Disponible / Sobrante' : 'Límite Excedido'}
          </h4>
          <p className="text-2xl font-bold font-mono">
            {formatCurrency(Math.abs(totalRemaining), currency)}
          </p>
          <p className="text-[10px] mt-2 opacity-85">
            {totalRemaining >= 0 
              ? '¡Excelente! Estás gastando dentro de tus límites mensuales.' 
              : 'Atención: El gasto total ha sobrepasado el límite mensual asignado.'}
          </p>
        </div>

      </div>

      {/* Main Budget Lists */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6" id="budgets-card-section">
        <div className="space-y-1 mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Planificación de Presupuestos Mensuales
          </h3>
          <p className="text-xs text-slate-400">
            Define límites de gasto realistas por categoría. Modifica los límites pulsando el botón de edición al final de cada fila.
          </p>
        </div>

        <div className="divide-y divide-slate-150 dark:divide-slate-800/60">
          {categories.map((cat) => {
            // Find current category budget
            const budget = budgets.find(b => b.categoryId === cat.id) || { categoryId: cat.id, limit: 0 };
            const spent = categoryExpenses[cat.id] || 0;
            const isEditing = editingCategoryId === cat.id;
            
            const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
            const remaining = budget.limit - spent;

            // Decide progress bar and badge color
            let progressColor = 'bg-emerald-500';
            let textColor = 'text-emerald-600 dark:text-emerald-400';
            if (percentage > 90) {
              progressColor = 'bg-rose-500';
              textColor = 'text-rose-600 dark:text-rose-400 font-bold';
            } else if (percentage > 60) {
              progressColor = 'bg-amber-500';
              textColor = 'text-amber-600 dark:text-amber-400 font-semibold';
            }

            return (
              <div 
                key={cat.id}
                className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* 1. Category Info */}
                <div className="flex items-center gap-3.5 md:w-1/4">
                  <div className={`p-2.5 rounded-xl border flex-shrink-0 ${cat.color}`}>
                    <Icon name={cat.icon} size={18} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white text-sm">
                      {cat.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Categoría</span>
                  </div>
                </div>

                {/* 2. Spent vs limit and progress bar */}
                <div className="flex-1 space-y-1.5 md:px-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      Gastado: <strong className="text-slate-700 dark:text-slate-200">{formatCurrency(spent, currency)}</strong>
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      Límite:{' '}
                      <strong className="text-slate-700 dark:text-slate-200">
                        {formatCurrency(budget.limit, currency)}
                      </strong>
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${progressColor}`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>

                  {/* Percentage & Remaining details */}
                  <div className="flex justify-between items-center text-[10px]">
                    <span className={`${textColor}`}>
                      {percentage.toFixed(0)}% consumido
                    </span>
                    
                    {budget.limit > 0 && (
                      <span className={remaining >= 0 ? 'text-slate-400' : 'text-rose-500 font-medium'}>
                        {remaining >= 0 
                          ? `Restan ${formatCurrency(remaining, currency)}` 
                          : `Excedido por ${formatCurrency(Math.abs(remaining), currency)}`}
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. Actions / Editor */}
                <div className="md:w-1/4 flex justify-end items-center">
                  {isEditing ? (
                    <div className="space-y-1 w-full max-w-[200px]">
                      <div className="flex items-center gap-1">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            value={editLimitValue}
                            onChange={(e) => setEditLimitValue(e.target.value)}
                            className="w-full p-1.5 pr-6 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white text-right focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                            placeholder="0"
                            autoFocus
                          />
                          <span className="absolute right-2 top-2 text-[10px] text-slate-400 font-mono">€</span>
                        </div>
                        
                        <button
                          onClick={() => handleSaveEdit(cat.id)}
                          className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition cursor-pointer"
                          title="Confirmar"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setEditingCategoryId(null)}
                          className="p-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg transition cursor-pointer"
                          title="Cancelar"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      {errorMsg && (
                        <p className="text-[10px] text-rose-500 font-medium leading-none">{errorMsg}</p>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartEdit(cat.id, budget.limit)}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                      id={`edit-budget-${cat.id}`}
                    >
                      <Edit2 size={12} />
                      <span>Definir Límite</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

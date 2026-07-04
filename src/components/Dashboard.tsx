/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Transaction, Category, Budget, Member, SavingGoal } from '../types';
import { formatCurrency, DEFAULT_CATEGORIES } from '../utils';
import { Icon } from './Icon';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  Percent, 
  AlertTriangle, 
  ChevronRight, 
  PlusCircle, 
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  members: Member[];
  goals: SavingGoal[];
  currency: string;
  currentMonth: string;
  onAddTransactionClick: () => void;
  onViewAllTransactions: () => void;
  onNavigateToTab: (tab: string) => void;
}

export function Dashboard({
  transactions,
  categories,
  budgets,
  members,
  goals,
  currency,
  currentMonth,
  onAddTransactionClick,
  onViewAllTransactions,
  onNavigateToTab
}: DashboardProps) {
  
  // Calculate current month's transactions
  const monthTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(currentMonth));
  }, [transactions, currentMonth]);

  // Financial statistics
  const stats = useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;

    monthTransactions.forEach(t => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpenses += t.amount;
      }
    });

    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpenses,
      balance,
      savingsRate: Math.max(0, savingsRate)
    };
  }, [monthTransactions]);

  // Calculate budget tracking alerts
  const budgetAlerts = useMemo(() => {
    const categoryExpenses: Record<string, number> = {};
    
    // Sum expenses by category
    monthTransactions.forEach(t => {
      if (t.type === 'expense') {
        categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
      }
    });

    const alerts: Array<{
      categoryId: string;
      categoryName: string;
      limit: number;
      spent: number;
      percentage: number;
      colorClass: string;
    }> = [];

    budgets.forEach(b => {
      const spent = categoryExpenses[b.categoryId] || 0;
      const percentage = b.limit > 0 ? (spent / b.limit) * 100 : 0;
      const catObj = categories.find(c => c.id === b.categoryId) || DEFAULT_CATEGORIES.find(c => c.id === b.categoryId);

      if (percentage >= 80 && catObj) {
        alerts.push({
          categoryId: b.categoryId,
          categoryName: catObj.name,
          limit: b.limit,
          spent,
          percentage,
          colorClass: catObj.colorClass
        });
      }
    });

    return alerts.sort((a, b) => b.percentage - a.percentage);
  }, [monthTransactions, budgets, categories]);

  // Recent transactions (top 5 overall)
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  // Quick total balance of all history
  const globalBalance = useMemo(() => {
    let bal = 0;
    transactions.forEach(t => {
      if (t.type === 'income') {
        bal += t.amount;
      } else {
        bal -= t.amount;
      }
    });
    return bal;
  }, [transactions]);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-radial from-slate-900 to-slate-950 p-6 md:p-8 rounded-3xl border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium">
            <Sparkles size={16} />
            <span>Finanzas Familiares Bajo Control</span>
          </div>
          <h1 className="text-3xl font-sans font-bold tracking-tight text-white">
            Hola, ¡bienvenido de nuevo!
          </h1>
          <p className="text-slate-400 text-sm">
            Aquí tienes el resumen financiero de tu hogar para este mes. Tu balance general acumulado es de{' '}
            <span className={`font-semibold ${globalBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(globalBalance, currency)}
            </span>.
          </p>
        </div>
        <button
          onClick={onAddTransactionClick}
          className="mt-6 md:mt-0 flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-slate-950 font-medium rounded-xl transition duration-200 shadow-lg cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 text-sm"
          id="btn-add-quick"
        >
          <PlusCircle size={18} />
          <span>Registrar Gasto o Ingreso</span>
        </button>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Balance Mensual */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md transition"
          id="kpi-balance"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Wallet size={20} />
            </div>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Ahorro Neto</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-xs text-slate-500 dark:text-slate-400 font-medium">Balance del Mes</h3>
            <p className={`text-2xl font-bold tracking-tight ${stats.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {formatCurrency(stats.balance, currency)}
            </p>
          </div>
        </motion.div>

        {/* KPI 2: Ingresos */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md transition"
          id="kpi-ingresos"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight size={20} />
            </div>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Entradas</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ingresos Totales</h3>
            <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {formatCurrency(stats.totalIncome, currency)}
            </p>
          </div>
        </motion.div>

        {/* KPI 3: Gastos */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md transition"
          id="kpi-gastos"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-lg text-rose-600 dark:text-rose-400">
              <ArrowDownLeft size={20} />
            </div>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Salidas</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-xs text-slate-500 dark:text-slate-400 font-medium">Gastos Realizados</h3>
            <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {formatCurrency(stats.totalExpenses, currency)}
            </p>
          </div>
        </motion.div>

        {/* KPI 4: Tasa de Ahorro */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md transition"
          id="kpi-ahorro"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-lg text-amber-600 dark:text-amber-400">
              <Percent size={20} />
            </div>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Porcentaje</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tasa de Ahorro</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {stats.savingsRate.toFixed(1)}%
              </p>
              <span className="text-xs text-slate-400">de ingresos</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2">
              <div 
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, stats.savingsRate)}%` }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content Columns: Alerts & Recents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8-wide): Alerts & Recent Transactions */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Budget Alerts (Only show if there are alerts) */}
          {budgetAlerts.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-6 space-y-4"
              id="budget-alerts-section"
            >
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-400 font-semibold">
                <AlertTriangle size={18} />
                <h3>Alertas de Límite de Presupuesto</h3>
              </div>
              <p className="text-xs text-rose-700 dark:text-rose-400">
                Las siguientes categorías han superado o están a punto de agotar el presupuesto asignado para este mes:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {budgetAlerts.slice(0, 4).map(alert => (
                  <div 
                    key={alert.categoryId}
                    className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-rose-100 dark:border-rose-950/40 shadow-xs flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-slate-800 dark:text-slate-200 text-sm">
                        {alert.categoryName}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        alert.percentage >= 100 
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400' 
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                      }`}>
                        {alert.percentage.toFixed(0)}% gastado
                      </span>
                    </div>
                    <div className="space-y-1.5 mt-2">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Límite: {formatCurrency(alert.limit, currency)}</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {formatCurrency(alert.spent, currency)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all ${
                            alert.percentage >= 100 ? 'bg-rose-600' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, alert.percentage)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recent Transactions List */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs" id="recent-transactions-section">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                  Últimos Movimientos
                </h3>
                <p className="text-xs text-slate-400">
                  Transacciones más recientes registradas en el sistema.
                </p>
              </div>
              <button 
                onClick={onViewAllTransactions}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition cursor-pointer"
                id="btn-view-all"
              >
                <span>Ver todas</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-3">
                <HelpCircle size={40} className="mx-auto text-slate-300" />
                <p className="text-sm">No hay transacciones registradas todavía.</p>
                <button
                  onClick={onAddTransactionClick}
                  className="text-xs text-indigo-600 hover:underline font-semibold"
                >
                  Registrar tu primera transacción
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {recentTransactions.map((t) => {
                  const cat = categories.find(c => c.id === t.category) || DEFAULT_CATEGORIES.find(c => c.id === t.category);
                  const member = members.find(m => m.id === t.memberId);
                  
                  return (
                    <div 
                      key={t.id} 
                      className="py-3.5 flex items-center justify-between group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 px-2 rounded-lg -mx-2 transition"
                    >
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className={`p-2.5 rounded-xl border flex-shrink-0 ${
                          t.type === 'income' 
                            ? 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900/20' 
                            : cat?.color || 'text-slate-600 bg-slate-50 border-slate-100 dark:text-slate-400 dark:bg-slate-950/30'
                        }`}>
                          {t.type === 'income' ? (
                            <ArrowUpRight size={18} />
                          ) : (
                            <Icon name={cat?.icon || 'Coins'} size={18} />
                          )}
                        </div>

                        {/* Title & Category & Member */}
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white text-sm">
                            {t.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                            <span>{t.date}</span>
                            <span>•</span>
                            <span className="capitalize">{t.type === 'income' ? 'Ingreso' : (cat?.name || 'Gasto')}</span>
                            {member && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <span className={`w-1.5 h-1.5 rounded-full ${member.avatarColor.split(' ')[0]}`} />
                                  {member.name}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Amount & payment method */}
                      <div className="text-right">
                        <p className={`font-semibold text-sm ${
                          t.type === 'income' 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : 'text-slate-900 dark:text-white'
                        }`}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                        </p>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-800/40 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-800">
                          {t.paymentMethod}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4-wide): Savings Goals & Household Breakdown */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Savings Goals Widget */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-md">
                  Metas de Ahorro
                </h3>
                <p className="text-xs text-slate-400">Progreso de objetivos activos</p>
              </div>
              <button 
                onClick={() => onNavigateToTab('metas')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Gestionar
              </button>
            </div>

            <div className="space-y-4">
              {goals.slice(0, 3).map(goal => {
                const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                
                return (
                  <div key={goal.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{goal.name}</span>
                      <span className="font-mono text-slate-500">
                        {goal.currentAmount} / {goal.targetAmount} €
                      </span>
                    </div>
                    
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${goal.color}`} 
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{percentage.toFixed(0)}% completado</span>
                      {goal.deadline && <span>Límite: {goal.deadline}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Insights Widget */}
          <div className="bg-slate-50 dark:bg-slate-950/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-md">
              Consejo de Gasto Inteligente
            </h3>
            
            {stats.totalExpenses > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {stats.savingsRate >= 20 ? (
                    '🎉 ¡Excelente! Estás ahorrando más del 20% de tus ingresos este mes. Es un ritmo magnífico para alimentar tus fondos de emergencia y metas futuras.'
                  ) : stats.savingsRate > 0 ? (
                    '💡 Estás en camino positivo de ahorro, pero podrías mejorar. Revisa la categoría "Alimentación" o "Entretenimiento" para detectar pequeños gastos innecesarios.'
                  ) : (
                    '⚠️ Este mes has gastado más de lo que has ingresado. Te sugerimos revisar tus presupuestos por categoría y posponer las compras no esenciales.'
                  )}
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Consejo del Día</span>
                  <button 
                    onClick={() => onNavigateToTab('presupuestos')}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Ver presupuestos
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Registra ingresos y gastos para que el sistema pueda analizar tus finanzas y darte recomendaciones de ahorro personalizadas.
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

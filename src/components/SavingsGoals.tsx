/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { SavingGoal } from '../types';
import { formatCurrency, generateId } from '../utils';
import { Target, PlusCircle, Check, X, PiggyBank, Calendar, Trash2, Edit3, Save } from 'lucide-react';

interface SavingsGoalsProps {
  goals: SavingGoal[];
  currency: string;
  onAddGoal: (goal: SavingGoal) => void;
  onUpdateGoal: (goal: SavingGoal) => void;
  onDeleteGoal: (id: string) => void;
}

const PRESET_COLORS = [
  'bg-indigo-600',
  'bg-emerald-600',
  'bg-blue-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-violet-600'
];

export function SavingsGoals({
  goals,
  currency,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal
}: SavingsGoalsProps) {
  // Goal Form State (Modal)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingGoal | null>(null);
  
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-indigo-600');
  const [formError, setFormError] = useState('');

  // Quick contribution state
  const [activeContributionGoalId, setActiveContributionGoalId] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionError, setContributionError] = useState('');

  // Total savings across all goals
  const totalSavings = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalSavingsTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);

  // Open Form for creating
  const handleOpenCreate = () => {
    setEditingGoal(null);
    setName('');
    setTargetAmount('');
    setCurrentAmount('0');
    setDeadline('');
    setSelectedColor('bg-indigo-600');
    setFormError('');
    setIsFormOpen(true);
  };

  // Open Form for editing
  const handleOpenEdit = (goal: SavingGoal) => {
    setEditingGoal(goal);
    setName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setCurrentAmount(goal.currentAmount.toString());
    setDeadline(goal.deadline || '');
    setSelectedColor(goal.color);
    setFormError('');
    setIsFormOpen(true);
  };

  // Save Goal (Create or Edit)
  const handleSaveGoal = (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('El nombre del objetivo es obligatorio');
      return;
    }

    const targetNum = parseFloat(targetAmount);
    if (isNaN(targetNum) || targetNum <= 0) {
      setFormError('Introduce un importe objetivo válido y mayor que cero');
      return;
    }

    const currentNum = parseFloat(currentAmount);
    if (isNaN(currentNum) || currentNum < 0) {
      setFormError('El ahorro acumulado inicial debe ser mayor o igual a cero');
      return;
    }

    if (editingGoal) {
      // Update
      onUpdateGoal({
        ...editingGoal,
        name: name.trim(),
        targetAmount: targetNum,
        currentAmount: currentNum,
        deadline: deadline || undefined,
        color: selectedColor
      });
    } else {
      // Create
      onAddGoal({
        id: generateId(),
        name: name.trim(),
        targetAmount: targetNum,
        currentAmount: currentNum,
        deadline: deadline || undefined,
        color: selectedColor
      });
    }

    setIsFormOpen(false);
  };

  // Add Contribution
  const handleAddContribution = (goal: SavingGoal) => {
    setContributionError('');
    const contribNum = parseFloat(contributionAmount);
    
    if (isNaN(contribNum) || contribNum <= 0) {
      setContributionError('Inválido');
      return;
    }

    const updatedGoal = {
      ...goal,
      currentAmount: goal.currentAmount + contribNum
    };

    onUpdateGoal(updatedGoal);
    setActiveContributionGoalId(null);
    setContributionAmount('');
  };

  return (
    <div className="space-y-8">
      
      {/* Overview stats */}
      <div className="flex flex-col md:flex-row gap-6 items-stretch justify-between">
        
        {/* Total savings volume */}
        <div className="flex-1 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-850 dark:text-emerald-400 font-bold text-sm">
              <PiggyBank size={18} />
              <h3>Ahorro Familiar Acumulado</h3>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(totalSavings, currency)}
            </p>
            <p className="text-xs text-slate-500">
              De un objetivo consolidado de {formatCurrency(totalSavingsTarget, currency)}.
            </p>
          </div>
          <div className="hidden sm:block h-20 w-20 relative text-emerald-600 dark:text-emerald-400">
            <svg viewBox="0 0 36 36" className="w-full h-full">
              <path
                className="stroke-emerald-100 dark:stroke-emerald-950"
                strokeWidth="3.5"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="stroke-emerald-600 dark:stroke-emerald-400 transition-all duration-500"
                strokeWidth="3.5"
                strokeDasharray={`${totalSavingsTarget > 0 ? (totalSavings / totalSavingsTarget) * 100 : 0}, 100`}
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        </div>

        {/* Add goal prompt */}
        <div className="md:w-1/4 flex flex-col justify-center">
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-5 py-4 bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-50 text-white dark:text-slate-950 font-bold rounded-xl shadow-lg transition cursor-pointer text-sm"
            id="btn-add-goal"
          >
            <PlusCircle size={18} />
            <span>Nuevo Objetivo</span>
          </button>
        </div>

      </div>

      {/* Grid of Active Goals */}
      {goals.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-full inline-block text-slate-300">
            <Target size={32} />
          </div>
          <div className="max-w-md mx-auto space-y-1.5 px-4">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Sin metas activas</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              No tienes objetivos de ahorro configurados. Crea metas de ahorro para organizar el presupuesto familiar de cara a planes o imprevistos futuros.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="savings-goals-grid">
          {goals.map((goal) => {
            const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            const remaining = goal.targetAmount - goal.currentAmount;
            const isCompleted = goal.currentAmount >= goal.targetAmount;
            const isContributionActive = activeContributionGoalId === goal.id;

            return (
              <div 
                key={goal.id}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:shadow-md transition flex flex-col justify-between gap-5 relative overflow-hidden"
              >
                {/* Visual completion corner banner */}
                {isCompleted && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                    Cumplido 🎉
                  </div>
                )}

                {/* Name & Target */}
                <div className="space-y-1.5">
                  <span className={`w-3 h-3 rounded-full inline-block ${goal.color}`} />
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    {goal.name}
                  </h4>
                  <p className="text-xs text-slate-400 font-semibold font-mono">
                    Objetivo: {formatCurrency(goal.targetAmount, currency)}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">
                      {formatCurrency(goal.currentAmount, currency)}
                    </span>
                    <span className="text-slate-400">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-500 ${goal.color}`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>
                      {remaining > 0 
                        ? `Restan ${formatCurrency(remaining, currency)}` 
                        : '¡Meta alcanzada!'}
                    </span>
                    {goal.deadline && (
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        <span>Límite: {goal.deadline}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Goal Actions Row */}
                <div className="pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between gap-2">
                  
                  {isContributionActive ? (
                    // Contribution Input inline
                    <div className="flex items-center gap-1 w-full">
                      <input
                        type="number"
                        placeholder="Importe"
                        value={contributionAmount}
                        onChange={(e) => setContributionAmount(e.target.value)}
                        className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden"
                        autoFocus
                      />
                      <button
                        onClick={() => handleAddContribution(goal)}
                        className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setActiveContributionGoalId(null);
                          setContributionAmount('');
                        }}
                        className="p-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Add Funds Button */}
                      <button
                        onClick={() => setActiveContributionGoalId(goal.id)}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg transition cursor-pointer"
                        id={`contribute-${goal.id}`}
                      >
                        Aportar Ahorro
                      </button>

                      {/* Edit / Delete mini icons */}
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(goal)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition cursor-pointer"
                          title="Editar objetivo"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('¿Estás seguro de que deseas eliminar esta meta de ahorro?')) {
                              onDeleteGoal(goal.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition cursor-pointer"
                          title="Eliminar objetivo"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Goal Dialog (Modal Overlay) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setIsFormOpen(false)}
            className="fixed inset-0 bg-slate-950/50 cursor-pointer"
          />
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 max-w-sm w-full p-6 shadow-2xl relative z-10 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingGoal ? 'Editar Meta de Ahorro' : 'Nueva Meta de Ahorro'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Completa los datos para planificar tu objetivo de ahorro doméstico.
              </p>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              
              {/* Goal name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Nombre del Objetivo
                </label>
                <input
                  type="text"
                  placeholder="Ej. Vacaciones, Coche nuevo, Fondo de emergencia..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  autoFocus
                />
              </div>

              {/* Targets */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Importe Objetivo
                  </label>
                  <input
                    type="number"
                    placeholder="5000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Ahorro Inicial
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                    disabled={!!editingGoal} // Lock currentAmount on edit to prevent weird balance shifts, user can add contribution instead
                  />
                </div>
              </div>

              {/* Deadline */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Fecha Límite (Opcional)
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Color Presets */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Color de Temática
                </label>
                <div className="flex gap-2.5">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-6 h-6 rounded-full ${color} cursor-pointer transition-all ${
                        selectedColor === color ? 'ring-2 ring-offset-2 ring-slate-800' : 'opacity-70'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {formError && (
                <p className="text-xs text-rose-500 font-semibold">{formError}</p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-semibold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1 cursor-pointer"
                  id="btn-save-goal-submit"
                >
                  <Save size={14} />
                  <span>Guardar</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

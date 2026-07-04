/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, FormEvent } from 'react';
import { Member, Transaction } from '../types';
import { formatCurrency, generateId, getMonthLabel } from '../utils';
import { Users, Plus, Check, Trash2, X, Activity } from 'lucide-react';

interface HouseholdMembersProps {
  members: Member[];
  transactions: Transaction[];
  currentMonth: string;
  currency: string;
  onAddMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
}

const AVATAR_COLORS = [
  'bg-blue-500 text-white',
  'bg-rose-500 text-white',
  'bg-emerald-500 text-white',
  'bg-amber-500 text-white',
  'bg-violet-500 text-white',
  'bg-fuchsia-500 text-white'
];

export function HouseholdMembers({
  members,
  transactions,
  currentMonth,
  currency,
  onAddMember,
  onDeleteMember
}: HouseholdMembersProps) {
  // New member inputs
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [errorMsg, setErrorMsg] = useState('');

  // Calculate expense share per member in the current month
  const memberExpenses = useMemo(() => {
    const stats: Record<string, number> = {};
    
    // Initialize
    members.forEach(m => {
      stats[m.id] = 0;
    });

    let totalExpense = 0;

    // Filter transactions to expenses in this month
    transactions.forEach(t => {
      if (t.type === 'expense' && t.date.startsWith(currentMonth)) {
        stats[t.memberId] = (stats[t.memberId] || 0) + t.amount;
        totalExpense += t.amount;
      }
    });

    return {
      stats,
      totalExpense
    };
  }, [transactions, currentMonth, members]);

  // Handle adding member
  const handleCreateMember = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('El nombre es obligatorio');
      return;
    }

    if (name.trim().length > 15) {
      setErrorMsg('Nombre demasiado largo (máx. 15 carac.)');
      return;
    }

    // Check duplicate
    const exists = members.some(m => m.name.toLowerCase() === name.trim().toLowerCase());
    if (exists) {
      setErrorMsg('Ya existe un miembro con ese nombre');
      return;
    }

    onAddMember({
      id: generateId(),
      name: name.trim(),
      avatarColor: selectedColor
    });

    // Reset Form
    setName('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-8">
      {/* Overview Intro */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
            <Users size={18} />
            <h3>Gestión de Miembros del Hogar</h3>
          </div>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Asigna gastos a personas individuales de la familia o al fondo "Gastos Comunes" para analizar exactamente quién realiza cada desembolso en la economía doméstica.
          </p>
        </div>

        {members.length < 6 && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-50 text-white dark:text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer"
            id="btn-new-member"
          >
            <Plus size={14} />
            <span>Añadir Miembro</span>
          </button>
        )}
      </div>

      {/* Row Split: Left members List with shares, Right: Addition Form / Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Household list and Spend Contribution (8-cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          <h4 className="font-bold text-slate-900 dark:text-white text-md">
            Distribución de Gastos Mensual por Miembro
          </h4>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {members.map(member => {
              const spent = memberExpenses.stats[member.id] || 0;
              const percentage = memberExpenses.totalExpense > 0 
                ? (spent / memberExpenses.totalExpense) * 100 
                : 0;
              
              const isDefaultMember = member.id === 'comun' || member.id === 'papa' || member.id === 'mama';

              return (
                <div key={member.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Avatar & Name */}
                  <div className="flex items-center gap-3 w-1/3">
                    <span className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${member.avatarColor}`}>
                      {member.name.substring(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <h5 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{member.name}</h5>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {member.id}</span>
                    </div>
                  </div>

                  {/* Expense Progress slider bar */}
                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Gastado: <strong>{formatCurrency(spent, currency)}</strong></span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{percentage.toFixed(0)}%</span>
                    </div>
                    
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${member.avatarColor.split(' ')[0]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Delete Option (Strictly lock system-generated default values) */}
                  <div className="sm:w-20 flex justify-end">
                    {!isDefaultMember ? (
                      <button
                        onClick={() => {
                          if (confirm(`¿Estás seguro de que quieres eliminar a ${member.name}? Sus transacciones existentes se reasignarán a "Gastos Comunes".`)) {
                            onDeleteMember(member.id);
                          }
                        }}
                        className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition cursor-pointer"
                        title="Eliminar miembro"
                      >
                        <Trash2 size={14} />
                      </button>
                    ) : (
                      <span className="text-[9px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-850 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800/50 select-none">
                        Por Defecto
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: inline add member panel OR details summary (4-cols) */}
        <div className="lg:col-span-4 space-y-6">
          {isAdding ? (
            // Form to Add Member
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-5">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Nuevo Miembro del Hogar
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Crea una nueva persona para registrar transacciones a su nombre.
                </p>
              </div>

              <form onSubmit={handleCreateMember} className="space-y-4">
                
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Nombre
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Sofía, Abuela, Juan..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                    autoFocus
                  />
                </div>

                {/* Avatar Color */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Color Representativo
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`w-7 h-7 rounded-full ${color.split(' ')[0]} flex items-center justify-center cursor-pointer transition-all ${
                          selectedColor === color ? 'ring-2 ring-offset-2 ring-slate-850' : 'opacity-70'
                        }`}
                      >
                        {selectedColor === color && <Check size={12} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-500 font-semibold">{errorMsg}</p>
                )}

                {/* Form Buttons */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 font-semibold rounded-lg text-xs hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-50 text-white dark:text-slate-950 font-semibold rounded-lg text-xs shadow-md transition cursor-pointer"
                  >
                    Guardar
                  </button>
                </div>

              </form>
            </div>
          ) : (
            // Stats summary card
            <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <Activity size={16} />
                <h4>Análisis de Co-responsabilidad</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Este panel evalúa el reparto del gasto en el hogar. Generalmente, es óptimo mantener el porcentaje del fondo común lo más equilibrado posible para consumos generales, y asignar de forma transparente los gastos personales.
              </p>
              
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-mono">
                Actualizado para {getMonthLabel(currentMonth)}.
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

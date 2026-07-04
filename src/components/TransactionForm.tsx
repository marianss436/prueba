/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction, Category, Member, TransactionType } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_MEMBERS } from '../utils';
import { Icon } from './Icon';
import { X, Save, Calendar, Coins, ArrowUpRight, ArrowDownLeft, FileText } from 'lucide-react';

interface TransactionFormProps {
  categories: Category[];
  members: Member[];
  initialTransaction?: Transaction | null;
  onSave: (data: Omit<Transaction, 'id'> & { id?: string }) => void;
  onClose: () => void;
  isOpen: boolean;
}

const PAYMENT_METHODS = ['Tarjeta', 'Efectivo', 'Bizum', 'Transferencia'];

export function TransactionForm({
  categories,
  members,
  initialTransaction,
  onSave,
  onClose,
  isOpen,
}: TransactionFormProps) {
  const isEditMode = !!initialTransaction;

  // Form states
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('alimentacion');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [memberId, setMemberId] = useState('comun');
  const [paymentMethod, setPaymentMethod] = useState('Tarjeta');
  const [notes, setNotes] = useState('');

  // Form error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset or fill form when modal opens or initialTransaction changes
  useEffect(() => {
    if (isOpen) {
      if (initialTransaction) {
        setDescription(initialTransaction.description);
        setAmount(initialTransaction.amount.toString());
        setType(initialTransaction.type);
        setCategory(initialTransaction.category);
        setDate(initialTransaction.date);
        setMemberId(initialTransaction.memberId);
        setPaymentMethod(initialTransaction.paymentMethod);
        setNotes(initialTransaction.notes || '');
      } else {
        // Clear / Set defaults
        setDescription('');
        setAmount('');
        setType('expense');
        setCategory('alimentacion');
        setDate(new Date().toISOString().split('T')[0]);
        setMemberId('comun');
        setPaymentMethod('Tarjeta');
        setNotes('');
      }
      setErrors({});
    }
  }, [isOpen, initialTransaction]);

  // Handle type toggle (Expense vs Income)
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'income') {
      setCategory('Ingresos');
      setPaymentMethod('Transferencia');
    } else {
      setCategory('alimentacion');
      setPaymentMethod('Tarjeta');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    } else if (description.length > 80) {
      newErrors.description = 'La descripción no debe superar los 80 caracteres';
    }

    const numAmount = parseFloat(amount);
    if (!amount) {
      newErrors.amount = 'El importe es obligatorio';
    } else if (isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Introduce un importe válido y mayor que cero';
    }

    if (!date) {
      newErrors.date = 'La fecha es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSave({
      id: initialTransaction?.id,
      description: description.trim(),
      amount: parseFloat(amount),
      type,
      category: type === 'income' ? 'Ingresos' : category,
      date,
      memberId,
      paymentMethod,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950 z-40 cursor-pointer"
          />

          {/* Form Panel (Slide-over right side) */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 shadow-2xl z-50 flex flex-col h-full"
            id="transaction-form-panel"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/20">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isEditMode ? 'Editar Transacción' : 'Registrar Transacción'}
                </h2>
                <p className="text-xs text-slate-400">
                  {isEditMode ? 'Modifica los datos del registro seleccionado.' : 'Añade un nuevo movimiento a las finanzas del hogar.'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Body (Scrollable) */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* 1. Toggle Type (Gasto / Ingreso) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Tipo de Transacción
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('expense')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                      type === 'expense'
                        ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <ArrowDownLeft size={16} />
                    <span>Gasto</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('income')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                      type === 'income'
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <ArrowUpRight size={16} />
                    <span>Ingreso</span>
                  </button>
                </div>
              </div>

              {/* 2. Amount (Importe) */}
              <div className="space-y-2">
                <label htmlFor="amount" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Importe (€)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <span className="font-semibold text-base">€</span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`w-full pl-8 pr-4 py-3 bg-white dark:bg-slate-900 border ${
                      errors.amount ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                    } rounded-xl text-lg font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-offset-0`}
                    autoFocus
                  />
                </div>
                {errors.amount && (
                  <p className="text-xs text-rose-500 font-medium">{errors.amount}</p>
                )}
              </div>

              {/* 3. Description (Descripción) */}
              <div className="space-y-2">
                <label htmlFor="description" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Descripción
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Coins size={16} />
                  </div>
                  <input
                    type="text"
                    id="description"
                    placeholder="Ej. Súper semanal, Factura luz..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border ${
                      errors.description ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                    } rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2`}
                  />
                </div>
                {errors.description && (
                  <p className="text-xs text-rose-500 font-medium">{errors.description}</p>
                )}
              </div>

              {/* 4. Category Grid (Only for Expense) */}
              {type === 'expense' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Categoría
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {categories.map((cat) => {
                      const isSelected = category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs'
                              : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <Icon name={cat.icon} size={18} className="mb-1" />
                          <span className="text-[10px] font-medium leading-tight truncate w-full">
                            {cat.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. Date (Fecha) */}
              <div className="space-y-2">
                <label htmlFor="date" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Fecha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar size={16} />
                  </div>
                  <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* 6. Member Selection (Miembro del hogar) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Asignar a Miembro
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {members.map((m) => {
                    const isSelected = memberId === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMemberId(m.id)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition text-left text-xs cursor-pointer ${
                          isSelected
                            ? 'bg-slate-50 dark:bg-slate-800 border-slate-600 dark:border-slate-400 text-slate-950 dark:text-white font-medium'
                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full ${m.avatarColor.split(' ')[0]} flex-shrink-0`} />
                        <span className="truncate">{m.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 7. Payment Method (Método de Pago) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Método de Pago
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PAYMENT_METHODS.map((method) => {
                    const isSelected = paymentMethod === method;
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-xs'
                            : 'bg-white text-slate-500 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        {method}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 8. Notes (Notas / Comentarios) */}
              <div className="space-y-2">
                <label htmlFor="notes" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Notas Adicionales (Opcional)
                </label>
                <div className="relative">
                  <div className="absolute top-3.5 left-3.5 text-slate-400">
                    <FileText size={16} />
                  </div>
                  <textarea
                    id="notes"
                    rows={2}
                    placeholder="Añade algún comentario o detalle de la compra..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
              </div>

            </form>

            {/* Footer with Actions */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 text-center border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-sm transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 py-3 bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-semibold rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                id="btn-save-transaction"
              >
                <Save size={16} />
                <span>{isEditMode ? 'Guardar Cambios' : 'Registrar'}</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

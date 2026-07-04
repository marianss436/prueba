/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { Transaction, Category, Member } from '../types';
import { formatCurrency, DEFAULT_CATEGORIES, getMonthLabel, getMonthChoices } from '../utils';
import { Icon } from './Icon';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  X, 
  ArrowUpDown, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Undo,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  members: Member[];
  currency: string;
  onEditTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onExportJSON: () => void;
}

type SortField = 'date' | 'amount' | 'description';
type SortOrder = 'asc' | 'desc';

export function TransactionList({
  transactions,
  categories,
  members,
  currency,
  onEditTransaction,
  onDeleteTransaction,
  onExportJSON
}: TransactionListProps) {
  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all'); // 'all' or 'YYYY-MM'
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMember, setSelectedMember] = useState('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Derive unique months in database for dropdown
  const monthChoices = useMemo(() => {
    return getMonthChoices(transactions);
  }, [transactions]);

  // Handle Sort Change
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // Default to descending
    }
    setCurrentPage(1);
  };

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // 1. Search search term
      const matchesSearch = 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // 2. Month
      const matchesMonth = selectedMonth === 'all' || t.date.startsWith(selectedMonth);

      // 3. Type
      const matchesType = selectedType === 'all' || t.type === selectedType;

      // 4. Category
      const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;

      // 5. Member
      const matchesMember = selectedMember === 'all' || t.memberId === selectedMember;

      // 6. Payment Method
      const matchesPayment = selectedPaymentMethod === 'all' || t.paymentMethod === selectedPaymentMethod;

      return matchesSearch && matchesMonth && matchesType && matchesCategory && matchesMember && matchesPayment;
    });
  }, [transactions, searchTerm, selectedMonth, selectedType, selectedCategory, selectedMember, selectedPaymentMethod]);

  // Sort filtered transactions
  const sortedTransactions = useMemo(() => {
    const list = [...filteredTransactions];
    return list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = a.date.localeCompare(b.date);
      } else if (sortField === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortField === 'description') {
        comparison = a.description.localeCompare(b.description);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredTransactions, sortField, sortOrder]);

  // Paginate transactions
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedTransactions, currentPage]);

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedMonth('all');
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedMember('all');
    setSelectedPaymentMethod('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = useMemo(() => {
    return (
      searchTerm !== '' ||
      selectedMonth !== 'all' ||
      selectedType !== 'all' ||
      selectedCategory !== 'all' ||
      selectedMember !== 'all' ||
      selectedPaymentMethod !== 'all'
    );
  }, [searchTerm, selectedMonth, selectedType, selectedCategory, selectedMember, selectedPaymentMethod]);

  return (
    <div className="space-y-6">
      
      {/* Search & Export Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Buscar por descripción o notas..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            id="input-search"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          onClick={onExportJSON}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm transition cursor-pointer"
          id="btn-export-data"
        >
          <FileSpreadsheet size={16} />
          <span>Exportar Datos (JSON)</span>
        </button>
      </div>

      {/* Advanced Filter Panel */}
      <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold text-sm">
            <Filter size={16} />
            <h4>Filtros de Búsqueda</h4>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-800 transition cursor-pointer"
              id="btn-clear-filters"
            >
              <Undo size={14} />
              <span>Limpiar Filtros</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          
          {/* 1. Month */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mes</label>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">Todos los meses</option>
              {monthChoices.map(m => (
                <option key={m} value={m}>{getMonthLabel(m)}</option>
              ))}
            </select>
          </div>

          {/* 2. Type */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipo</label>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">Ingresos y Gastos</option>
              <option value="expense">Solo Gastos</option>
              <option value="income">Solo Ingresos</option>
            </select>
          </div>

          {/* 3. Category */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Categoría</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              disabled={selectedType === 'income'}
              className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* 4. Family Member */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Asignado a</label>
            <select
              value={selectedMember}
              onChange={(e) => {
                setSelectedMember(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">Toda la familia</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* 5. Payment Method */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Método Pago</label>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => {
                setSelectedPaymentMethod(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">Todos los métodos</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Bizum">Bizum</option>
              <option value="Transferencia">Transferencia</option>
            </select>
          </div>

        </div>
      </div>

      {/* Results Header */}
      <div className="flex justify-between items-center text-xs text-slate-400 font-medium px-1">
        <span>Encontrados {sortedTransactions.length} registros</span>
        {sortedTransactions.length > 0 && (
          <span>Página {currentPage} de {totalPages || 1}</span>
        )}
      </div>

      {/* Main Registry Display */}
      {sortedTransactions.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-full inline-block text-slate-300">
            <Filter size={32} />
          </div>
          <div className="max-w-md mx-auto space-y-1.5 px-4">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Sin resultados encontrados</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              No encontramos transacciones que coincidan con la búsqueda o filtros aplicados. Prueba a modificar las opciones de filtrado.
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="mt-4 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition"
              >
                Restaurar todos los filtros
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th 
                    onClick={() => handleSort('date')}
                    className="py-4 px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/40 transition select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Fecha</span>
                      {sortField === 'date' && <ArrowUpDown size={12} className={sortOrder === 'asc' ? 'rotate-180' : ''} />}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('description')}
                    className="py-4 px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/40 transition select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Concepto / Notas</span>
                      {sortField === 'description' && <ArrowUpDown size={12} className={sortOrder === 'asc' ? 'rotate-180' : ''} />}
                    </div>
                  </th>
                  <th className="py-4 px-6">Categoría</th>
                  <th className="py-4 px-6">Quién</th>
                  <th className="py-4 px-6">Pago</th>
                  <th 
                    onClick={() => handleSort('amount')}
                    className="py-4 px-6 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/40 transition select-none"
                  >
                    <div className="flex items-center gap-1 justify-end">
                      <span>Importe</span>
                      {sortField === 'amount' && <ArrowUpDown size={12} className={sortOrder === 'asc' ? 'rotate-180' : ''} />}
                    </div>
                  </th>
                  <th className="py-4 px-6 text-center w-24">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-sm">
                {paginatedTransactions.map(t => {
                  const cat = categories.find(c => c.id === t.category) || DEFAULT_CATEGORIES.find(c => c.id === t.category);
                  const member = members.find(m => m.id === t.memberId);

                  return (
                    <tr 
                      key={t.id} 
                      className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition group"
                    >
                      {/* Date */}
                      <td className="py-4 px-6 font-medium text-slate-600 dark:text-slate-350 font-mono text-xs">
                        {t.date}
                      </td>

                      {/* Description & Notes */}
                      <td className="py-4 px-6">
                        <div className="space-y-0.5 max-w-sm">
                          <p className="font-semibold text-slate-800 dark:text-slate-100">
                            {t.description}
                          </p>
                          {t.notes && (
                            <p className="text-xs text-slate-400 truncate" title={t.notes}>
                              {t.notes}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6">
                        {t.type === 'income' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                            <ArrowUpRight size={12} />
                            <span>Ingreso</span>
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${cat?.color || 'bg-slate-50 border-slate-150'}`}>
                            <Icon name={cat?.icon || 'Coins'} size={12} />
                            <span>{cat?.name || t.category}</span>
                          </span>
                        )}
                      </td>

                      {/* Member */}
                      <td className="py-4 px-6">
                        {member && (
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${member.avatarColor.split(' ')[0]}`} />
                            <span className="font-medium text-slate-700 dark:text-slate-300 text-xs">{member.name}</span>
                          </div>
                        )}
                      </td>

                      {/* Payment Method */}
                      <td className="py-4 px-6">
                        <span className="text-xs font-mono text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800">
                          {t.paymentMethod}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className={`py-4 px-6 text-right font-bold font-mono text-sm ${
                        t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white'
                      }`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEditTransaction(t)}
                            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-md transition cursor-pointer"
                            title="Editar"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
                                onDeleteTransaction(t.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-3">
            {paginatedTransactions.map(t => {
              const cat = categories.find(c => c.id === t.category) || DEFAULT_CATEGORIES.find(c => c.id === t.category);
              const member = members.find(m => m.id === t.memberId);

              return (
                <div 
                  key={t.id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-3 relative"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 max-w-[70%]">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white leading-tight">
                        {t.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                        <span>{t.date}</span>
                        <span>•</span>
                        <span>{t.paymentMethod}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-bold font-mono ${
                        t.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'
                      }`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                      </p>
                    </div>
                  </div>

                  {t.notes && (
                    <p className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-850 p-2 rounded-lg border border-slate-100 dark:border-slate-800/50">
                      {t.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center gap-2">
                      {/* Tag */}
                      {t.type === 'income' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/10">
                          <ArrowUpRight size={10} />
                          <span>Ingreso</span>
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${cat?.color || 'bg-slate-50 text-slate-600'}`}>
                          <Icon name={cat?.icon || 'Coins'} size={10} />
                          <span>{cat?.name || t.category}</span>
                        </span>
                      )}

                      {/* Owner */}
                      {member && (
                        <span className="flex items-center gap-1 text-[10px] text-slate-500">
                          <span className={`w-1.5 h-1.5 rounded-full ${member.avatarColor.split(' ')[0]}`} />
                          <span>{member.name}</span>
                        </span>
                      )}
                    </div>

                    {/* Quick Mobile Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEditTransaction(t)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-800 transition cursor-pointer"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
                            onDeleteTransaction(t.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-800 transition cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Toolbar */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 pt-4 select-none">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-600 dark:text-slate-400 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-semibold text-slate-500">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-600 dark:text-slate-400 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // YYYY-MM-DD
  memberId: string; // Household member who made the transaction
  paymentMethod: string; // 'Tarjeta', 'Efectivo', 'Bizum', 'Transferencia', etc.
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind text/bg colors context
  colorClass: string; // Tailwind hex or standard name (e.g. 'emerald', 'amber', 'rose')
}

export interface Budget {
  categoryId: string;
  limit: number;
}

export interface Member {
  id: string;
  name: string;
  avatarColor: string; // Tailwind background color
}

export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color: string; // Tailwind color class
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, Member, SavingGoal, Transaction, Budget } from './types';

// Helper to generate IDs
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// Localized currency formatter supporting Euro, Dollar, or Peso
export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  const formatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
}

// Default categories
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'vivienda', name: 'Vivienda', icon: 'Home', color: 'text-indigo-600 bg-indigo-50 border-indigo-100 dark:text-indigo-400 dark:bg-indigo-950/30 dark:border-indigo-900/30', colorClass: 'indigo' },
  { id: 'alimentacion', name: 'Alimentación', icon: 'Utensils', color: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900/30', colorClass: 'emerald' },
  { id: 'transporte', name: 'Transporte', icon: 'Car', color: 'text-blue-600 bg-blue-50 border-blue-100 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-900/30', colorClass: 'blue' },
  { id: 'entretenimiento', name: 'Entretenimiento', icon: 'Tv', color: 'text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900/30', colorClass: 'amber' },
  { id: 'servicios', name: 'Servicios y Suministros', icon: 'Zap', color: 'text-orange-600 bg-orange-50 border-orange-100 dark:text-orange-400 dark:bg-orange-950/30 dark:border-orange-900/30', colorClass: 'orange' },
  { id: 'salud', name: 'Salud y Cuidado', icon: 'HeartPulse', color: 'text-rose-600 bg-rose-50 border-rose-100 dark:text-rose-400 dark:bg-rose-950/30 dark:border-rose-900/30', colorClass: 'rose' },
  { id: 'educacion', name: 'Educación', icon: 'GraduationCap', color: 'text-violet-600 bg-violet-50 border-violet-100 dark:text-violet-400 dark:bg-violet-950/30 dark:border-violet-900/30', colorClass: 'violet' },
  { id: 'compras', name: 'Ropa y Compras', icon: 'ShoppingBag', color: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-100 dark:text-fuchsia-400 dark:bg-fuchsia-950/30 dark:border-fuchsia-900/30', colorClass: 'fuchsia' },
  { id: 'otros', name: 'Otros Gastos', icon: 'Coins', color: 'text-slate-600 bg-slate-50 border-slate-100 dark:text-slate-400 dark:bg-slate-950/30 dark:border-slate-900/30', colorClass: 'slate' },
];

// Default members
export const DEFAULT_MEMBERS: Member[] = [
  { id: 'papa', name: 'Papá', avatarColor: 'bg-blue-500 text-white' },
  { id: 'mama', name: 'Mamá', avatarColor: 'bg-rose-500 text-white' },
  { id: 'comun', name: 'Gastos Comunes', avatarColor: 'bg-emerald-500 text-white' },
];

// Default budgets
export const DEFAULT_BUDGETS: Budget[] = [
  { categoryId: 'vivienda', limit: 850 },
  { categoryId: 'alimentacion', limit: 400 },
  { categoryId: 'transporte', limit: 150 },
  { categoryId: 'entretenimiento', limit: 120 },
  { categoryId: 'servicios', limit: 200 },
  { categoryId: 'salud', limit: 80 },
  { categoryId: 'educacion', limit: 100 },
  { categoryId: 'compras', limit: 100 },
  { categoryId: 'otros', limit: 100 },
];

// Default saving goals
export const DEFAULT_GOALS: SavingGoal[] = [
  { id: 'emergencias', name: 'Fondo de Emergencia', targetAmount: 5000, currentAmount: 3450, deadline: '2026-12-31', color: 'bg-emerald-600' },
  { id: 'vacaciones', name: 'Vacaciones de Verano', targetAmount: 2000, currentAmount: 1200, deadline: '2026-08-15', color: 'bg-indigo-600' },
  { id: 'reformas', name: 'Reformas Cocina', targetAmount: 8000, currentAmount: 1500, deadline: '2027-06-01', color: 'bg-amber-600' },
];

// Seed realistic transactions
export function getSeededTransactions(): Transaction[] {
  const transactions: Transaction[] = [];
  const now = new Date();
  
  // Format helper
  const formatDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(now.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  // 1. Incomes
  transactions.push({
    id: generateId(),
    description: 'Nómina Mamá',
    amount: 1950,
    type: 'income',
    category: 'Ingresos',
    date: formatDate(3),
    memberId: 'mama',
    paymentMethod: 'Transferencia',
    notes: 'Salario neto de junio',
  });

  transactions.push({
    id: generateId(),
    description: 'Nómina Papá',
    amount: 1850,
    type: 'income',
    category: 'Ingresos',
    date: formatDate(3),
    memberId: 'papa',
    paymentMethod: 'Transferencia',
    notes: 'Salario neto de junio',
  });

  transactions.push({
    id: generateId(),
    description: 'Venta Artículo de Segunda Mano',
    amount: 75,
    type: 'income',
    category: 'Ingresos',
    date: formatDate(12),
    memberId: 'papa',
    paymentMethod: 'Bizum',
    notes: 'Venta de bicicleta vieja',
  });

  // 2. Vivienda
  transactions.push({
    id: generateId(),
    description: 'Pago de Alquiler / Hipoteca',
    amount: 750,
    type: 'expense',
    category: 'vivienda',
    date: formatDate(25),
    memberId: 'comun',
    paymentMethod: 'Transferencia',
    notes: 'Mensualidad principal',
  });

  // 3. Alimentación
  transactions.push({
    id: generateId(),
    description: 'Compra Semanal Mercadona',
    amount: 112.45,
    type: 'expense',
    category: 'alimentacion',
    date: formatDate(1),
    memberId: 'mama',
    paymentMethod: 'Tarjeta',
    notes: 'Compra para toda la semana',
  });

  transactions.push({
    id: generateId(),
    description: 'Cena en Restaurante Familiar',
    amount: 64.20,
    type: 'expense',
    category: 'alimentacion',
    date: formatDate(5),
    memberId: 'comun',
    paymentMethod: 'Tarjeta',
    notes: 'Celebración cumpleaños',
  });

  transactions.push({
    id: generateId(),
    description: 'Frutería de Barrio',
    amount: 18.30,
    type: 'expense',
    category: 'alimentacion',
    date: formatDate(8),
    memberId: 'papa',
    paymentMethod: 'Efectivo',
  });

  transactions.push({
    id: generateId(),
    description: 'Compra Semanal Carrefour',
    amount: 98.60,
    type: 'expense',
    category: 'alimentacion',
    date: formatDate(10),
    memberId: 'mama',
    paymentMethod: 'Tarjeta',
  });

  transactions.push({
    id: generateId(),
    description: 'Pan y embutidos',
    amount: 12.15,
    type: 'expense',
    category: 'alimentacion',
    date: formatDate(14),
    memberId: 'papa',
    paymentMethod: 'Efectivo',
  });

  // 4. Transporte
  transactions.push({
    id: generateId(),
    description: 'Repostaje Gasolina Papá',
    amount: 55.00,
    type: 'expense',
    category: 'transporte',
    date: formatDate(2),
    memberId: 'papa',
    paymentMethod: 'Tarjeta',
    notes: 'Gasolinera Repsol',
  });

  transactions.push({
    id: generateId(),
    description: 'Abono de Transporte Público',
    amount: 40.00,
    type: 'expense',
    category: 'transporte',
    date: formatDate(26),
    memberId: 'mama',
    paymentMethod: 'Tarjeta',
    notes: 'Abono mensual zona A',
  });

  transactions.push({
    id: generateId(),
    description: 'Repostaje Gasolina Mamá',
    amount: 48.00,
    type: 'expense',
    category: 'transporte',
    date: formatDate(15),
    memberId: 'mama',
    paymentMethod: 'Tarjeta',
  });

  // 5. Servicios
  transactions.push({
    id: generateId(),
    description: 'Factura Luz Endesa',
    amount: 84.50,
    type: 'expense',
    category: 'servicios',
    date: formatDate(4),
    memberId: 'comun',
    paymentMethod: 'Transferencia',
    notes: 'Factura bimensual',
  });

  transactions.push({
    id: generateId(),
    description: 'Fibra Óptica e Internet',
    amount: 45.00,
    type: 'expense',
    category: 'servicios',
    date: formatDate(18),
    memberId: 'comun',
    paymentMethod: 'Transferencia',
    notes: 'Orange pack internet + movil',
  });

  transactions.push({
    id: generateId(),
    description: 'Factura de Agua Canal Isabel II',
    amount: 28.90,
    type: 'expense',
    category: 'servicios',
    date: formatDate(20),
    memberId: 'comun',
    paymentMethod: 'Transferencia',
  });

  // 6. Entretenimiento
  transactions.push({
    id: generateId(),
    description: 'Suscripción Netflix',
    amount: 17.99,
    type: 'expense',
    category: 'entretenimiento',
    date: formatDate(16),
    memberId: 'comun',
    paymentMethod: 'Tarjeta',
    notes: 'Plan Premium 4K',
  });

  transactions.push({
    id: generateId(),
    description: 'Entradas de Cine x3',
    amount: 25.50,
    type: 'expense',
    category: 'entretenimiento',
    date: formatDate(11),
    memberId: 'mama',
    paymentMethod: 'Tarjeta',
  });

  transactions.push({
    id: generateId(),
    description: 'Suscripción Spotify Familiar',
    amount: 15.99,
    type: 'expense',
    category: 'entretenimiento',
    date: formatDate(22),
    memberId: 'comun',
    paymentMethod: 'Tarjeta',
  });

  // 7. Salud
  transactions.push({
    id: generateId(),
    description: 'Medicamentos Farmacia',
    amount: 22.40,
    type: 'expense',
    category: 'salud',
    date: formatDate(7),
    memberId: 'mama',
    paymentMethod: 'Tarjeta',
    notes: 'Tratamiento alergia',
  });

  transactions.push({
    id: generateId(),
    description: 'Dentista - Limpieza',
    amount: 50.00,
    type: 'expense',
    category: 'salud',
    date: formatDate(17),
    memberId: 'papa',
    paymentMethod: 'Tarjeta',
    notes: 'Revisión anual',
  });

  // 8. Educación
  transactions.push({
    id: generateId(),
    description: 'Libros de Lectura Infantil',
    amount: 34.90,
    type: 'expense',
    category: 'educacion',
    date: formatDate(9),
    memberId: 'mama',
    paymentMethod: 'Tarjeta',
  });

  // 9. Compras
  transactions.push({
    id: generateId(),
    description: 'Zapatillas de Deporte',
    amount: 59.99,
    type: 'expense',
    category: 'compras',
    date: formatDate(6),
    memberId: 'papa',
    paymentMethod: 'Tarjeta',
    notes: 'Decathlon',
  });

  // 10. Otros
  transactions.push({
    id: generateId(),
    description: 'Imprevisto cerrajero urgencia',
    amount: 90.00,
    type: 'expense',
    category: 'otros',
    date: formatDate(21),
    memberId: 'comun',
    paymentMethod: 'Efectivo',
    notes: 'Se atascó la cerradura',
  });

  return transactions.sort((a, b) => b.date.localeCompare(a.date));
}

// Get month choices list for filtering
export function getMonthChoices(transactions: Transaction[]) {
  const monthsSet = new Set<string>();
  transactions.forEach(t => {
    // extract YYYY-MM
    monthsSet.add(t.date.substring(0, 7));
  });
  
  // ensure current month is in there
  const curMonth = new Date().toISOString().substring(0, 7);
  monthsSet.add(curMonth);
  
  return Array.from(monthsSet).sort((a, b) => b.localeCompare(a));
}

export function getMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const idx = parseInt(month, 10) - 1;
  return `${monthNames[idx]} ${year}`;
}

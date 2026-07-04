/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useRef, ChangeEvent } from 'react';
import { motion } from 'motion/react';
import { 
  Transaction, 
  Category, 
  Budget, 
  Member, 
  SavingGoal 
} from './types';
import { 
  getSeededTransactions, 
  DEFAULT_CATEGORIES, 
  DEFAULT_MEMBERS, 
  DEFAULT_BUDGETS, 
  DEFAULT_GOALS,
  getMonthLabel,
  getMonthChoices
} from './utils';

// Import our modular components
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { TransactionForm } from './components/TransactionForm';
import { BudgetSettings } from './components/BudgetSettings';
import { Analytics } from './components/Analytics';
import { SavingsGoals } from './components/SavingsGoals';
import { HouseholdMembers } from './components/HouseholdMembers';

// Lucide icons
import { 
  LayoutDashboard, 
  ReceiptText, 
  PiggyBank, 
  Compass, 
  Users, 
  SlidersHorizontal,
  Sun,
  Moon,
  Trash2,
  Upload,
  Info,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

export default function App() {
  // --- 1. CORE FINANCIAL STATE ---
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [members, setMembers] = useState<Member[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  
  // App settings states
  const [currency, setCurrency] = useState('EUR');
  const [currentMonth, setCurrentMonth] = useState(() => {
    return new Date().toISOString().substring(0, 7); // current Year-Month
  });
  const [activeTab, setActiveTab] = useState('resumen');
  const [isDark, setIsDark] = useState(false);
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Notifications or toast message
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Hidden file input ref for JSON import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 2. LOCALSTORAGE SYNCHRONIZATION ON INITIAL LOAD ---
  useEffect(() => {
    // Determine system theme preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedTheme = localStorage.getItem('theme');
    const finalDark = storedTheme === 'dark' || (!storedTheme && prefersDark);
    setIsDark(finalDark);
    if (finalDark) {
      document.documentElement.classList.add('dark');
    }

    // Load Transactions
    const storedTransactions = localStorage.getItem('household_transactions');
    if (storedTransactions) {
      try {
        setTransactions(JSON.parse(storedTransactions));
      } catch (e) {
        setTransactions(getSeededTransactions());
      }
    } else {
      // Seed initial mock data
      const seeded = getSeededTransactions();
      setTransactions(seeded);
      localStorage.setItem('household_transactions', JSON.stringify(seeded));
    }

    // Load Members
    const storedMembers = localStorage.getItem('household_members');
    if (storedMembers) {
      try {
        setMembers(JSON.parse(storedMembers));
      } catch (e) {
        setMembers(DEFAULT_MEMBERS);
      }
    } else {
      setMembers(DEFAULT_MEMBERS);
      localStorage.setItem('household_members', JSON.stringify(DEFAULT_MEMBERS));
    }

    // Load Budgets
    const storedBudgets = localStorage.getItem('household_budgets');
    if (storedBudgets) {
      try {
        setBudgets(JSON.parse(storedBudgets));
      } catch (e) {
        setBudgets(DEFAULT_BUDGETS);
      }
    } else {
      setBudgets(DEFAULT_BUDGETS);
      localStorage.setItem('household_budgets', JSON.stringify(DEFAULT_BUDGETS));
    }

    // Load Savings Goals
    const storedGoals = localStorage.getItem('household_goals');
    if (storedGoals) {
      try {
        setGoals(JSON.parse(storedGoals));
      } catch (e) {
        setGoals(DEFAULT_GOALS);
      }
    } else {
      setGoals(DEFAULT_GOALS);
      localStorage.setItem('household_goals', JSON.stringify(DEFAULT_GOALS));
    }

    // Load Currency setting
    const storedCur = localStorage.getItem('household_currency') || 'EUR';
    setCurrency(storedCur);
  }, []);

  // --- 3. TOAST NOTIFICATION TIMER ---
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // --- 4. TOGGLE DARK MODE ---
  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // --- 5. DATA MUTATION HANDLERS (PERSIST TO LOCALSTORAGE) ---

  // Transactions Handlers
  const handleSaveTransaction = (data: Omit<Transaction, 'id'> & { id?: string }) => {
    let nextTransactions = [...transactions];

    if (data.id) {
      // Editing
      nextTransactions = nextTransactions.map(t => 
        t.id === data.id ? { ...t, ...data } as Transaction : t
      );
      showToast('Transacción actualizada con éxito');
    } else {
      // Creating
      const newTx: Transaction = {
        ...data,
        id: Math.random().toString(36).substring(2, 11)
      } as Transaction;
      nextTransactions = [newTx, ...nextTransactions];
      showToast('Nueva transacción registrada');
    }

    setTransactions(nextTransactions);
    localStorage.setItem('household_transactions', JSON.stringify(nextTransactions));
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    const nextTransactions = transactions.filter(t => t.id !== id);
    setTransactions(nextTransactions);
    localStorage.setItem('household_transactions', JSON.stringify(nextTransactions));
    showToast('Registro eliminado', 'info');
  };

  // Budgets Handlers
  const handleSaveBudget = (categoryId: string, limit: number) => {
    let budgetExists = false;
    const nextBudgets = budgets.map(b => {
      if (b.categoryId === categoryId) {
        budgetExists = true;
        return { ...b, limit };
      }
      return b;
    });

    if (!budgetExists) {
      nextBudgets.push({ categoryId, limit });
    }

    setBudgets(nextBudgets);
    localStorage.setItem('household_budgets', JSON.stringify(nextBudgets));
    showToast('Presupuesto de categoría actualizado');
  };

  // Goals Handlers
  const handleAddGoal = (newGoal: SavingGoal) => {
    const nextGoals = [...goals, newGoal];
    setGoals(nextGoals);
    localStorage.setItem('household_goals', JSON.stringify(nextGoals));
    showToast('Nueva meta de ahorro planificada');
  };

  const handleUpdateGoal = (updatedGoal: SavingGoal) => {
    const nextGoals = goals.map(g => g.id === updatedGoal.id ? updatedGoal : g);
    setGoals(nextGoals);
    localStorage.setItem('household_goals', JSON.stringify(nextGoals));
    showToast('Meta de ahorro actualizada');
  };

  const handleDeleteGoal = (id: string) => {
    const nextGoals = goals.filter(g => g.id !== id);
    setGoals(nextGoals);
    localStorage.setItem('household_goals', JSON.stringify(nextGoals));
    showToast('Meta de ahorro eliminada', 'info');
  };

  // Members Handlers
  const handleAddMember = (newMember: Member) => {
    const nextMembers = [...members, newMember];
    setMembers(nextMembers);
    localStorage.setItem('household_members', JSON.stringify(nextMembers));
    showToast(`Miembro "${newMember.name}" añadido`);
  };

  const handleDeleteMember = (id: string) => {
    // Delete member
    const nextMembers = members.filter(m => m.id !== id);
    setMembers(nextMembers);
    localStorage.setItem('household_members', JSON.stringify(nextMembers));

    // Re-assign this member's transactions to "comun"
    const nextTransactions = transactions.map(t => {
      if (t.memberId === id) {
        return { ...t, memberId: 'comun' };
      }
      return t;
    });
    setTransactions(nextTransactions);
    localStorage.setItem('household_transactions', JSON.stringify(nextTransactions));

    showToast('Miembro eliminado. Gastos reasignados a fondo común', 'info');
  };

  // Change currency setting
  const handleCurrencyChange = (newCur: string) => {
    setCurrency(newCur);
    localStorage.setItem('household_currency', newCur);
    showToast(`Moneda de visualización cambiada a ${newCur}`);
  };

  // --- 6. DATA PORTABILITY (EXPORT / IMPORT / RESET) ---

  // Export full backup
  const handleExportJSON = () => {
    const backupData = {
      transactions,
      members,
      budgets,
      goals,
      currency,
      version: '1.0.0',
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `control-gastos-hogar-respaldo-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Copia de seguridad descargada correctamente');
  };

  // Trigger JSON file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Process imported JSON
  const handleImportJSON = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        
        // Validate basic keys
        if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed.transactions) && Array.isArray(parsed.members) && Array.isArray(parsed.budgets) && Array.isArray(parsed.goals)) {
            // Confirm with user
            if (confirm('¿Deseas sobreescribir los datos actuales del hogar con los de este archivo de respaldo?')) {
              setTransactions(parsed.transactions);
              setMembers(parsed.members);
              setBudgets(parsed.budgets);
              setGoals(parsed.goals);
              if (parsed.currency) setCurrency(parsed.currency);

              localStorage.setItem('household_transactions', JSON.stringify(parsed.transactions));
              localStorage.setItem('household_members', JSON.stringify(parsed.members));
              localStorage.setItem('household_budgets', JSON.stringify(parsed.budgets));
              localStorage.setItem('household_goals', JSON.stringify(parsed.goals));
              if (parsed.currency) localStorage.setItem('household_currency', parsed.currency);

              showToast('Datos del hogar restaurados con éxito!', 'success');
            }
          } else {
            showToast('Formato inválido. Faltan colecciones obligatorias.', 'error');
          }
        } else {
          showToast('Archivo no compatible o dañado.', 'error');
        }
      } catch (err) {
        showToast('Error al procesar el archivo JSON.', 'error');
      }
    };
    reader.readAsText(file);
    // Reset target value to allow re-triggering same file
    e.target.value = '';
  };

  // Reset database completely
  const handleClearAllData = () => {
    if (confirm('¿Estás SEGURO de que quieres borrar TODAS tus transacciones, presupuestos, metas de ahorro y restablecer los valores por defecto? Esta acción no se puede deshacer.')) {
      if (confirm('Por favor confirma por segunda vez que estás de acuerdo en eliminar el historial completo.')) {
        localStorage.removeItem('household_transactions');
        localStorage.removeItem('household_members');
        localStorage.removeItem('household_budgets');
        localStorage.removeItem('household_goals');
        localStorage.removeItem('household_currency');

        // Restore seeds
        const seeded = getSeededTransactions();
        setTransactions(seeded);
        setMembers(DEFAULT_MEMBERS);
        setBudgets(DEFAULT_BUDGETS);
        setGoals(DEFAULT_GOALS);
        setCurrency('EUR');

        localStorage.setItem('household_transactions', JSON.stringify(seeded));
        localStorage.setItem('household_members', JSON.stringify(DEFAULT_MEMBERS));
        localStorage.setItem('household_budgets', JSON.stringify(DEFAULT_BUDGETS));
        localStorage.setItem('household_goals', JSON.stringify(DEFAULT_GOALS));
        localStorage.setItem('household_currency', 'EUR');

        showToast('Base de datos restablecida a los valores de fábrica', 'info');
        setActiveTab('resumen');
      }
    }
  };

  // --- 7. DERIVE DATA FOR NAVIGATION & OVERVIEW ---
  const monthChoices = useMemo(() => {
    return getMonthChoices(transactions);
  }, [transactions]);

  // Adjust active tab panel render
  const renderTabContent = () => {
    switch (activeTab) {
      case 'resumen':
        return (
          <Dashboard
            transactions={transactions}
            categories={categories}
            budgets={budgets}
            members={members}
            goals={goals}
            currency={currency}
            currentMonth={currentMonth}
            onAddTransactionClick={() => {
              setEditingTransaction(null);
              setIsFormOpen(true);
            }}
            onViewAllTransactions={() => setActiveTab('transacciones')}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        );
      case 'transacciones':
        return (
          <TransactionList
            transactions={transactions}
            categories={categories}
            members={members}
            currency={currency}
            onEditTransaction={(t) => {
              setEditingTransaction(t);
              setIsFormOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
            onExportJSON={handleExportJSON}
          />
        );
      case 'presupuestos':
        return (
          <BudgetSettings
            categories={categories}
            budgets={budgets}
            transactions={transactions}
            currentMonth={currentMonth}
            currency={currency}
            onSaveBudget={handleSaveBudget}
          />
        );
      case 'analisis':
        return (
          <Analytics
            transactions={transactions}
            categories={categories}
            currentMonth={currentMonth}
            currency={currency}
          />
        );
      case 'metas':
        return (
          <SavingsGoals
            goals={goals}
            currency={currency}
            onAddGoal={handleAddGoal}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
          />
        );
      case 'miembros':
        return (
          <HouseholdMembers
            members={members}
            transactions={transactions}
            currentMonth={currentMonth}
            currency={currency}
            onAddMember={handleAddMember}
            onDeleteMember={handleDeleteMember}
          />
        );
      default:
        return null;
    }
  };

  // Navigation menu definitions
  const NAV_ITEMS = [
    { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
    { id: 'transacciones', label: 'Transacciones', icon: ReceiptText },
    { id: 'presupuestos', label: 'Presupuestos', icon: SlidersHorizontal },
    { id: 'analisis', label: 'Análisis', icon: Compass },
    { id: 'metas', label: 'Ahorros', icon: PiggyBank },
    { id: 'miembros', label: 'Miembros', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col md:flex-row font-sans transition-colors duration-300">
      
      {/* 1. TOAST COMPONENT */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold select-none bg-white dark:bg-slate-900 border dark:border-slate-800"
          style={{
            borderColor: toast.type === 'error' ? '#f43f5e' : toast.type === 'info' ? '#3b82f6' : '#10b981',
          }}
        >
          <CheckCircle2 size={16} className={toast.type === 'error' ? 'text-rose-500' : toast.type === 'info' ? 'text-blue-500' : 'text-emerald-500'} />
          <span className="text-slate-800 dark:text-slate-200">{toast.message}</span>
        </motion.div>
      )}

      {/* Hidden file uploader for backup restore */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportJSON}
        accept=".json"
        className="hidden"
      />

      {/* 2. SIDEBAR NAVIGATION (Desktop) / TOP NAVBAR (Mobile) */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-850 flex flex-col justify-between p-5 md:h-screen md:sticky md:top-0 z-30">
        <div className="space-y-6">
          {/* App Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black text-lg flex items-center justify-center">
                €
              </span>
              <div>
                <h1 className="font-bold text-sm tracking-tight text-slate-950 dark:text-white uppercase">
                  Control Hogar
                </h1>
                <p className="text-[10px] font-mono font-bold text-slate-400">v1.0.0 Stable</p>
              </div>
            </div>
            
            {/* Quick Dark Mode toggle in header for mobile */}
            <button
              onClick={toggleDarkMode}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          {/* Nav Items Link List */}
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 -mx-3 md:mx-0 px-3 md:px-0 scrollbar-none">
            {NAV_ITEMS.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition flex-shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white'
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                  id={`nav-link-${item.id}`}
                >
                  <IconComp size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls (Desktop only) */}
        <div className="hidden md:block pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
          {/* Preferences controls */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Preferencias
            </span>
            
            {/* Dark mode button */}
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-between px-3 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-350 rounded-xl text-xs font-semibold cursor-pointer transition"
            >
              <div className="flex items-center gap-2">
                {isDark ? <Sun size={14} /> : <Moon size={14} />}
                <span>{isDark ? 'Modo Claro' : 'Modo Oscuro'}</span>
              </div>
              <span className="text-[9px] font-mono text-slate-400">Ctrl + D</span>
            </button>

            {/* Currency selector */}
            <div className="space-y-1">
              <label htmlFor="currency-select" className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Divisa</label>
              <select
                id="currency-select"
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden"
              >
                <option value="EUR">Euros (€)</option>
                <option value="USD">Dólares ($)</option>
                <option value="MXN">Pesos (Mex$)</option>
                <option value="GBP">Libras (£)</option>
              </select>
            </div>
          </div>

          {/* Backup Restores & Reset */}
          <div className="space-y-1.5 pt-2">
            <button
              onClick={triggerFileInput}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer transition"
              title="Importar respaldo JSON"
            >
              <Upload size={12} />
              <span>Restaurar Respaldo</span>
            </button>
            <button
              onClick={handleClearAllData}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-semibold text-rose-500 hover:text-rose-700 cursor-pointer transition"
              title="Reiniciar aplicación"
            >
              <Trash2 size={12} />
              <span>Borrar Todo</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 3. MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Workspace Top Toolbar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 px-6 md:px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-20 sticky top-0">
          <div>
            <h2 className="text-xl font-bold text-slate-950 dark:text-white capitalize">
              {activeTab === 'resumen' ? 'Cuadro de Mando' : activeTab}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Administración presupuestaria y contabilidad del hogar.
            </p>
          </div>

          {/* Month selector toolbar */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono hidden sm:block">
              Mes Activo
            </span>
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="w-full sm:w-auto p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-250 cursor-pointer focus:outline-hidden"
              id="header-month-select"
            >
              {monthChoices.map((m) => (
                <option key={m} value={m}>
                  {getMonthLabel(m)}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Workspace Panels Body (Scrollable container) */}
        <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {renderTabContent()}
        </div>

        {/* Dynamic Mobile Footer controls helper (only displayed on screens < md) */}
        <footer className="md:hidden p-5 border-t border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Currency */}
            <div className="space-y-1">
              <label htmlFor="currency-select-mobile" className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Divisa</label>
              <select
                id="currency-select-mobile"
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden"
              >
                <option value="EUR">Euros (€)</option>
                <option value="USD">Dólares ($)</option>
                <option value="MXN">Pesos (Mex$)</option>
              </select>
            </div>
            {/* Clear All */}
            <div className="flex items-end justify-end">
              <button
                onClick={handleClearAllData}
                className="w-full py-2 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-950/50 hover:bg-rose-100 font-semibold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Borrar Todo</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3">
            <span>© 2026 Control de Gastos</span>
            <button
              onClick={triggerFileInput}
              className="flex items-center gap-1 hover:text-slate-600 transition"
            >
              <Upload size={12} />
              <span>Importar Respaldo</span>
            </button>
          </div>
        </footer>

      </main>

      {/* 4. SLIDE OVER TRANSACTION REGISTRY FORM */}
      <TransactionForm
        categories={categories}
        members={members}
        initialTransaction={editingTransaction}
        isOpen={isFormOpen}
        onSave={handleSaveTransaction}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTransaction(null);
        }}
      />

    </div>
  );
}

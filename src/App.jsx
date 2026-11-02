
import { useState, useEffect, useMemo, useRef } from 'react';
import './App.css';

/* =========================================
   MONEY BUILDER
   Complete App.jsx
   ========================================= */

const STORAGE_KEY = 'transactions';
const LANGUAGE_KEY = 'moneyBuilderLanguage';
const BUDGETS_KEY = 'moneyBuilderBudgets';
const GOALS_KEY = 'moneyBuilderGoals';

/* =========================================
   HELPERS
   ========================================= */

const today = () => {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};

function readStored(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeName(name) {
  return String(name || '')
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, ' ');
}

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value) || 0);
}

/* =========================================
   CATEGORIES
   ========================================= */

const categories = {
  income: [
    'Salary',
    'Freelance',
    'Business',
    'Investment',
    'Bonus',
    'Other'
  ],
  expense: [
    'Housing',
    'Food',
    'Transport',
    'Shopping',
    'Bills',
    'Health',
    'Education',
    'Entertainment',
    'Other'
  ]
};

const chartColors = [
  '#64748b',
  '#2563eb',
  '#16a34a',
  '#f59e0b',
  '#dc2626',
  '#9333ea',
  '#0891b2',
  '#db2777'
];

/* =========================================
   TRANSLATIONS
   ========================================= */

const translations = {
  en: {
    subtitle: 'Personal Finance Dashboard',
    account: 'My Account',
    balance: 'Total Balance',
    income: 'Total Income',
    expenses: 'Total Expenses',
    balanceDescription: 'Your current financial balance',
    overview: 'Financial Overview',
    savings: 'Savings Rate',
    savingsDescription: 'Your income remaining after expenses',
    savingsGood: 'Great work! You are building your savings.',
    savingsLow: 'Your expenses are close to your income.',
    savingsNegative: 'Your expenses exceed your income.',
    breakdown: 'Expense Breakdown',
    breakdownDescription: 'See where your money goes.',
    monthlyReports: 'Monthly Reports',
    monthlyReportsDescription: 'Review income, expenses and activity by month.',
    selectMonth: 'Select month',
    allTypes: 'All transactions',
    monthlyIncome: 'Monthly Income',
    monthlyExpenses: 'Monthly Expenses',
    monthlyNet: 'Monthly Net',
    monthlyCount: 'Transactions this month',
    monthlyTrend: 'Six-month trend',
    noMonthlyTransactions: 'No transactions for this month.',
    incomeLabel: 'Income',
    expenseLabel: 'Expenses',
    addTransaction: 'Add Transaction',
    editTransaction: 'Edit Transaction',
    transactionName: 'Transaction name',
    amount: 'Amount (USD)',
    incomeOption: 'Income',
    expenseOption: 'Expense',
    category: 'Category',
    date: 'Date',
    add: 'Add Transaction',
    update: 'Update Transaction',
    cancel: 'Cancel',
    recent: 'Recent Transactions',
    delete: 'Delete',
    edit: 'Edit',
    noTransactions: 'No transactions yet.',
    transactionCount: 'transactions',
    backup: 'Backup & Data Management',
    backupDescription: 'Export your data or restore a previous backup.',
    export: 'Export Backup',
    restore: 'Restore Backup',
    duplicate: 'This transaction already exists. Use Edit to update its amount.',
    invalid: 'Please enter a valid name, amount and date.',
    added: 'Transaction added successfully!',
    updated: 'Transaction updated successfully!',
    deleted: 'Transaction deleted successfully!',
    restored: 'Backup restored successfully!',
    backupError: 'Invalid backup file.',
    confirmDelete: 'Are you sure you want to delete this transaction?',
    noExpenses: 'No expenses recorded yet.',
    language: 'العربية',
    salary: 'Salary',
    freelance: 'Freelance',
    business: 'Business',
    investment: 'Investment',
    bonus: 'Bonus',
    housing: 'Housing',
    food: 'Food',
    transport: 'Transport',
    shopping: 'Shopping',
    bills: 'Bills',
    health: 'Health',
    education: 'Education',
    entertainment: 'Entertainment',
    other: 'Other'
  },

  ar: {
    subtitle: 'لوحة التحكم المالية الشخصية',
    account: 'حسابي',
    balance: 'إجمالي الرصيد',
    income: 'إجمالي الدخل',
    expenses: 'إجمالي المصروفات',
    balanceDescription: 'رصيدك المالي الحالي',
    overview: 'النظرة المالية العامة',
    savings: 'معدل الادخار',
    savingsDescription: 'الدخل المتبقي بعد المصروفات',
    savingsGood: 'عمل رائع! أنت تعمل على زيادة مدخراتك.',
    savingsLow: 'مصروفاتك تقترب من قيمة دخلك.',
    savingsNegative: 'مصروفاتك تتجاوز دخلك.',
    breakdown: 'تحليل المصروفات',
    breakdownDescription: 'تعرف على كيفية إنفاق أموالك.',
    monthlyReports: 'التقارير الشهرية',
    monthlyReportsDescription: 'راجعي الدخل والمصروفات وحركة الأموال شهرياً.',
    selectMonth: 'اختاري الشهر',
    allTypes: 'كل المعاملات',
    monthlyIncome: 'الدخل الشهري',
    monthlyExpenses: 'المصروفات الشهرية',
    monthlyNet: 'صافي الشهر',
    monthlyCount: 'عدد معاملات هذا الشهر',
    monthlyTrend: 'اتجاه آخر ستة أشهر',
    noMonthlyTransactions: 'لا توجد معاملات في هذا الشهر.',
    incomeLabel: 'الدخل',
    expenseLabel: 'المصروفات',
    addTransaction: 'إضافة معاملة',
    editTransaction: 'تعديل المعاملة',
    transactionName: 'اسم المعاملة',
    amount: 'المبلغ (USD)',
    incomeOption: 'دخل',
    expenseOption: 'مصروف',
    category: 'الفئة',
    date: 'التاريخ',
    add: 'إضافة المعاملة',
    update: 'تحديث المعاملة',
    cancel: 'إلغاء',
    recent: 'المعاملات الأخيرة',
    delete: 'حذف',
    edit: 'تعديل',
    noTransactions: 'لا توجد معاملات حتى الآن.',
    transactionCount: 'معاملات',
    backup: 'النسخ الاحتياطي وإدارة البيانات',
    backupDescription: 'قم بتصدير بياناتك أو استعادة نسخة احتياطية.',
    export: 'تصدير نسخة احتياطية',
    restore: 'استعادة نسخة احتياطية',
    duplicate: 'هذه المعاملة موجودة بالفعل. استخدم زر التعديل لتحديث المبلغ.',
    invalid: 'يرجى إدخال اسم ومبلغ وتاريخ صحيح.',
    added: 'تمت إضافة المعاملة بنجاح!',
    updated: 'تم تحديث المعاملة بنجاح!',
    deleted: 'تم حذف المعاملة بنجاح!',
    restored: 'تمت استعادة النسخة الاحتياطية بنجاح!',
    backupError: 'ملف النسخة الاحتياطية غير صالح.',
    confirmDelete: 'هل أنت متأكد من حذف هذه المعاملة؟',
    noExpenses: 'لا توجد مصروفات مسجلة.',
    language: 'English',
    salary: 'راتب',
    freelance: 'عمل حر',
    business: 'أعمال',
    investment: 'استثمار',
    bonus: 'مكافأة',
    housing: 'سكن',
    food: 'طعام',
    transport: 'مواصلات',
    shopping: 'تسوق',
    bills: 'فواتير',
    health: 'صحة',
    education: 'تعليم',
    entertainment: 'ترفيه',
    other: 'أخرى'
  }
};

/* =========================================
   LOAD AND NORMALIZE TRANSACTIONS
   ========================================= */

const defaultTransactions = [
  {
    id: 1,
    title: 'Salary',
    amount: 3500,
    type: 'income',
    category: 'Salary',
    date: '2026-10-01'
  },
  {
    id: 2,
    title: 'Shopping',
    amount: 200,
    type: 'expense',
    category: 'Shopping',
    date: '2026-10-05'
  },
  {
    id: 3,
    title: 'Transport',
    amount: 100,
    type: 'expense',
    category: 'Transport',
    date: '2026-10-10'
  }
];

function loadTransactions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return defaultTransactions;
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return defaultTransactions;
    }

    const validTransactions = parsed
      .filter(item =>
        item &&
        typeof (item.title ?? item.name) === 'string' &&
        Number.isFinite(Number(item.amount)) &&
        Number(item.amount) >= 0
      )
      .map((item, index) => ({
        id: item.id ?? Date.now() + index,
        title: String(item.title ?? item.name).trim(),
        amount: Math.round(Number(item.amount) * 100) / 100,
        type: item.type === 'expense' ? 'expense' : 'income',
        category: item.category || 'Other',
        date: item.date || today()
      }))
      .filter(item => item.title.length > 0);

    // Merge duplicate names with the same transaction type.
    const merged = new Map();

    validTransactions.forEach(item => {
      const key = `${normalizeName(item.title)}_${item.type}`;

      if (merged.has(key)) {
        const existing = merged.get(key);

        existing.amount = Math.round(
          (existing.amount + item.amount) * 100
        ) / 100;

        if (item.date > existing.date) {
          existing.date = item.date;
        }
      } else {
        merged.set(key, { ...item });
      }
    });

    return Array.from(merged.values());

  } catch (error) {
    console.error('Loading transactions failed:', error);
    return defaultTransactions;
  }
}

/* =========================================
   MAIN APP
   ========================================= */

function App() {

  /* ---------------------------------------
     STATE
     --------------------------------------- */

  const [transactions, setTransactions] = useState(loadTransactions);

  const [language, setLanguage] = useState(
    () => localStorage.getItem(LANGUAGE_KEY) || 'en'
  );

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');
  const [category, setCategory] = useState('Salary');
  const [date, setDate] = useState(today());

  const [editingId, setEditingId] = useState(null);

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const [selectedMonth, setSelectedMonth] = useState(
    today().slice(0, 7)
  );

  const [reportType, setReportType] = useState('all');

  // Monthly budgets.
  const [budgets, setBudgets] = useState(
    () => readStored(BUDGETS_KEY, {})
  );

  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetCategory, setBudgetCategory] = useState('');
  const [categoryBudgetAmount, setCategoryBudgetAmount] = useState('');

  // Savings goals.
  const [goals, setGoals] = useState(
    () => readStored(GOALS_KEY, [])
  );

  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');

  const fileInputRef = useRef(null);

  const t = translations[language] || translations.en;
  const isArabic = language === 'ar';

  const categoryLabel = name =>
    t[normalizeName(name)] || name;

  /* ---------------------------------------
     SAVE DATA
     --------------------------------------- */

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(transactions)
    );
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(
      BUDGETS_KEY,
      JSON.stringify(budgets)
    );
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem(
      GOALS_KEY,
      JSON.stringify(goals)
    );
  }, [goals]);

  /* ---------------------------------------
     FINANCIAL TOTALS
     --------------------------------------- */

  const totalIncome = useMemo(
    () => transactions
      .filter(item => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0),
    [transactions]
  );

  const totalExpenses = useMemo(
    () => transactions
      .filter(item => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0),
    [transactions]
  );

  const balance = Math.round(
    (totalIncome - totalExpenses) * 100
  ) / 100;

  const savingsRate = totalIncome > 0
    ? (balance / totalIncome) * 100
    : 0;

  const savingsProgress = Math.max(
    0,
    Math.min(100, savingsRate)
  );

  const maxFinancialValue = Math.max(
    totalIncome,
    totalExpenses,
    1
  );

  const incomeProgress =
    (totalIncome / maxFinancialValue) * 100;

  const expenseProgress =
    (totalExpenses / maxFinancialValue) * 100;

  /* ---------------------------------------
     EXPENSE BREAKDOWN
     --------------------------------------- */

  const expenseBreakdown = useMemo(() => {
    const grouped = {};

    transactions
      .filter(item => item.type === 'expense')
      .forEach(item => {
        grouped[item.category] =
          (grouped[item.category] || 0) + item.amount;
      });

    return Object.entries(grouped)
      .map(([name, value]) => ({
        name,
        value,
        percentage: totalExpenses > 0
          ? (value / totalExpenses) * 100
          : 0
      }))
      .sort((a, b) => b.value - a.value);

  }, [transactions, totalExpenses]);

  /* ---------------------------------------
     MONTHLY REPORTS
     --------------------------------------- */

  const availableMonths = useMemo(() => {
    const monthSet = new Set(
      transactions
        .filter(item => /^\d{4}-\d{2}/.test(item.date))
        .map(item => item.date.slice(0, 7))
    );

    monthSet.add(today().slice(0, 7));

    return Array.from(monthSet).sort(
      (a, b) => b.localeCompare(a)
    );
  }, [transactions]);

  const selectedMonthTransactions = useMemo(
    () => transactions.filter(
      item => item.date?.slice(0, 7) === selectedMonth
    ),
    [transactions, selectedMonth]
  );

  const monthlyTransactions = useMemo(() => {
    return selectedMonthTransactions
      .filter(item =>
        reportType === 'all' || item.type === reportType
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [selectedMonthTransactions, reportType]);

  const monthlyIncome = selectedMonthTransactions
    .filter(item => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);

  const monthlyExpenses = selectedMonthTransactions
    .filter(item => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);

  const monthlyNet = monthlyIncome - monthlyExpenses;

  const sixMonthTrend = useMemo(() => {
    const months = [];
    const [year, month] = selectedMonth.split('-').map(Number);

    const anchor = new Date(year, month - 1, 1);

    for (let offset = 5; offset >= 0; offset--) {
      const monthDate = new Date(
        anchor.getFullYear(),
        anchor.getMonth() - offset,
        1
      );

      const key =
        `${monthDate.getFullYear()}-${String(
          monthDate.getMonth() + 1
        ).padStart(2, '0')}`;

      const monthItems = transactions.filter(
        item => item.date?.slice(0, 7) === key
      );

      const income = monthItems
        .filter(item => item.type === 'income')
        .reduce((sum, item) => sum + item.amount, 0);

      const expenses = monthItems
        .filter(item => item.type === 'expense')
        .reduce((sum, item) => sum + item.amount, 0);

      months.push({
        key,
        label: monthDate.toLocaleDateString(
          language === 'ar' ? 'ar' : 'en-US',
          { month: 'short', year: '2-digit' }
        ),
        income,
        expenses
      });
    }

    return months;

  }, [transactions, selectedMonth, language]);

  const trendMax = Math.max(
    1,
    ...sixMonthTrend.map(item =>
      Math.max(item.income, item.expenses)
    )
  );

  /* ---------------------------------------
     MONTHLY BUDGET CALCULATIONS
     --------------------------------------- */

  const currentBudget = Number(
    budgets[selectedMonth]?.total || 0
  );

  const categoryBudgets =
    budgets[selectedMonth]?.categories || {};

  const spentByCategory = selectedMonthTransactions
    .filter(item => item.type === 'expense')
    .reduce((result, item) => {
      result[item.category] =
        (result[item.category] || 0) + item.amount;

      return result;
    }, {});

  const monthlyBudgetPercentage = currentBudget > 0
    ? (monthlyExpenses / currentBudget) * 100
    : 0;

  const budgetAlerts = [];

  if (currentBudget > 0 && monthlyBudgetPercentage >= 80) {
    budgetAlerts.push({
      name: isArabic ? 'الميزانية الشهرية' : 'Monthly budget',
      ratio: monthlyBudgetPercentage / 100,
      spent: monthlyExpenses,
      limit: currentBudget
    });
  }

  Object.entries(categoryBudgets).forEach(([name, limit]) => {
    const spent = spentByCategory[name] || 0;
    const ratio = Number(limit) > 0
      ? spent / Number(limit)
      : 0;

    if (Number(limit) > 0 && ratio >= 0.8) {
      budgetAlerts.push({
        name: categoryLabel(name),
        ratio,
        spent,
        limit: Number(limit)
      });
    }
  });

  /* =========================================
     TRANSACTION FUNCTIONS
     ========================================= */

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setType('income');
    setCategory('Salary');
    setDate(today());
    setEditingId(null);
  };

  const handleTypeChange = newType => {
    setType(newType);
    setCategory(
      newType === 'income' ? 'Salary' : 'Other'
    );
    setMessage('');
  };

  const handleSubmit = event => {
    event.preventDefault();

    const cleanTitle = title.trim();
    const numericAmount = Number(amount);

    if (
      !cleanTitle ||
      amount.trim() === '' ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      !date
    ) {
      setMessage(t.invalid);
      setMessageType('error');
      return;
    }

    const duplicate = transactions.find(item =>
      normalizeName(item.title) === normalizeName(cleanTitle) &&
      item.type === type &&
      String(item.id) !== String(editingId)
    );

    if (duplicate) {
      setMessage(t.duplicate);
      setMessageType('error');
      return;
    }

    const roundedAmount =
      Math.round(numericAmount * 100) / 100;

    if (editingId !== null) {
      setTransactions(previous =>
        previous.map(item =>
          String(item.id) === String(editingId)
            ? {
                ...item,
                title: cleanTitle,
                amount: roundedAmount,
                type,
                category,
                date
              }
            : item
        )
      );

      setMessage(t.updated);

    } else {
      setTransactions(previous => [
        {
          id: Date.now(),
          title: cleanTitle,
          amount: roundedAmount,
          type,
          category,
          date
        },
        ...previous
      ]);

      setMessage(t.added);
    }

    setMessageType('success');
    resetForm();
  };

  const handleEdit = item => {
    setEditingId(item.id);
    setTitle(item.title);
    setAmount(String(item.amount));
    setType(item.type);

    setCategory(
      categories[item.type].includes(item.category)
        ? item.category
        : 'Other'
    );

    setDate(item.date || today());
    setMessage('');

    document.querySelector('.transactions-section')
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
  };

  const handleAddAmount = item => {
    const enteredAmount = window.prompt(
      isArabic
        ? `أدخلي المبلغ الإضافي لإضافته إلى ${item.title}:`
        : `Enter the additional amount for ${item.title}:`
    );

    if (enteredAmount === null) return;

    const value = Number(enteredAmount);

    if (!Number.isFinite(value) || value <= 0) {
      setMessage(t.invalid);
      setMessageType('error');
      return;
    }

    setTransactions(previous =>
      previous.map(transaction =>
        transaction.id === item.id
          ? {
              ...transaction,
              amount: Math.round(
                (transaction.amount + value) * 100
              ) / 100
            }
          : transaction
      )
    );

    setMessage(
      isArabic
        ? 'تمت إضافة المبلغ إلى المعاملة بنجاح!'
        : 'Amount added successfully!'
    );

    setMessageType('success');
  };

  const handleDelete = id => {
    if (!window.confirm(t.confirmDelete)) return;

    setTransactions(previous =>
      previous.filter(item => item.id !== id)
    );

    if (String(editingId) === String(id)) {
      resetForm();
    }

    setMessage(t.deleted);
    setMessageType('success');
  };

  /* =========================================
     MONTHLY BUDGET FUNCTIONS
     ========================================= */

  const saveMonthlyBudget = event => {
    event.preventDefault();

    const value = Number(budgetAmount);

    if (!Number.isFinite(value) || value <= 0) {
      return;
    }

    setBudgets(previous => ({
      ...previous,
      [selectedMonth]: {
        ...(previous[selectedMonth] || {}),
        total: value,
        categories:
          previous[selectedMonth]?.categories || {}
      }
    }));

    setBudgetAmount('');
  };

  const saveCategoryBudget = event => {
    event.preventDefault();

    const value = Number(categoryBudgetAmount);

    if (
      !budgetCategory ||
      !Number.isFinite(value) ||
      value <= 0
    ) {
      return;
    }

    setBudgets(previous => ({
      ...previous,
      [selectedMonth]: {
        ...(previous[selectedMonth] || {}),
        categories: {
          ...(previous[selectedMonth]?.categories || {}),
          [budgetCategory]: value
        }
      }
    }));

    setCategoryBudgetAmount('');
  };

  const deleteCategoryBudget = name => {
    setBudgets(previous => {
      const updated = { ...previous };
      const monthData = { ...(updated[selectedMonth] || {}) };
      const updatedCategories = {
        ...(monthData.categories || {})
      };

      delete updatedCategories[name];

      monthData.categories = updatedCategories;
      updated[selectedMonth] = monthData;

      return updated;
    });
  };

  /* =========================================
     SAVINGS GOALS
     ========================================= */

  const addGoal = event => {
    event.preventDefault();

    const target = Number(goalTarget);

    if (
      !goalName.trim() ||
      !Number.isFinite(target) ||
      target <= 0
    ) {
      return;
    }

    setGoals(previous => [
      ...previous,
      {
        id: Date.now(),
        name: goalName.trim(),
        target,
        saved: 0,
        createdAt: today()
      }
    ]);

    setGoalName('');
    setGoalTarget('');
  };

  const contributeToGoal = goal => {
    const raw = window.prompt(
      isArabic
        ? `كم تريدين إضافته إلى هدف ${goal.name}؟`
        : `How much would you like to add to ${goal.name}?`
    );

    if (raw === null) return;

    const value = Number(raw);

    if (!Number.isFinite(value) || value <= 0) {
      return;
    }

    setGoals(previous =>
      previous.map(item =>
        item.id === goal.id
          ? {
              ...item,
              saved: Math.min(
                item.target,
                item.saved + value
              )
            }
          : item
      )
    );
  };

  const deleteGoal = id => {
    if (!window.confirm(
      isArabic
        ? 'هل تريد حذف هدف الادخار؟'
        : 'Delete this savings goal?'
    )) {
      return;
    }

    setGoals(previous =>
      previous.filter(goal => goal.id !== id)
    );
  };

  /* =========================================
     EXPORT AND BACKUP
     ========================================= */

  const exportCSV = () => {
    const rows = [
      ['Date', 'Name', 'Type', 'Category', 'Amount (USD)'],
      ...transactions.map(item => [
        item.date,
        item.title,
        item.type,
        item.category,
        item.amount
      ])
    ];

    const csv = '\uFEFF' + rows
      .map(row =>
        row.map(value =>
          `"${String(value ?? '').replace(/"/g, '""')}"`
        ).join(',')
      )
      .join('\r\n');

    const blob = new Blob(
      [csv],
      { type: 'text/csv;charset=utf-8;' }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `money-builder-${today()}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
  };

  const handleExport = () => {
    const backup = {
      application: 'Money Builder',
      version: 2,
      currency: 'USD',
      exportedAt: new Date().toISOString(),
      transactions,
      budgets,
      goals
    };

    const blob = new Blob(
      [JSON.stringify(backup, null, 2)],
      { type: 'application/json' }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `money-builder-backup-${today()}.json`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const handleRestore = event => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = e => {
      try {
        const backup = JSON.parse(e.target.result);

        const imported = Array.isArray(backup)
          ? backup
          : backup.transactions;

        if (
          !Array.isArray(imported) ||
          imported.some(item =>
            !item ||
            typeof (item.title ?? item.name) !== 'string' ||
            !Number.isFinite(Number(item.amount)) ||
            Number(item.amount) < 0 ||
            !['income', 'expense'].includes(item.type)
          )
        ) {
          throw new Error('Invalid backup');
        }

        const restored = imported
          .map((item, index) => ({
            id: item.id ?? Date.now() + index,
            title: String(item.title ?? item.name).trim(),
            amount: Math.round(Number(item.amount) * 100) / 100,
            type: item.type,
            category: item.category || 'Other',
            date: item.date || today()
          }))
          .filter(item => item.title.length > 0);

        const merged = new Map();

        restored.forEach(item => {
          const key =
            `${normalizeName(item.title)}_${item.type}`;

          if (merged.has(key)) {
            const existing = merged.get(key);

            existing.amount = Math.round(
              (existing.amount + item.amount) * 100
            ) / 100;
          } else {
            merged.set(key, { ...item });
          }
        });

        setTransactions(Array.from(merged.values()));

        if (!Array.isArray(backup)) {
          if (
            backup.budgets &&
            typeof backup.budgets === 'object'
          ) {
            setBudgets(backup.budgets);
          }

          if (Array.isArray(backup.goals)) {
            setGoals(backup.goals);
          }
        }

        resetForm();
        setMessage(t.restored);
        setMessageType('success');

      } catch (error) {
        console.error('Restore failed:', error);
        setMessage(t.backupError);
        setMessageType('error');
      }

      event.target.value = '';
    };

    reader.onerror = () => {
      setMessage(t.backupError);
      setMessageType('error');
      event.target.value = '';
    };

    reader.readAsText(file);
  };

  /* =========================================
     CHART GRADIENT
     ========================================= */

  let chartPosition = 0;

  const chartGradient = expenseBreakdown.length
    ? `conic-gradient(${expenseBreakdown.map((item, index) => {
        const start = chartPosition;
        chartPosition += item.percentage;

        return `${chartColors[index % chartColors.length]} ${start}% ${chartPosition}%`;
      }).join(', ')})`
    : '#e2e8f0';

  /* =========================================
     RENDER
     ========================================= */

  return (
    <div
      className={`app ${isArabic ? 'rtl' : 'ltr'}`}
      dir={isArabic ? 'rtl' : 'ltr'}
    >

      {/* HEADER */}

      <header className="header">
        <div>
          <h1>Money Builder</h1>
          <p>{t.subtitle}</p>
        </div>

        <div className="header-actions">
          <button
            className="language-button"
            type="button"
            onClick={() =>
              setLanguage(language === 'en' ? 'ar' : 'en')
            }
          >
            {t.language}
          </button>

          <span>{t.account}</span>
        </div>
      </header>

      {/* DASHBOARD */}

      <section className="dashboard">

        <div className="card balance">
          <h3>{t.balance}</h3>
          <h2>{formatMoney(balance)}</h2>
          <p>{t.balanceDescription}</p>
        </div>

        <div className="card income">
          <h3>{t.income}</h3>
          <h2>{formatMoney(totalIncome)}</h2>
        </div>

        <div className="card expenses">
          <h3>{t.expenses}</h3>
          <h2>{formatMoney(totalExpenses)}</h2>
        </div>

      </section>

      {/* FINANCIAL OVERVIEW */}

      <section className="panel overview-section">
        <h2>{t.overview}</h2>

        <div className="progress-item">
          <div className="progress-label">
            <span>{t.income}</span>
            <strong className="positive">
              {formatMoney(totalIncome)}
            </strong>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill income-fill"
              style={{ width: `${incomeProgress}%` }}
            />
          </div>
        </div>

        <div className="progress-item">
          <div className="progress-label">
            <span>{t.expenses}</span>
            <strong className="negative">
              {formatMoney(totalExpenses)}
            </strong>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill expense-fill"
              style={{ width: `${expenseProgress}%` }}
            />
          </div>
        </div>
      </section>

      {/* SAVINGS RATE */}

      <section className="panel savings-section">
        <div className="savings-header">
          <div>
            <h2>{t.savings}</h2>
            <p>{t.savingsDescription}</p>
          </div>

          <strong className="savings-percentage">
            {savingsRate.toFixed(1)}%
          </strong>
        </div>

        <div className="progress-track savings-track">
          <div
            className="progress-fill savings-fill"
            style={{ width: `${savingsProgress}%` }}
          />
        </div>

        <p className="savings-message">
          {balance < 0
            ? t.savingsNegative
            : savingsRate < 20
              ? t.savingsLow
              : t.savingsGood}
        </p>
      </section>

      {/* MONTHLY REPORTS */}

      <section className="panel monthly-reports-section">

        <div className="monthly-report-heading">
          <div>
            <h2>{t.monthlyReports}</h2>
            <p>{t.monthlyReportsDescription}</p>
          </div>

          <div className="monthly-report-filters">

            <label>
              <span>{t.selectMonth}</span>

              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
              >
                {availableMonths.map(month => (
                  <option value={month} key={month}>
                    {new Date(`${month}-01T12:00:00`)
                      .toLocaleDateString(
                        language === 'ar' ? 'ar' : 'en-US',
                        {
                          month: 'long',
                          year: 'numeric'
                        }
                      )}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>{t.category}</span>

              <select
                value={reportType}
                onChange={e => setReportType(e.target.value)}
              >
                <option value="all">{t.allTypes}</option>
                <option value="income">{t.incomeOption}</option>
                <option value="expense">{t.expenseOption}</option>
              </select>
            </label>

          </div>
        </div>

        <div className="monthly-summary-grid">

          <div className="monthly-summary-card monthly-income-card">
            <span>{t.monthlyIncome}</span>
            <strong>{formatMoney(monthlyIncome)}</strong>
          </div>

          <div className="monthly-summary-card monthly-expense-card">
            <span>{t.monthlyExpenses}</span>
            <strong>{formatMoney(monthlyExpenses)}</strong>
          </div>

          <div className="monthly-summary-card monthly-net-card">
            <span>{t.monthlyNet}</span>

            <strong className={
              monthlyNet >= 0 ? 'positive' : 'negative'
            }>
              {formatMoney(monthlyNet)}
            </strong>
          </div>

          <div className="monthly-summary-card monthly-count-card">
            <span>{t.monthlyCount}</span>
            <strong>{selectedMonthTransactions.length}</strong>
          </div>

        </div>

        <h3 className="monthly-trend-title">
          {t.monthlyTrend}
        </h3>

        <div className="monthly-trend-chart">

          {sixMonthTrend.map(item => (
            <div className="trend-month" key={item.key}>

              <div className="trend-bars">

                <div
                  className="trend-bar income-trend-bar"
                  style={{
                    height: `${
                      item.income > 0
                        ? Math.max(4, item.income / trendMax * 150)
                        : 0
                    }px`
                  }}
                  title={`${t.incomeOption}: ${formatMoney(item.income)}`}
                />

                <div
                  className="trend-bar expense-trend-bar"
                  style={{
                    height: `${
                      item.expenses > 0
                        ? Math.max(4, item.expenses / trendMax * 150)
                        : 0
                    }px`
                  }}
                  title={`${t.expenseOption}: ${formatMoney(item.expenses)}`}
                />

              </div>

              <span>{item.label}</span>
            </div>
          ))}

        </div>

        <div className="trend-legend">
          <span>
            <i className="trend-legend-income" />
            {t.incomeLabel}
          </span>

          <span>
            <i className="trend-legend-expense" />
            {t.expenseLabel}
          </span>
        </div>

        <div className="monthly-transactions-heading">
          <h3>{t.recent}</h3>
          <span>
            {monthlyTransactions.length} {t.transactionCount}
          </span>
        </div>

        {monthlyTransactions.length === 0 ? (
          <p className="empty-message">
            {t.noMonthlyTransactions}
          </p>
        ) : (
          <div className="transaction-list">

            {monthlyTransactions.map(item => (
              <div
                className="transaction"
                key={`monthly-${item.id}`}
              >
                <div className="transaction-info">
                  <strong>{item.title}</strong>
                  <span>{categoryLabel(item.category)}</span>
                  <small>{item.date}</small>
                </div>

                <div className="transaction-actions">
                  <strong className={
                    item.type === 'income' ? 'positive' : 'negative'
                  }>
                    {item.type === 'income' ? '+' : '-'}
                    {formatMoney(item.amount)}
                  </strong>

                  <button
                    type="button"
                    className="edit-button"
                    onClick={() => handleEdit(item)}
                  >
                    {t.edit}
                  </button>
                </div>
              </div>
            ))}

          </div>
        )}

      </section>

      {/* MONTHLY BUDGET */}

      <section className="panel budget-section">

        <div className="section-heading">
          <div>
            <h2>
              {isArabic ? 'الميزانية الشهرية' : 'Monthly Budget'}
            </h2>

            <p>
              {isArabic
                ? 'حددي ميزانية الشهر وراقبي الإنفاق.'
                : 'Set a monthly spending limit and monitor your expenses.'}
            </p>
          </div>
        </div>

        <form
          className="budget-form-grid"
          onSubmit={saveMonthlyBudget}
        >

          <label>
            <span>
              {isArabic
                ? 'ميزانية الشهر (USD)'
                : 'Monthly budget (USD)'}
            </span>

            <input
              type="number"
              min="0.01"
              step="0.01"
              value={budgetAmount}
              onChange={e => setBudgetAmount(e.target.value)}
              placeholder="e.g. 2000"
              required
            />
          </label>

          <div>
            <button className="primary-button" type="submit">
              {isArabic ? 'حفظ الميزانية' : 'Save Budget'}
            </button>
          </div>

        </form>

        {currentBudget > 0 ? (

          <div className="budget-progress-card">

            <div className="budget-line-heading">
              <strong>
                {isArabic
                  ? 'الميزانية الإجمالية'
                  : 'Total monthly budget'}
              </strong>

              <span>
                {formatMoney(monthlyExpenses)} / {formatMoney(currentBudget)}
              </span>
            </div>

            <div className="progress-track">
              <div
                className={`progress-fill budget-fill ${
                  monthlyExpenses > currentBudget
                    ? 'budget-over-fill'
                    : ''
                }`}
                style={{
                  width: `${Math.min(100, monthlyBudgetPercentage)}%`
                }}
              />
            </div>

            <div className="budget-stats">
              <span>
                {isArabic ? 'المتبقي:' : 'Remaining:'}{' '}
                {formatMoney(currentBudget - monthlyExpenses)}
              </span>

              <span>
                {Math.round(monthlyBudgetPercentage)}%
              </span>
            </div>

          </div>

        ) : (

          <p className="empty-message">
            {isArabic
              ? 'لم يتم تحديد ميزانية لهذا الشهر بعد.'
              : 'No monthly budget set for this month yet.'}
          </p>

        )}

        <h3>
          {isArabic ? 'ميزانيات الفئات' : 'Category Budgets'}
        </h3>

        <form
          className="budget-form-grid"
          onSubmit={saveCategoryBudget}
        >

          <label>
            <span>{isArabic ? 'الفئة' : 'Expense category'}</span>

            <select
              value={budgetCategory}
              onChange={e => setBudgetCategory(e.target.value)}
              required
            >
              <option value="">
                {isArabic ? 'اختاري الفئة' : 'Choose category'}
              </option>

              {categories.expense.map(item => (
                <option value={item} key={item}>
                  {categoryLabel(item)}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>
              {isArabic
                ? 'حد الميزانية (USD)'
                : 'Budget limit (USD)'}
            </span>

            <input
              type="number"
              min="0.01"
              step="0.01"
              value={categoryBudgetAmount}
              onChange={e => setCategoryBudgetAmount(e.target.value)}
              required
            />
          </label>

          <div>
            <button className="primary-button" type="submit">
              {isArabic
                ? 'حفظ ميزانية الفئة'
                : 'Save Category Budget'}
            </button>
          </div>

        </form>

        <div className="category-budget-list">

          {Object.entries(categoryBudgets).map(([name, limit]) => {

            const spent = spentByCategory[name] || 0;
            const percentage = Number(limit) > 0
              ? (spent / Number(limit)) * 100
              : 0;

            return (
              <div
                className="category-budget-item"
                key={name}
              >

                <div className="budget-line-heading">
                  <strong>{categoryLabel(name)}</strong>

                  <span>
                    {formatMoney(spent)} / {formatMoney(Number(limit))}
                  </span>
                </div>

                <div className="progress-track">
                  <div
                    className={`progress-fill budget-fill ${
                      percentage > 100
                        ? 'budget-over-fill'
                        : ''
                    }`}
                    style={{
                      width: `${Math.min(100, percentage)}%`
                    }}
                  />
                </div>

                <small>
                  {Math.round(percentage)}%
                  {' '}
                  {isArabic
                    ? 'من الميزانية المستخدمة'
                    : 'used'}
                </small>

                <button
                  type="button"
                  className="delete-button"
                  onClick={() => deleteCategoryBudget(name)}
                >
                  {t.delete}
                </button>

              </div>
            );
          })}

        </div>

        {/* BUDGET ALERTS */}

        <div className="budget-alerts">

          <h3>
            {isArabic ? 'تنبيهات الميزانية' : 'Budget Alerts'}
          </h3>

          {budgetAlerts.length === 0 ? (

            <p className="no-alerts">
              {isArabic
                ? 'لا توجد تنبيهات. إنفاقك ضمن الحدود المحددة.'
                : 'No alerts. Spending is within your budget limits.'}
            </p>

          ) : (

            budgetAlerts.map((alert, index) => (
              <div
                className={`budget-alert ${
                  alert.ratio >= 1
                    ? 'alert-danger'
                    : 'alert-warning'
                }`}
                key={`${alert.name}-${index}`}
              >

                <span>
                  {alert.ratio >= 1
                    ? (
                      isArabic
                        ? 'تم تجاوز الميزانية:'
                        : 'Budget exceeded:'
                    )
                    : (
                      isArabic
                        ? 'تنبيه: وصلت إلى 80% من الميزانية:'
                        : 'Warning: 80% of budget reached:'
                    )}

                  {' '}{alert.name}
                </span>

                <small>
                  {formatMoney(alert.spent)}
                  {' / '}
                  {formatMoney(alert.limit)}
                  {' '}
                  ({Math.round(alert.ratio * 100)}%)
                </small>

              </div>
            ))

          )}

        </div>

      </section>

      {/* SAVINGS GOALS */}

      <section className="panel goals-section">

        <h2>
          {isArabic ? 'أهداف الادخار' : 'Savings Goals'}
        </h2>

        <p>
          {isArabic
            ? 'أنشئي أهدافاً وتابعي تقدمك نحو تحقيقها.'
            : 'Create savings targets and track your progress.'}
        </p>

        <form className="goal-form" onSubmit={addGoal}>

          <input
            type="text"
            value={goalName}
            onChange={e => setGoalName(e.target.value)}
            placeholder={
              isArabic ? 'اسم الهدف' : 'Goal name'
            }
            required
          />

          <input
            type="number"
            min="0.01"
            step="0.01"
            value={goalTarget}
            onChange={e => setGoalTarget(e.target.value)}
            placeholder={
              isArabic
                ? 'المبلغ المستهدف (USD)'
                : 'Target amount (USD)'
            }
            required
          />

          <button className="primary-button" type="submit">
            {isArabic ? 'إنشاء هدف' : 'Create Goal'}
          </button>

        </form>

        {goals.length === 0 ? (

          <p className="empty-message">
            {isArabic
              ? 'لم تنشئي أهداف ادخار بعد.'
              : 'No savings goals yet.'}
          </p>

        ) : (

          <div className="goals-grid">

            {goals.map(goal => {

              const percentage = goal.target > 0
                ? Math.min(100, goal.saved / goal.target * 100)
                : 0;

              return (
                <article
                  className="goal-card"
                  key={goal.id}
                >

                  <div className="goal-card-heading">

                    <h3>{goal.name}</h3>

                    {percentage >= 100 && (
                      <span className="goal-complete">
                        {isArabic ? 'مكتمل' : 'Completed'}
                      </span>
                    )}

                  </div>

                  <div className="goal-amounts">
                    <strong>{formatMoney(goal.saved)}</strong>

                    <span>
                      {isArabic ? 'من' : 'of'}
                      {' '}
                      {formatMoney(goal.target)}
                    </span>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill goal-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="goal-progress-footer">
                    <span>
                      {Math.round(percentage)}%
                      {' '}
                      {isArabic ? 'مكتمل' : 'completed'}
                    </span>

                    <span>
                      {formatMoney(
                        Math.max(0, goal.target - goal.saved)
                      )}
                      {' '}
                      {isArabic ? 'متبقي' : 'remaining'}
                    </span>
                  </div>

                  <div className="goal-actions">

                    <button
                      type="button"
                      className="edit-button"
                      onClick={() => contributeToGoal(goal)}
                    >
                      {isArabic
                        ? 'إضافة ادخار'
                        : 'Add Savings'}
                    </button>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => deleteGoal(goal.id)}
                    >
                      {t.delete}
                    </button>

                  </div>

                </article>
              );
            })}

          </div>

        )}

      </section>

      {/* EXPENSE BREAKDOWN */}

      <section className="panel breakdown-section">

        <h2>{t.breakdown}</h2>
        <p>{t.breakdownDescription}</p>

        {expenseBreakdown.length === 0 ? (

          <p className="empty-message">
            {t.noExpenses}
          </p>

        ) : (

          <div className="breakdown-content">

            <div
              className="donut-chart"
              style={{ background: chartGradient }}
            >
              <div className="donut-center">
                <span>{t.expenses}</span>
                <strong>{formatMoney(totalExpenses)}</strong>
              </div>
            </div>

            <div className="breakdown-legend">

              {expenseBreakdown.map((item, index) => (
                <div className="legend-item" key={item.name}>

                  <div className="legend-name">

                    <span
                      className="legend-dot"
                      style={{
                        backgroundColor:
                          chartColors[index % chartColors.length]
                      }}
                    />

                    <span>{categoryLabel(item.name)}</span>

                  </div>

                  <div className="legend-value">
                    <strong>{formatMoney(item.value)}</strong>
                    <span>{item.percentage.toFixed(1)}%</span>
                  </div>

                </div>
              ))}

            </div>

          </div>

        )}

      </section>

      {/* ADD / EDIT TRANSACTION */}

      <section className="panel transactions-section">

        <h2>
          {editingId !== null
            ? t.editTransaction
            : t.addTransaction}
        </h2>

        <form
          className="transaction-form"
          onSubmit={handleSubmit}
        >

          <input
            type="text"
            placeholder={t.transactionName}
            value={title}
            onChange={e => {
              setTitle(e.target.value);
              setMessage('');
            }}
            required
          />

          <input
            type="number"
            placeholder={t.amount}
            min="0.01"
            step="0.01"
            value={amount}
            onChange={e => {
              setAmount(e.target.value);
              setMessage('');
            }}
            required
          />

          <select
            value={type}
            onChange={e => handleTypeChange(e.target.value)}
          >
            <option value="income">{t.incomeOption}</option>
            <option value="expense">{t.expenseOption}</option>
          </select>

          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            {categories[type].map(item => (
              <option value={item} key={item}>
                {categoryLabel(item)}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={date}
            max={today()}
            onChange={e => setDate(e.target.value)}
            required
          />

          <button
            type="submit"
            className="primary-button"
          >
            {editingId !== null ? t.update : t.add}
          </button>

          {editingId !== null && (
            <button
              type="button"
              className="cancel-button"
              onClick={resetForm}
            >
              {t.cancel}
            </button>
          )}

        </form>

        {message && (
          <div
            className={`message ${messageType}`}
            role="status"
          >
            {message}
          </div>
        )}

        {/* RECENT TRANSACTIONS */}

        <div className="recent-header">
          <h2>{t.recent}</h2>

          <span>
            {transactions.length} {t.transactionCount}
          </span>
        </div>

        {transactions.length === 0 ? (

          <p className="empty-message">
            {t.noTransactions}
          </p>

        ) : (

          <div className="transaction-list">

            {transactions.map(item => (
              <div className="transaction" key={item.id}>

                <div className="transaction-info">
                  <strong>{item.title}</strong>
                  <span>{categoryLabel(item.category)}</span>
                  <small>{item.date}</small>
                </div>

                <div className="transaction-actions">

                  <strong className={
                    item.type === 'income'
                      ? 'positive'
                      : 'negative'
                  }>
                    {item.type === 'income' ? '+' : '-'}
                    {formatMoney(item.amount)}
                  </strong>

                  <button
                    type="button"
                    className="edit-button"
                    onClick={() => handleEdit(item)}
                  >
                    {t.edit}
                  </button>

                  <button
                    type="button"
                    className="restore-button"
                    onClick={() => handleAddAmount(item)}
                  >
                    {isArabic ? 'إضافة مبلغ' : 'Add Amount'}
                  </button>

                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => handleDelete(item.id)}
                  >
                    {t.delete}
                  </button>

                </div>

              </div>
            ))}

          </div>

        )}

      </section>

      {/* BACKUP AND DATA MANAGEMENT */}

      <section className="panel backup-section">

        <h2>{t.backup}</h2>
        <p>{t.backupDescription}</p>

        <div className="backup-actions">

          <button
            type="button"
            className="primary-button"
            onClick={printReport}
          >
            {isArabic
              ? 'طباعة التقرير / PDF'
              : 'Print Report / PDF'}
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={exportCSV}
          >
            {isArabic
              ? 'تصدير Excel (CSV)'
              : 'Export Excel (CSV)'}
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={handleExport}
          >
            {t.export}
          </button>

          <button
            type="button"
            className="restore-button"
            onClick={() => fileInputRef.current?.click()}
          >
            {t.restore}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={handleRestore}
          />

        </div>

      </section>

      {/* FOOTER */}

      <footer className="footer">
        Money Builder © {new Date().getFullYear()} | USD
      </footer>

    </div>
  );
}

export default App;

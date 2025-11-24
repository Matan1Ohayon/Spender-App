// insightsMockData.ts

// 🧠 Insight of the Week
export const weeklyStats = {
  thisWeek: 450,
  lastWeek: 520,
  unnecessaryThisWeek: 4,       // ← מתוך daily
  unnecessaryLastWeek: 6,       // ← mock number
  categoriesThisWeek: {
    Groceries: 250,
    Shopping: 400,
    Delivery: 120,
  },
  categoriesLastWeek: {
    Groceries: 350,
    Shopping: 420,
    Delivery: 190,
  }
};
// 📊 Graphs & Comparisons
export const graphsData = {
  pie: {
    good: 80,
    unnecessary: 20,
  },
  bar: [
    { label: "Groceries", value: 64 },
    { label: "Deliveries", value: 81 },
    { label: "Shopping", value: 79 },
  ],
  comparisons: [
    { label: "Groceries", amount: "+ $32" },
    { label: "Deliveries", amount: "– $25" },
    { label: "Shopping", amount: "+ $18" },
  ],
};

// 📝 MOCK EXPENSE DATA (Used for Spending Patterns)
import { Expense } from "@/logic/patternEngine";

export const expenses: Expense[] = [
  // Friday – heavy unnecessary spending
  { id: 1, amount: 22, type: "waste", category: "Delivery", date: "2025-11-23", payment: "card", note: "HEY" },
  { id: 2, amount: 19, type: "waste", category: "Movies", date: "2025-11-22", payment: "cash" },
  { id: 3, amount: 12, type: "waste", category: "Food", date: "2025-11-07", payment: "bit" },

  // Thursday
  { id: 4, amount: 14, type: "good", category: "Groceries", date: "2025-02-06", payment: "card" },

  // Weekend pattern (Saturday + Sunday)
  { id: 5, amount: 18, type: "waste", category: "Food", date: "2025-02-01", payment: "bit" },
  { id: 6, amount: 27, type: "waste", category: "Delivery", date: "2025-02-02", payment: "card" },

  // Category pattern (many deliveries)
  { id: 7, amount: 24, type: "waste", category: "Delivery", date: "2025-02-04", payment: "card" },
  { id: 8, amount: 21, type: "waste", category: "Delivery", date: "2025-02-05", payment: "cash" },
];

// 🏅 DATA FOR Achievements Engine
export const mockUserData = {
  daily: [
    { date: "2025-02-01", necessary: 3, unnecessary: 0, total: 3 },
    { date: "2025-02-02", necessary: 2, unnecessary: 0, total: 2 },
    { date: "2025-02-03", necessary: 5, unnecessary: 0, total: 5 },
    { date: "2025-02-04", necessary: 2, unnecessary: 1, total: 3 },
  ],

  weekly: {
    thisWeek: 450,
    lastWeek: 520,
    necessaryPercent: 62,
  },

  monthly: {
    thisMonth: 1900,
    lastMonth: 2100,
    budget: 2000,
  },

  categories: [
    { name: "Groceries", thisMonth: 250, lastMonth: 350 },
    { name: "Shopping", thisMonth: 400, lastMonth: 420 },
  ],
};

// 🔵 Progress Tracker
export const wastePerDay = [2, 1, 0, 3, 1, 1, 2];

// ⚠️ NOTE:
// Do NOT define patterns here.
// The engine will generate them dynamically based on "expenses".

export const defaultLayout = [
  "graphs",
  "achievements",
  "progress",
  "patterns"
];

const insightsMockData = {
  weeklyStats,
  graphsData,
  mockUserData,
  expenses,
  wastePerDay,
  defaultLayout,
};

export default insightsMockData;

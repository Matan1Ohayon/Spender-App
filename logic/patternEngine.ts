// ===============================
// 📌 INTERFACES
// ===============================

export interface Expense {
    id: number;
    amount: number;
    type: "good" | "waste";
    category: string;
    date: string;  // "2025-11-05"
    payment?: string;  // "card" | "cash" | "bit"
    note?:string;
  }
  
  export interface SpendingPattern {
    id: number;
    text: string;
  }
  
  export interface DayStats {
    day: string;
    total: number;
    unnecessary: number;
    percent: number;
  }
  
  export interface CategoryStats {
    category: string;
    percent: number;
  }
  
  // ===============================
  // 📌 MAIN PATTERN ENGINE
  // ===============================
  
  export function detectPatterns(expenses: Expense[]): SpendingPattern[] {
    const patterns: SpendingPattern[] = [];
  
    // Rule 1 — Highest unnecessary spending day
    const byDay = groupByDay(expenses);
    const maxDay = findMaxDay(byDay);
  
    if (maxDay && maxDay.unnecessary > 0) {
      patterns.push({
        id: 1,
        text: `${maxDay.day} is your highest unnecessary spending day (+${maxDay.percent}%).`,
      });
    }
  
    // Rule 2 — Dominant category (e.g., deliveries)
    const cat = findDominantCategory(expenses);
  
    if (cat) {
      patterns.push({
        id: 2,
        text: `${cat.percent}% of your unnecessary spending comes from ${cat.category}.`,
      });
    }

      // Rule 3 — Weekend unnecessary spending
    const weekend = weekendPattern(expenses);
    if (weekend) {
        patterns.push({
        id: patterns.length + 1,
        text: weekend,
        });
    }
  
    return patterns;
  }
  
  // ===============================
  // 📌 RULE HELPERS
  // ===============================
  
  export function groupByDay(expenses: Expense[]): DayStats[] {
    const map: Record<string, { total: number; unnecessary: number }> = {};
  
    expenses.forEach((exp) => {
      const day = new Date(exp.date).toLocaleDateString("en-US", {
        weekday: "long",
      });
  
      if (!map[day]) {
        map[day] = { total: 0, unnecessary: 0 };
      }
  
      map[day].total++;
      if (exp.type === "waste") map[day].unnecessary++;
    });
  
    return Object.entries(map).map(([day, stats]) => ({
      day,
      total: stats.total,
      unnecessary: stats.unnecessary,
      percent:
        stats.total === 0
          ? 0
          : Math.round((stats.unnecessary / stats.total) * 100),
    }));
  }
  
  export function findMaxDay(days: DayStats[]): DayStats | null {
    if (days.length === 0) return null;
    return days.reduce((max, cur) =>
      cur.unnecessary > max.unnecessary ? cur : max
    );
  }
  
  export function findDominantCategory(
    expenses: Expense[]
  ): CategoryStats | null {
    const waste = expenses.filter((e) => e.type === "waste");
  
    if (waste.length === 0) return null;
  
    const map: Record<string, number> = {};
  
    waste.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + 1;
    });
  
    const entries = Object.entries(map).map(([cat, count]) => ({
      category: cat,
      percent: Math.round((count / waste.length) * 100),
    }));
  
    return entries.sort((a, b) => b.percent - a.percent)[0];
  }

  function weekendPattern(expenses: Expense[]): string | null {
    const waste = expenses.filter((e) => e.type === "waste");
    if (waste.length === 0) return null;
  
    let weekendCount = 0;
  
    waste.forEach((e) => {
      const day = new Date(e.date).getDay(); 
      // 0 = Sunday, 6 = Saturday
      if (day === 0 || day === 6) weekendCount++;
    });
  
    const percent = Math.round((weekendCount / waste.length) * 100);
  
    if (percent >= 50) {
      return `${percent}% of your unnecessary spending occurs on weekends.`;
    }
  
    return null;
  }
  
  
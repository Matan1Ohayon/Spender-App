import { achievementsList } from "@/_data/achievementsList";

export interface Expense {
  id: string;
  amount: number;
  category: string;
  type: "worth" | "waste" | "" | null;
  date: string; 
  dateISO?: string; 
  createdAt?: string;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  condition: string;
}

function parseExpenseDate(exp: Expense): Date {
  if (exp.dateISO) return new Date(exp.dateISO);

  if (exp.date) {
    const [month, day] = exp.date.split(" ");
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul",
                    "Aug","Sep","Oct","Nov","Dec"];
    const m = months.indexOf(month);
    const d = parseInt(day);
    const y = new Date().getFullYear();
    return new Date(y, m, d);
  }

  return new Date(0);
}


// { YYYY-MM-DD : { necessary: X , unnecessary: X, total: X } }
function groupByDay(expenses: Expense[]) {
  const map: Record<string, { necessary: number; unnecessary: number; total: number }> = {};

  expenses.forEach(exp => {
    const d = parseExpenseDate(exp);
    const key = d.toISOString().split("T")[0]; // YYYY-MM-DD

    if (!map[key]) {
      map[key] = { necessary: 0, unnecessary: 0, total: 0 };
    }

    if (exp.type === "worth") map[key].necessary++;
    else if (exp.type === "waste") map[key].unnecessary++;

    map[key].total += Number(exp.amount) || 0;
  });

  return map;
}


function calculateWeekly(expenses: Expense[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  const lastWeekStart = new Date(today);
  lastWeekStart.setDate(today.getDate() - 14);

  const thisWeek = expenses.filter(e => {
    const d = parseExpenseDate(e);
    return d >= weekAgo && d <= today;
  });

  const lastWeek = expenses.filter(e => {
    const d = parseExpenseDate(e);
    return d >= lastWeekStart && d < weekAgo;
  });

  const sumThis = thisWeek.reduce((s, e) => s + Number(e.amount || 0), 0);
  const sumLast = lastWeek.reduce((s, e) => s + Number(e.amount || 0), 0);

  const necessaryPercent = thisWeek.length
    ? Math.round((thisWeek.filter(e => e.type === "worth").length / thisWeek.length) * 100)
    : 0;

  return { thisWeek: sumThis, lastWeek: sumLast, necessaryPercent };
}

function calculateMonthly(expenses: Expense[]) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const thisMonth = expenses.filter(e => {
    const d = parseExpenseDate(e);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const lastMonth = expenses.filter(e => {
    const d = parseExpenseDate(e);
    return (
      d.getFullYear() === year &&
      d.getMonth() === month - 1
    );
  });

  const sumThis = thisMonth.reduce((s, e) => s + Number(e.amount || 0), 0);
  const sumLast = lastMonth.reduce((s, e) => s + Number(e.amount || 0), 0);

  return { thisMonth: sumThis, lastMonth: sumLast };
}

function calculateCategoryMonthly(expenses: Expense[]) {
  const now = new Date();
  const month = now.getMonth();
  const lastMonth = month - 1;
  const year = now.getFullYear();

  const categories: Record<string, { thisMonth: number; lastMonth: number }> = {};

  expenses.forEach(exp => {
    const d = parseExpenseDate(exp);
    if (!categories[exp.category]) {
      categories[exp.category] = { thisMonth: 0, lastMonth: 0 };
    }

    if (d.getMonth() === month) {
      categories[exp.category].thisMonth += Number(exp.amount || 0);
    }
    if (d.getMonth() === lastMonth) {
      categories[exp.category].lastMonth += Number(exp.amount || 0);
    }
  });

  return categories;
}

// ------

export function checkNewAchievements(
  expenses: Expense[],
  unlockedAchievements: number[]
): number[] {

  const newlyUnlocked: number[] = [];

  const filtered = expenses.filter(e => e.type !== null && e.type !== "");

  const daily = groupByDay(filtered);
  const weekly = calculateWeekly(filtered);
  const monthly = calculateMonthly(filtered);
  const categories = calculateCategoryMonthly(filtered);

  const dailyList = Object.values(daily);

  // עוברים רק על הישגים שלא הושגו
  const pending = achievementsList.filter(
    a => !unlockedAchievements.includes(a.id)
  );

  pending.forEach(achievement => {
    let ok = false;

    switch (achievement.condition) {
      case "day_no_unnecessary":
        ok = dailyList.some(d => d.unnecessary === 0);
        break;

      case "streak_3_days":
        let streak = 0;
        Object.values(daily).forEach(d => {
          if (d.unnecessary === 0) streak++;
          else streak = 0;
        });
        ok = streak >= 3;
        break;

      case "weekly_drop_10":
        ok = weekly.lastWeek > 0 && weekly.thisWeek <= weekly.lastWeek * 0.9;
        break;

      case "monthly_drop_10":
        ok =
          monthly.lastMonth > 0 && monthly.thisMonth <= monthly.lastMonth * 0.9;
        break;

      case "category_reduce_20":
        ok = Object.values(categories).some(
          c => c.lastMonth > 0 && c.thisMonth <= c.lastMonth * 0.8
        );
        break;

      case "days_logged_7":
        ok = dailyList.length >= 7;
        break;

      case "necessary_60_percent":
        ok = weekly.necessaryPercent >= 60;
        break;

      case "month_tracked_30":
        ok = dailyList.length >= 30;
        break;
    }

    if (ok) newlyUnlocked.push(achievement.id);
  });

  return newlyUnlocked;
}


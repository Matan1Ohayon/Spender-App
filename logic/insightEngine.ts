// ---- Types ----

export interface Expense {
  amount: number | string;
  category: string;
  type?: string | null;  
  date?: string;         
  dateISO?: string;      
}

export interface Insight {
  title: string;
  description: string;   
}

interface WeeklyStats {
  totalThisWeek: number;
  totalLastWeek: number;
  wasteAmountThisWeek: number;
  wasteAmountLastWeek: number;
  worthAmountThisWeek: number;
  worthAmountLastWeek: number;
  categoriesThisWeek: Record<string, number>;
  categoriesLastWeek: Record<string, number>;
}

//Helper
function parseDate(exp: Expense): Date {
  if (exp.dateISO) {
    const d = new Date(exp.dateISO);
    if (!isNaN(d.getTime())) return d;
  }

  if (exp.date) {
    const parts = exp.date.split(" "); 
    if (parts.length >= 2) {
      const months = [
        "Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec"
      ];
      const m = months.indexOf(parts[0]);
      const d = parseInt(parts[1], 10);

      if (m !== -1 && !isNaN(d)) {
        const now = new Date();
        let y = now.getFullYear();

        if (now.getMonth() < m) {
          y -= 1;
        }

        return new Date(y, m, d);
      }
    }
  }

  return new Date(0);
}

function getWeekBoundaries() {
  const now = new Date();
  const endToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23, 59, 59, 999
  );

  const oneWeekAgo = new Date(endToday);
  oneWeekAgo.setDate(endToday.getDate() - 6);

  const twoWeeksAgo = new Date(oneWeekAgo);
  twoWeeksAgo.setDate(oneWeekAgo.getDate() - 7);

  return { endToday, oneWeekAgo, twoWeeksAgo };
}

export function generateInsightOfTheWeek(expenses: Expense[]): Insight {
  if (!expenses || expenses.length === 0) {
    return {
      title: "No data yet",
      description: "Add some expenses to get your first insight."
    };
  }

  const { endToday, oneWeekAgo, twoWeeksAgo } = getWeekBoundaries();

  const stats: WeeklyStats = {
    totalThisWeek: 0,
    totalLastWeek: 0,
    wasteAmountThisWeek: 0,
    wasteAmountLastWeek: 0,
    worthAmountThisWeek: 0,
    worthAmountLastWeek: 0,
    categoriesThisWeek: {},
    categoriesLastWeek: {},
  };

  expenses.forEach((exp) => {
    const date = parseDate(exp);
    if (date.getFullYear() === 1970) return; 

    const amount = Number(exp.amount) || 0;
    if (amount <= 0) return;

    const normalizedType = (exp.type || "").toString().toLowerCase().trim();
    const isWaste = normalizedType === "waste";
    const isWorth =
      normalizedType === "worth" ||
      normalizedType === "worth-it" ||
      normalizedType === "worth_it";

    const isThisWeek = date >= oneWeekAgo && date <= endToday;
    const isLastWeek = date >= twoWeeksAgo && date < oneWeekAgo;

    if (!isThisWeek && !isLastWeek) return;

    if (isThisWeek) {
      stats.totalThisWeek += amount;

      if (isWaste) {
        stats.wasteAmountThisWeek += amount;
      } else if (isWorth) {
        stats.worthAmountThisWeek += amount;
      }

      stats.categoriesThisWeek[exp.category] =
        (stats.categoriesThisWeek[exp.category] || 0) + amount;
    }

    if (isLastWeek) {
      stats.totalLastWeek += amount;

      if (isWaste) {
        stats.wasteAmountLastWeek += amount;
      } else if (isWorth) {
        stats.worthAmountLastWeek += amount;
      }

      stats.categoriesLastWeek[exp.category] =
        (stats.categoriesLastWeek[exp.category] || 0) + amount;
    }
  });

  const insights: Insight[] = [];

  const {
    totalThisWeek,
    totalLastWeek,
    wasteAmountThisWeek,
    wasteAmountLastWeek,
  } = stats;

  const wasteRatioThisWeek =
    totalThisWeek > 0 ? wasteAmountThisWeek / totalThisWeek : 0;
  const wasteRatioLastWeek =
    totalLastWeek > 0 ? wasteAmountLastWeek / totalLastWeek : 0;


  // Decrease in expenses defined as waste
  if (
    totalLastWeek > 0 &&
    wasteRatioThisWeek < wasteRatioLastWeek &&
    wasteRatioLastWeek - wasteRatioThisWeek >= 0.05
  ) {
    const dropPercent = Math.round((wasteRatioLastWeek - wasteRatioThisWeek) * 100);

    insights.push({
      title: "Better quality spending",
      description: `Your waste spending dropped by ${dropPercent}% compared to last week.`,
    });
  }

  // Decrease in a specific category
  for (const cat in stats.categoriesThisWeek) {
    const now = stats.categoriesThisWeek[cat];
    const prev = stats.categoriesLastWeek[cat] || 0;

    if (prev >= 20 && now < prev) {
      const dropPercent = Math.round(((prev - now) / prev) * 100);
      if (dropPercent >= 20) {
        insights.push({
          title: `${cat} looks better`,
          description: `You cut ${cat} spending by ${dropPercent}% compared to last week.`,
        });
      }
    }
  }

  // General decrease in expenses
  if (totalLastWeek > 0 && totalThisWeek < totalLastWeek) {
    const diffTotal = totalLastWeek - totalThisWeek;
    const diffPercent = Math.round((diffTotal / totalLastWeek) * 100);

    if (diffTotal >= 20 && diffPercent >= 5) {
      insights.push({
        title: "You spent less this week",
        description: `You spent $${diffTotal.toFixed(0)} less than last week.`,
      });
    }
  }

  //  Fallbacks 
  if (insights.length === 0) {
    if (totalLastWeek === 0 && totalThisWeek > 0) {
      return {
        title: "First week on Spender 🎉",
        description: "Once we have two weeks of data, we’ll start showing insights here.",
      };
    }

    if (totalLastWeek > 0 && totalThisWeek > totalLastWeek * 1.2) {
      const diffTotal = totalThisWeek - totalLastWeek;
      const diffPercent = Math.round((diffTotal / totalLastWeek) * 100);

      return {
        title: "Spending alert",
        description: `You spent about ${diffPercent}% more than last week.`,
      };
    }

    return {
      title: "Steady week",
      description: "Your spending is similar to last week.",
    };
  }

  return insights[0];
}

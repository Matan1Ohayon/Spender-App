interface Expense {
    amount: number;
    category: string;
    type?: string;   // "worth" | "waste" | ""
  }

export interface GraphsData {
    pie: {
      good: number;
      unnecessary: number;
    };
    bar: Array<{
      label: string;
      value: number;
    }>;
  }

export function buildGraphsData(expenses: Expense[]): GraphsData {
    if (!expenses || expenses.length === 0) {
      return {
        pie: { good: 0, unnecessary: 0 },
        bar: [],
      };
    }

    const sortedExpenses = expenses.filter((e) => e.type && e.type.trim() !== "");

    const totalSorted = sortedExpenses.length;

    // PIE DATA
    const goodCount = sortedExpenses.filter((e) => e.type === "worth").length;
    const wasteCount = sortedExpenses.filter((e) => e.type === "waste").length;

    const pie = {
      good: totalSorted ? Math.round((goodCount / totalSorted) * 100) : 0,
      unnecessary: totalSorted ? Math.round((wasteCount / totalSorted) * 100) : 0,
    };

    const pieTotal = pie.good + pie.unnecessary;
    if (pieTotal !== 100 && pieTotal > 0) {
      pie.unnecessary = 100 - pie.good;
    }

    // BAR DATA
    const categoryTotals: Record<string, number> = {};

    expenses.forEach((exp) => {
      const amt = Number(exp.amount) || 0;
      if (!categoryTotals[exp.category]) categoryTotals[exp.category] = 0;
      categoryTotals[exp.category] += amt;
    });

    const totalAmount = Object.values(categoryTotals).reduce((s, v) => s + v, 0);

    const bar = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        label: category,
        value: totalAmount ? Math.round((amount / totalAmount) * 100) : 0, 
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);

    return { pie, bar };
}
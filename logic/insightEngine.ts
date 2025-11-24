interface WeeklyStats {
    thisWeek: number;
    lastWeek: number;
    unnecessaryThisWeek: number;
    unnecessaryLastWeek: number;
    categoriesThisWeek: Record<string, number>;
    categoriesLastWeek: Record<string, number>;
  }
  
  interface Insight {
    title: string;
    description: string;
  }
  


export function generateInsightOfTheWeek(stats: WeeklyStats): Insight {
    const insights: Insight[] = [];
  
    // 1. ירידה בהוצאות מיותרות
    const diffWaste = stats.unnecessaryLastWeek - stats.unnecessaryThisWeek;
    const diffWastePercent = Math.round((diffWaste / stats.unnecessaryLastWeek) * 100);
  
    if (diffWaste > 0) {
      insights.push({
        title: "Great improvement!",
        description: `Your wasted spending dropped by ${diffWastePercent}%.`,
      });
    }
  
    // 2. ירידה כללית בהוצאות השבוע
    const diffTotal = stats.lastWeek - stats.thisWeek;
    const diffTotalPercent = Math.round((diffTotal / stats.lastWeek) * 100);
  
    if (diffTotal > 0) {
      insights.push({
        title: "You saved money this week",
        description: `You spent $${diffTotal} less compared to last week (${diffTotalPercent}%).`,
      });
    }
  
    // 3. קטגוריה שירדה משמעותית
    for (const cat in stats.categoriesThisWeek) {
      const now = stats.categoriesThisWeek[cat];
      const prev = stats.categoriesLastWeek[cat];
  
      if (prev > now && prev > 0) {
        const drop = Math.round(((prev - now) / prev) * 100);
        if (drop >= 20) {
          insights.push({
            title: `Nice drop in ${cat}`,
            description: `${cat} spending dropped by ${drop}% since last week.`,
          });
        }
      }
    }
  
    // 4. עומד ביעד waste
    const avgWaste = stats.unnecessaryThisWeek / 7;
  
    if (avgWaste < 1) {
      insights.push({
        title: "Amazing consistency!",
        description: "You kept your average waste spending below 1 per day.",
      });
    }
  
    // --------------------
    // ⚠️ בחירת האינסייט הכי חזק
    // --------------------
    if (insights.length === 0) {
      return {
        title: "Keep it up!",
        description: "Continue tracking to get new insights next week.",
      };
    }
  
    // בוחרים את האינסייט הראשון — שזה החזק ביותר
    return insights[0];
  }
  
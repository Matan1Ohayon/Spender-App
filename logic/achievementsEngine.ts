import { achievementsList } from "@/_data/achievementsList";

/**
 * userData – אלו הנתונים שצריך בשביל לחשב הישגים
 * תוכל לשנות/להרחיב לפי מבנה הדאטה שלך בהמשך
 */
interface UserData {
  daily: Array<{
    date: string;
    necessary: number;
    unnecessary: number;
    total: number;
  }>;
  weekly: {
    thisWeek: number;
    lastWeek: number;
    necessaryPercent: number; // אחוז הוצאות טובות
  };
  monthly: {
    thisMonth: number;
    lastMonth: number;
    budget: number;
  };
  categories: Array<{
    name: string;
    thisMonth: number;
    lastMonth: number;
  }>;
}

/**
 * בודק את כל ההישגים האפשריים לפי הדאטה של המשתמש
 * מחזיר מערך של IDs של הישגים שהושגו
 */
export function checkUserAchievements(user: UserData) {
  let achieved: number[] = [];

  // ---------------------------------------------------------
  // 1. Zero Waste Day — יום אחד ללא הוצאה מיותרת
  // ---------------------------------------------------------
  const zeroWaste = user.daily.some((d) => d.unnecessary === 0);
  if (zeroWaste) achieved.push(1);

  // ---------------------------------------------------------
  // 2. 3-Day Clean Streak — 3 ימים רצופים בלי waste
  // ---------------------------------------------------------
  let streak = 0;
  for (let day of user.daily) {
    if (day.unnecessary === 0) streak++;
    else streak = 0;
    if (streak >= 3) {
      achieved.push(2);
      break;
    }
  }

  // ---------------------------------------------------------
  // 3. Weekly Reduction — ירידה של 10% בהוצאות השבוע
  // ---------------------------------------------------------
  const weeklyDrop =
    user.weekly.thisWeek < user.weekly.lastWeek * 0.9;
  if (weeklyDrop) achieved.push(3);

  // ---------------------------------------------------------
  // 4. Category Saver — קטגוריה אחת ירדה ב־20% ומעלה
  // ---------------------------------------------------------
  const categoryReduced = user.categories.some(
    (c) => c.thisMonth < c.lastMonth * 0.8
  );
  if (categoryReduced) achieved.push(4);

  // ---------------------------------------------------------
  // 5. Budget Keeper — חודש מתחת לתקציב
  // ---------------------------------------------------------
  const underBudget = user.monthly.thisMonth <= user.monthly.budget;
  if (underBudget) achieved.push(5);

  // ---------------------------------------------------------
  // 6. 7 Days Logged — הזין הוצאות ב־7 ימים שונים
  // ---------------------------------------------------------
  const daysLogged = user.daily.filter((d) => d.total > 0).length;
  if (daysLogged >= 7) achieved.push(6);

  // ---------------------------------------------------------
  // 7. Smart Shopper — לפחות 60% הוצאות טובות השבוע
  // ---------------------------------------------------------
  if (user.weekly.necessaryPercent >= 60) achieved.push(7);

  // ---------------------------------------------------------
  // 8. Monthly Milestone — 30 ימים של מעקב
  // ---------------------------------------------------------
  if (user.daily.length >= 30) achieved.push(8);

  return achieved;
}

/**
 * מחזיר את רשימת ההישגים שהמשתמש השיג (אובייקטים מלאים)
 */
export function getUnlockedAchievements(user: UserData) {
  const achievedIds = checkUserAchievements(user);
  return achievementsList.filter((a) => achievedIds.includes(a.id));
}

/**
 * מחזיר את רשימת ההישגים שהמשתמש עדיין לא השיג
 */
export function getLockedAchievements(user: UserData) {
  const achievedIds = checkUserAchievements(user);
  return achievementsList.filter((a) => !achievedIds.includes(a.id));
}

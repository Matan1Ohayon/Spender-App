import Collapse from "@/components/insights/Collapse";
import { StyleSheet, Text, View } from "react-native";
import { scaleFont, scaleSize } from "@/utils/scale";
import DualToneProgressRing from "./DualToneProgressRing";

export interface Expense {
  amount: number;
  type: string;     // "worth" / "waste" / ""
  date: string;     // "Jan 12" 
  dateISO?: string; 
}

interface ProgressSectionProps {
  expenses: Expense[];
}

function parseExpenseDate(exp: Expense): Date {
  if (exp.dateISO) {
    const date = new Date(exp.dateISO);
    if (!isNaN(date.getTime())) return date;
  }

  if (exp.date) {
    const parts = exp.date.trim().split(" ");
    if (parts.length >= 2) {
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul",
                      "Aug","Sep","Oct","Nov","Dec"];
      const month = parts[0];
      const m = months.indexOf(month);
      const d = parseInt(parts[1]);
      if (m !== -1 && !isNaN(d)) {
        const y = new Date().getFullYear();
        return new Date(y, m, d);
      }
    }
  }

  return new Date(0);
}

export default function ProgressSection({ expenses }: ProgressSectionProps) {
  
  const dailyMap = new Map<string, number>();

  expenses.forEach(exp => {
    if (exp.type !== "waste") return;

    const d = parseExpenseDate(exp);
    if (d.getTime() === 0 || isNaN(d.getTime())) return;
    
    d.setHours(0,0,0,0);

    const key = d.toDateString();
    dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
  });

  const allDates = expenses
    .map(exp => {
      const d = parseExpenseDate(exp);
      if (d.getTime() === 0 || isNaN(d.getTime())) return null;
      d.setHours(0,0,0,0);
      return d;
    })
    .filter((d): d is Date => d !== null && d.getTime() > 0) // Filter out invalid dates
    .sort((a, b) => a.getTime() - b.getTime());

  let wastePerDay: number[] = [];
  let totalDays = 0;

  if (allDates.length > 0) {
    const first = allDates[0];
    const last = new Date();
    last.setHours(0,0,0,0);

    let current = new Date(first);

    while (current <= last) {
      const key = current.toDateString();
      const wasteCount = dailyMap.get(key) || 0;
      wastePerDay.push(wasteCount);
      totalDays++;

      current = new Date(current.getTime() + 86400000);
    }
  }

  if (wastePerDay.length === 0) {
    wastePerDay = [0];
    totalDays = 1;
  }

  const totalWasteExpenses = wastePerDay.reduce((a, b) => a + b, 0);
  const avgWaste = totalDays > 0 ? totalWasteExpenses / totalDays : 0;

  const progress = Math.min(100, Math.round((1 / avgWaste) * 100));

  let message = "";
  if (avgWaste <= 1) message = "Excellent! You're below the weekly waste target.";
  else if (avgWaste <= 2)
    message = "Good progress! Try reducing a little more.";
  else message = "You're above your target. Let's improve next week.";

  return (
    <Collapse title="🚀 Progress Indicator">
      <View style={styles.wrapper}>

        <DualToneProgressRing
          size={160}
          strokeWidth={18}
          progress={progress}
        />

        <Text style={styles.percentText}>{progress}%</Text>


        <Text style={styles.avgText}>
          Avg waste spends per day:{" "}
          <Text style={{ fontWeight: "700" }}>
            {avgWaste.toFixed(1)}
          </Text>
        </Text>

        <Text style={styles.message}>{message}</Text>
      </View>
    </Collapse>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    marginTop: scaleSize(15),
    marginBottom: scaleSize(10),
  },

  percentText: {
    fontSize: scaleFont(36),
    color: "#390492",
    fontWeight: "800",
    position: "absolute",
    top: scaleSize(63),
  },

  avgText: {
    marginTop: scaleSize(20),
    fontSize: scaleFont(15),
    color: "#444",
  },

  message: {
    marginTop: scaleSize(8),
    fontSize: scaleFont(14),
    textAlign: "center",
    paddingHorizontal: scaleSize(20),
    color: "#555",
  },
});

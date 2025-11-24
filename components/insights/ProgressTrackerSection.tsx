import Collapse from "@/components/insights/Collapse";
import { StyleSheet, Text, View } from "react-native";
import DualToneProgressRing from "./DualToneProgressRing";

interface ProgressSectionProps {
  wastePerDay: number[]; // מספר הוצאות מיותרות לכל יום בשבוע
}

export default function ProgressSection({ wastePerDay }: ProgressSectionProps) {

  // חישוב ממוצע הוצאות מיותרות ביום
  const avgWaste =
    wastePerDay.reduce((a, b) => a + b, 0) / wastePerDay.length;

  // חישוב ציון התקדמות 0–100
  const progress = Math.min(100, Math.round((1 / avgWaste) * 100));

  // הודעה בהתאם למצב
  let message = "";
  if (avgWaste <= 1) message = "Excellent! You're below the weekly waste target.";
  else if (avgWaste <= 2)
    message = "Good progress! Try reducing a little more.";
  else message = "You're above your target. Let's improve next week.";

  return (
    <Collapse title="🚀 Progress Indicator">
      <View style={styles.wrapper}>

        {/* העיגול הדו-צבעי שלך */}
        <DualToneProgressRing
          size={160}
          strokeWidth={18}
          progress={progress}
        />

        {/* כיתוב מספרי */}
        <Text style={styles.percentText}>{progress}%</Text>

        {/* ממוצע יומי */}
        <Text style={styles.avgText}>
          Avg waste spends per day:{" "}
          <Text style={{ fontWeight: "700" }}>
            {avgWaste.toFixed(1)}
          </Text>
        </Text>

        {/* הודעת סטטוס */}
        <Text style={styles.message}>{message}</Text>
      </View>
    </Collapse>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    marginTop: 15,
    marginBottom: 10,
  },

  percentText: {
    fontSize: 36,
    color: "#390492",
    fontWeight: "800",
    position: "absolute",
    top: 63,
  },

  avgText: {
    marginTop: 20,
    fontSize: 15,
    color: "#444",
  },

  message: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 20,
    color: "#555",
  },
});

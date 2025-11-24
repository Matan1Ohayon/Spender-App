import { Expense } from "@/logic/patternEngine";
import { StyleSheet, Text, View } from "react-native";

interface HistoryPreviewProps {
  mode?: "preview";
  expenses: Expense[];
}

const CATEGORY_EMOJIS: { [key: string]: string } = {
  "Food": "🍔",
  "Shopping": "🛍️",
  "Transport": "🚌",
  "Coffee": "☕",
  "Groceries": "🛒",
  "Delivery": "📦",
  "Movies": "🎬",
  "Gas": "⛽",
  "Other": "💡",
};

function getCategoryEmoji(category: string): string {
  return CATEGORY_EMOJIS[category] || CATEGORY_EMOJIS["Other"];
}

export default function HistoryPreview({ mode = "preview", expenses }: HistoryPreviewProps) {
  // מיון לפי תאריך - הכי חדש ראשון
  const sortedExpenses = [...expenses].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // שלושת ההוצאות האחרונות
  const lastThreeExpenses = sortedExpenses.slice(0, 3);

  if (mode === "preview") {
    return (
      <View style={styles.previewWrapper}>
        {lastThreeExpenses.map((expense) => (
          <View key={expense.id} style={styles.previewItem}>
            <View style={styles.previewCardContainer}>
              <View style={styles.previewDetails}>
                <Text style={styles.previewCategory}>
                  {getCategoryEmoji(expense.category)} {expense.category}
                </Text>
                <Text style={styles.previewDate}>{expense.date}</Text>
              </View>
              <Text style={styles.previewAmount}>{expense.amount} $</Text>
            </View>
          </View>
        ))}
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  previewWrapper: {
    marginVertical: 10,
    width: "100%",
  },

  previewItem: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },

  previewCardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  previewDetails: {
    flexDirection: "column",
    justifyContent: "space-between",
    flex: 1,
  },

  previewCategory: {
    fontSize: 14,
    color: "white",
    fontWeight: "600",
    marginBottom: 4,
  },

  previewAmount: {
    fontSize: 16,
    color: "white",
    fontWeight: "700",
  },

  previewDate: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.7)",
  },
});


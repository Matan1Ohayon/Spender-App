import Collapse from "@/components/insights/Collapse";
import { StyleSheet, Text, View } from "react-native";

export interface SpendingPattern {
  id: number;
  text: string;
}

interface PatternsSectionProps {
  data: SpendingPattern[];
}

export default function PatternsSection({ data }: PatternsSectionProps) {
  if (!data || data.length === 0) {
    return (
      <Collapse title="🔍 Spending Patterns">
        <View style={styles.grid}>
          <Text style={styles.emptyText}>No patterns detected yet.</Text>
        </View>
      </Collapse>
    );
  }

  return (
    <Collapse title="🔍 Spending Patterns">
      <View style={styles.grid}>
        {data.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.text}>{item.text}</Text>
          </View>
        ))}
      </View>
    </Collapse>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "#f6f0ff",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 10,
    marginBottom: 16,
    minHeight: 75,
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  text: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
    color: "#333",
    fontWeight: "500",
  },

  emptyText: {
    textAlign: "center",
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
    paddingVertical: 20,
  },
});

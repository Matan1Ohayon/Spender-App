import { StyleSheet, Text, View } from "react-native";
import { scaleFont, scaleSize } from "@/utils/scale";

const PRIMARY = "#390492";

interface InsightProps {
  data: {
    title: string;
    description: string;
  };
  preview?: boolean;
}

export default function InsightOfWeek({ data, preview = false }: InsightProps) {
  // מצב PREVIEW (עבור Edit Layout)
  if (preview) {
    return (
      <View style={[styles.card, styles.previewBox]}>
        <Text style={styles.previewText}>🧠 Insight of the Week</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>🧠 Insight of the Week</Text>
      <Text style={styles.text}>{data.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    marginTop: scaleSize(20),
    marginHorizontal: scaleSize(20),
    padding: scaleSize(20),
    borderRadius: scaleSize(20),

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },

  title: {
    fontSize: scaleFont(18),
    fontWeight: "700",
    color: PRIMARY,
    marginBottom: scaleSize(8),
  },

  text: {
    fontSize: scaleFont(15),
    color: "#444",
    lineHeight: scaleSize(20),
  },

  // PREVIEW
  previewBox: {
    height: scaleSize(60),
    justifyContent: "center",
  },

  previewText: {
    color: PRIMARY,
    fontSize: scaleFont(16),
    fontWeight: "700",
    textAlign: "center",
  },
});

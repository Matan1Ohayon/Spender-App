import Collapse from "@/components/insights/Collapse";
import { GraphsData } from "@/logic/buildGraphsData";
import { StyleSheet, Text, View } from "react-native";
import { scaleFont, scaleSize } from "@/utils/scale";
import { BarChart, PieChart } from "react-native-gifted-charts";

interface GraphsSectionProps {
  mode?: "full" | "preview";
  data: GraphsData;
}

function getCategoryEmoji(category: string): string {
  const categoryMap: Record<string, string> = {
    groceries: "🛒",
    deliveries: "📦",
    shopping: "🛍️",
    food: "🍔",
    transport: "🚌",
    coffee: "☕",
    movies: "🎬",
    gas: "⛽",
    other: "💡",
  };

  const normalizedCategory = category.toLowerCase().trim();
  return categoryMap[normalizedCategory] || "📊";
}

export default function GraphsSection({ mode = "full", data }: GraphsSectionProps) {
  const isPreview = mode === "preview";

  const previewPieData = [
    { value: data.pie.good, color: "white", text: "Good" },
    { value: data.pie.unnecessary, color: "#8B73FF", text: "Unnecessary" },
  ];

  const previewBarData = data.bar.map((b) => ({
    value: b.value,
    label: getCategoryEmoji(b.label),
    frontColor: "white",
  }));

  const fullPieData = [
    { value: data.pie.good, color: "#390492", text: "Good" },
    { value: data.pie.unnecessary, color: "#8B73FF", text: "Unnecessary" },
  ];

  const barColors = ["#390492", "#8B73FF", "#6B5CE6"];
  const fullBarData = data.bar.map((b, index) => ({
    value: b.value,
    label: getCategoryEmoji(b.label),
    frontColor: barColors[index % barColors.length],
  }));

  // -------------------------------------------------------
  // PREVIEW MODE (Side Menu) 
  // -------------------------------------------------------
  if (isPreview) {
    return (
      <View style={styles.previewWrapper}>
        {/* SPENDING BREAKDOWN CARD */}
        <View style={styles.previewItem}>
          <View style={styles.previewCardContainer}>
            <View style={styles.previewDetails}>
              <Text style={styles.previewCategory}>
                📈 Spending Breakdown
              </Text>
              <Text style={styles.previewDate}>
                Worth it: {data.pie.good}% • Waste: {data.pie.unnecessary}%
              </Text>
            </View>
          </View>
        </View>

        {/* CATEGORIES CARD */}
        <View style={styles.previewItem}>
          <Text style={styles.previewCategory}>
            📊 Category Highlights
          </Text>
          {data.bar.map((item, index) => (
            <View key={index} style={styles.progressRow}>
              <View style={styles.progressLabelContainer}>
                <Text style={styles.progressLabel}>
                  {getCategoryEmoji(item.label)} {item.label}
                </Text>
                <Text style={styles.progressValue}>{item.value}%</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${item.value}%` }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  // -------------------------------------------------------
  // FULL MODE (Insights Page)
  // -------------------------------------------------------
  return (
    <Collapse title="📈 Graphs & Comparisons">

      {/* PIE ROW */}
      <View style={styles.row}>
        <View style={styles.chartContainer}>
          <PieChart
            data={fullPieData}
            donut
            radius={80}
            innerRadius={50}
            centerLabelComponent={() => (
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#390492" }}>
                Spending
              </Text>
            )}
          />
        </View>

        <View style={styles.labelsBox}>
          <View style={styles.labelRow}>
            <View style={[styles.colorDot, { backgroundColor: "#390492" }]} />
            <Text style={styles.labelText}>Worth it: {data.pie.good}%</Text>
          </View>
          <View style={styles.labelRow}>
            <View style={[styles.colorDot, { backgroundColor: "#8B73FF" }]} />
            <Text style={styles.labelText}>
              Waste: {data.pie.unnecessary}%
            </Text>
          </View>
        </View>
      </View>

      {/* BAR ROW */}
      <View style={[styles.barColumn, { marginTop: 30 }]}>
        <View style={styles.barChartContainer}>
          <BarChart
            data={fullBarData}
            barWidth={38}
            spacing={16}
            yAxisThickness={0}
            xAxisThickness={0}
            height={180}
            roundedTop
            roundedBottom
            noOfSections={4}
            maxValue={100}
            barBorderRadius={6}
            isAnimated
            animationDuration={800}
          />
        </View>

        <View style={styles.barLabelsBox}>
          {data.bar.map((item, index) => (
            <View key={index} style={styles.labelRow}>
              <View style={[styles.colorDot, { backgroundColor: barColors[index % barColors.length] }]} />
              <Text style={styles.labelText}>
                {getCategoryEmoji(item.label)} {item.label}: {item.value}%
              </Text>
            </View>
          ))}
        </View>
      </View>

    </Collapse>
  );
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
    fontSize: scaleFont(14),
    color: "white",
    fontWeight: "600",
    marginBottom: 4,
  },

  previewAmount: {
    fontSize: scaleFont(16),
    color: "white",
    fontWeight: "700",
  },

  previewDate: {
    fontSize: scaleFont(11),
    color: "rgba(255, 255, 255, 0.7)",
  },

  progressRow: {
    marginTop: scaleSize(12),
  },

  progressLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  progressLabel: {
    fontSize: scaleFont(12),
    color: "white",
    fontWeight: "500",
  },

  progressValue: {
    fontSize: scaleFont(12),
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },

  progressBarContainer: {
    height: scaleSize(4),
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: scaleSize(2),
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: scaleSize(2),
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    flexWrap: "nowrap",
  },

  barColumn: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },

  chartContainer: {
    flexShrink: 1,
    marginRight: scaleSize(20),
  },

  barChartContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: scaleSize(20),
  },

  labelsBox: {
    flexShrink: 0,
    minWidth: scaleSize(120),
  },

  barLabelsBox: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scaleSize(10),
  },

  labelText: {
    fontSize: scaleFont(15),
    color: "#444",
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scaleSize(8),
    marginHorizontal: scaleSize(8),
  },

  colorDot: {
    width: scaleSize(12),
    height: scaleSize(12),
    borderRadius: scaleSize(6),
    marginRight: scaleSize(8),
  },
});

import { achievementsList } from "@/_data/achievementsList";
import { expenses, graphsData, mockUserData, wastePerDay, weeklyStats } from "@/_data/insightsMockData";
import Header from "@/components/Header";
import AchievementsSection from "@/components/insights/AchievementsSection";
import GraphsSection from "@/components/insights/GraphsSection";
import InsightOfWeek from "@/components/insights/InsightOfWeek";
import PatternsSection from "@/components/insights/PatternsSection";
import ProgressSection from "@/components/insights/ProgressTrackerSection";
import SideMenu from "@/components/SideMenu";
import { checkUserAchievements } from "@/logic/achievementsEngine";
import { generateInsightOfTheWeek } from "@/logic/insightEngine";
import { detectPatterns } from "@/logic/patternEngine";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View
} from "react-native";

const PRIMARY = "#390492";
const LIGHT_BG = "#efe7ff";

export default function insightsPage() {

    const [menuOpen, setMenuOpen] = useState(false);

    const insight = generateInsightOfTheWeek(weeklyStats);

    const unlockedIds = checkUserAchievements(mockUserData);

    const patterns = detectPatterns(expenses);


  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Header onMenuPress={() => setMenuOpen(true)} />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.restMain}>
          <InsightOfWeek data={insight} />
          <GraphsSection mode="full" data={graphsData} />
          <AchievementsSection data={achievementsList} unlockedIds={unlockedIds} />
          <ProgressSection wastePerDay={wastePerDay} />
          <PatternsSection data={patterns} />
        </View>
      </ScrollView>

      <SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  restMain:{
    // flexDirection: "row",
    // alignItems: "center",
  },

});

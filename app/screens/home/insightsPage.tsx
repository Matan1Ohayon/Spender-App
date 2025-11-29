import { achievementsList } from "@/_data/achievementsList";
import Header from "@/components/Header";
import AchievementsSection from "@/components/insights/AchievementsSection";
import GraphsSection from "@/components/insights/GraphsSection";
import InsightOfWeek from "@/components/insights/InsightOfWeek";
import PatternsSection from "@/components/insights/PatternsSection";
import ProgressSection from "@/components/insights/ProgressTrackerSection";
import SideMenu from "@/components/SideMenu";
import { useExpenses } from "@/contexts/ExpensesContext";
import { db } from "@/firebase";
import { checkNewAchievements } from "@/logic/achievementsEngine";
import { generateInsightOfTheWeek } from "@/logic/insightEngine";
import { detectPatterns } from "@/logic/patternEngine";
import { useLocalSearchParams } from "expo-router";
import {
  doc,
  getDoc
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View
} from "react-native";

const PRIMARY = "#390492";
const LIGHT_BG = "#efe7ff";


export default function insightsPage() {

  const { phone } = useLocalSearchParams();

  const [menuOpen, setMenuOpen] = useState(false);

  const [user, setUser] = useState<any>(null);

  const { expenses, setExpenses, graphsData } = useExpenses();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
      if (!phone) return;

      async function loadData() {
        setLoading(true);
        try {
          const userRef = doc(db, "users", phone as string);
          const snap = await getDoc(userRef);

          if (!snap.exists()) {
            setError("User not found");
            setLoading(false);
            return;
          }

          setUser(snap.data());
          setLoading(false);
        } catch {
          setError("Failed to load data");
          setLoading(false);
        }
      }

      loadData();
  }, [phone]);

  const insight = generateInsightOfTheWeek(expenses);

  const unlockedAchievements = user?.unlockedAchievements ?? [];

  const newUnlockedAchievements= checkNewAchievements(expenses, unlockedAchievements);

  const patterns = detectPatterns(expenses);


  return (
    <View style={styles.container}>

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
          <AchievementsSection data={achievementsList} unlockedAchievements={newUnlockedAchievements} />
          <ProgressSection expenses={expenses} />
          <PatternsSection data={patterns} />
        </View>
      </ScrollView>

      <SideMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        phone={phone as string}
      />
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
  },

});

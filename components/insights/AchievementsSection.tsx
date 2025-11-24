import Collapse from "@/components/insights/Collapse";
import { StyleSheet, View } from "react-native";
import { MedalBadge } from "./MedalBadge";

interface AchievementInput {
  id: number;
  title: string;
  description: string;
}

interface AchievementsSectionProps {
  data: AchievementInput[];
  unlockedIds: number[]; // מה שה-engine החזיר
  forcedClosed?: number;
}

export default function AchievementsSection({ data, unlockedIds, forcedClosed }: AchievementsSectionProps) {

  const fullList = data.map(a => ({
    ...a,
    unlocked: unlockedIds.includes(a.id),
  }));

  const unlocked = fullList.filter(a => a.unlocked);
  const locked = fullList.filter(a => !a.unlocked);

  const sorted = [...unlocked, ...locked];

  return (
    <Collapse title="🏅 Achievements">
      <View style={styles.grid}>
        {sorted.map(item => (
          <MedalBadge key={item.id} item={item} />
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
});

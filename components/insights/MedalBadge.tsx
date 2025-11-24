import { LinearGradient } from "expo-linear-gradient";
import { useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface Achievement {
  id: number;
  title: string;
  description: string;
  unlocked: boolean;  // NEW FIELD
}

interface MedalBadgeProps {
  item: Achievement;
}

export function MedalBadge({ item }: MedalBadgeProps) {
  const flipAnim = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    if (!item.unlocked) return; // ❌ נעול → לא מסתובב

    flipAnim.setValue(0);
    Animated.timing(flipAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const rotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const metalColors = item.unlocked 
    ? (["#0c0033", "#1f005a", "#390492", "#5d36c8", "#1a0040"] as const)
    : (["#F7F7F7", "#E8E8E8", "#D4D4D4", "#ECECEC"] as const);

  const metalStart = { x: 0.5, y: 0 };
  const metalEnd = { x: 0.5, y: 1 };

  const animatedStyle = item.unlocked 
    ? { transform: [{ rotateY }] }
    : {};

  return (
    <TouchableOpacity
      activeOpacity={item.unlocked ? 0.9 : 1} 
      onPress={handlePress}
      style={styles.badgeContainer}
    >
      <Animated.View style={[styles.badge, animatedStyle]}>
        
        {/* Outer ring */}
        <LinearGradient
          colors={item.unlocked 
            ? ["#4e2bb8", "#390492", "#1f005a"]
            : ["#ffffff", "#dcdcdc", "#f1f1f1"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.outerRing}
        />

        {/* Body */}
        <LinearGradient
          colors={metalColors}
          start={metalStart}
          end={metalEnd}
          style={styles.metal}
        />

        {/* Center glow */}
        <LinearGradient
          colors={["rgba(255,255,255,0.55)", "rgba(255,255,255,0)"]}
          style={styles.centerGlow}
        />

        <View style={styles.textWrap}>
          <Text style={[styles.title, item.unlocked && styles.unlockedText]}>
            {item.title}
          </Text>
          <Text style={[styles.desc, item.unlocked && styles.unlockedTextDesc]}>
            {item.description}
          </Text>
        </View>

      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    width: "48%",
    marginBottom: 20,
    alignItems: "center",
  },

  badge: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: "hidden",
    position: "relative",
  },

  outerRing: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 70,
    borderWidth: 2,
    zIndex: 2,
  },

  metal: {
    position: "absolute",
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderRadius: 66,
    zIndex: 1,
  },

  centerGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 70,
    zIndex: 3,
  },

  textWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: 4,
  },

  desc: {
    fontSize: 11,
    color: "#555",
    textAlign: "center",
  },

  unlockedText: {
    color: "white",
  },

  unlockedTextDesc: {
    color: "#f0e6ff",
  },
});

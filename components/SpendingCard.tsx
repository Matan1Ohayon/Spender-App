import { scaleFont, scaleSize } from "@/utils/scale";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PRIMARY = "#390492";

const categoryEmojis: { [key: string]: string } = {
  Food: "🍔",
  Shopping: "🛍️",
  Transport: "🚌",
  Coffee: "☕",
  Groceries: "🛒",
  Delivery: "📦",
  Movies: "🎬",
  Gas: "⛽",
  Other: "💡",
};

function getCategoryWithEmoji(category: string): string {
  const clean = category.replace(/[\u{1F300}-\u{1F9FF}]/gu, "").trim();
  const emoji = categoryEmojis[clean] || "💡";
  return `${emoji} ${clean}`;
}

interface SpendingCardProps {
  item: { id?: string; category: string; amount: number; payment: string; date: string; notes?: string };
  isBackCard?: boolean;
  onEdit?: (item: any) => void;
}

export default function SpendingCard({ item, isBackCard = false, onEdit }: SpendingCardProps) {
  const cardStyle = isBackCard
    ? [styles.card, { transform: [{ translateY: 25 }] }]
    : styles.card;

  return (
    <View style={styles.wrapper}>
      <View style={cardStyle}>

        {/* TOP */}
        <View style={styles.topCard}>
          <Text style={styles.category}>{getCategoryWithEmoji(item.category)}</Text>

          <TouchableOpacity style={styles.editCircle} onPress={() => onEdit?.(item)}>
            <Image
              source={require("../assets/images/edit_icon.png")}
              style={styles.editIcon}
            />
          </TouchableOpacity>
        </View>

        {/* MAIN */}
        <View style={styles.restCard}>
          <Text style={styles.amount}>${item.amount}</Text>
          <Text style={styles.paymentMethod}>Pay by {item.payment}</Text>
          <Text style={styles.date}>{item.date}</Text>

          <TouchableOpacity style={styles.notesBox} onPress={() => onEdit?.(item)}>
            <Text style={styles.notesPlaceholder}>
              {item.notes?.trim()?.length ? item.notes : "Add a note..."}
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    height: "100%",
    alignItems: "center",
  },

  card: {
    width: "100%",
    maxWidth: scaleSize(350),
    height: scaleSize(430),
    backgroundColor: "white",
    borderRadius: scaleSize(35),
    padding: scaleSize(25),
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },

  topCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  category: {
    fontSize: scaleFont(20),
    color: PRIMARY,
  },

  editCircle: {
    width: scaleSize(40),
    height: scaleSize(40),
    backgroundColor: PRIMARY,
    borderRadius: scaleSize(40),
    justifyContent: "center",
    alignItems: "center",
  },

  editIcon: {
    width: scaleSize(20),
    height: scaleSize(20),
    tintColor: "white",
  },

  restCard: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  amount: {
    fontSize: scaleFont(50),
    color: PRIMARY,
  },

  paymentMethod: {
    fontSize: scaleFont(18),
    color: PRIMARY,
  },

  date: {
    fontSize: scaleFont(16),
    color: PRIMARY,
    opacity: 0.7,
  },

  notesBox: {
    width: "100%",
    paddingVertical: scaleSize(12),
    paddingHorizontal: scaleSize(14),
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: scaleSize(10),
    backgroundColor: "#F7F7F7",
    minHeight: scaleSize(50),
    justifyContent: "center",
  },

  notesPlaceholder: {
    fontSize: scaleFont(16),
    color: "#999",
  },
});

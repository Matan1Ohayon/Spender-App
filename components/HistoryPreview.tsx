import { db } from "@/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";

interface HistoryPreviewProps {
  mode?: "preview";
  phone: string;
  // expenses: any;
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

function parseDateString(dateString: string): Date {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const parts = dateString.trim().split(" ");
  if (parts.length !== 2) return new Date();

  const monthIndex = monthNames.indexOf(parts[0]);
  const day = parseInt(parts[1]);
  if (monthIndex === -1 || isNaN(day)) return new Date();

  const currentYear = new Date().getFullYear();
  return new Date(currentYear, monthIndex, day);
}

const SCREEN_HEIGHT = Dimensions.get("window").height;
const MAX_ITEMS_SMALL = 2;
const MAX_ITEMS_DEFAULT = 3;

export default function HistoryPreview({ mode = "preview", phone }: HistoryPreviewProps) {

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [user, setUser] = useState<any>(null);

  const [expenses, setExpenses] = useState<any[]>([]);

  const loadExpenses = async (phoneString: string) => {
    try {
      const expensesRef = collection(db, "users", phoneString, "expenses");
      const expSnap = await getDocs(expensesRef);
      const expList = expSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExpenses(expList);
    
      return expList;
    } catch (error) {
      console.error("Error loading expenses:", error);
      throw error;
    }
  };

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
        await loadExpenses(phone as string);
        setLoading(false);
      } catch {
        setError("Failed to load data");
        setLoading(false);
      }
    }
    loadData();
  }, [phone]);

  // מיון לפי תאריך - הכי חדש ראשון
  const sortedExpenses = [...expenses].sort((a, b) => {
    return parseDateString(b.date).getTime() - parseDateString(a.date).getTime();
  });

  const maxVisibleItems = SCREEN_HEIGHT < 720 ? MAX_ITEMS_SMALL : MAX_ITEMS_DEFAULT;
  const recentExpenses = sortedExpenses.slice(0, maxVisibleItems);

  if (mode === "preview") {
    return (
      <View style={styles.previewWrapper}>
        {recentExpenses.map((expense) => (
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

  if (recentExpenses.length === 0) {
    return <Text style={{color: "rgba(255, 255, 255, 0.1)", opacity: 0.7}}>No recent spendings</Text>;
  }

  if (loading) {
    return <Text style={{color:"rgba(255, 255, 255, 0.1)"}}>Loading...</Text>;
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


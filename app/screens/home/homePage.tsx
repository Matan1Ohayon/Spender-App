import Header from "@/components/Header";
import SideMenu from "@/components/SideMenu";
import { useExpenses } from "@/contexts/ExpensesContext";
import { db } from "@/firebase";
import { generateInsightOfTheWeek } from "@/logic/insightEngine";
import { router, useLocalSearchParams } from "expo-router";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AddSpendCard from "../../../components/AddSpendCard";
import EditSpendCard from "../../../components/EditSpendCard";
import ErrorMessage from "../../../components/ErrorMessage";
import SpendingCard from "../../../components/SpendingCard";
import TinderStack from "../../../components/TinderStack";

import { scaleFont, scaleSize } from "@/utils/scale";

const PRIMARY = "#390492";
const LIGHT_BG = "#efe7ff";

// ---------- Utility functions ----------
function parseDateString(dateString: string): Date {
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const parts = dateString.trim().split(" ");
  if (parts.length !== 2) return new Date();

  const monthIndex = monthNames.indexOf(parts[0]);
  const day = parseInt(parts[1]);
  if (monthIndex === -1 || isNaN(day)) return new Date();

  const currentYear = new Date().getFullYear();
  return new Date(currentYear, monthIndex, day);
}

function calculateWeeklySpending(expensesData: any[]): number {
  if (!expensesData || expensesData.length === 0) return 0;

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const weeklyExpenses = expensesData.filter((expense: any) => {
    let expenseDate: Date;

    if (expense.dateISO) expenseDate = new Date(expense.dateISO);
    else if (expense.date) expenseDate = parseDateString(expense.date);
    else if (expense.createdAt) expenseDate = new Date(expense.createdAt);
    else return false;

    if (isNaN(expenseDate.getTime())) return false;

    return expenseDate >= sevenDaysAgo && expenseDate <= today;
  });

  return weeklyExpenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
}

// ---------- MAIN COMPONENT ----------
export default function HomePage() {
  const { phone } = useLocalSearchParams();
  const { expenses, setExpenses } = useExpenses();
  const [user, setUser] = useState<any>(null);
  const [filteredExpenses, setFilteredExpenses] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [showAddSpend, setShowAddSpend] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // EDIT
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [showEditSpend, setShowEditSpend] = useState(false);

  function openEditModal(item: any) {
    setSelectedExpense(item);
    setShowEditSpend(true);
    setIsEditing(true);
  }

  function closeEditModal() {
    setSelectedExpense(null);
    setShowEditSpend(false);
    setIsEditing(false);
  }

  async function handleEditSave(updated: any) {
    if (!phone) return;
    const phoneString = phone as string;

    const ref = doc(db, "users", phoneString, "expenses", updated.id);

    await updateDoc(ref, {
      amount: updated.amount,
      category: updated.category,
      payment: updated.payment,
      date: updated.date,
      dateISO: parseDateString(updated.date).toISOString(),
      notes: updated.notes,
    });

    await loadExpenses(phoneString);
    closeEditModal();
  }

  async function handleDeleteExpense(item: any) {
    if (!phone) return;
    const phoneString = phone as string;

    setExpenses((prev) => prev.filter((exp) => exp.id !== item.id));
    setFilteredExpenses((prev) => prev.filter((exp) => exp.id !== item.id));

    try {
      const ref = doc(db, "users", phoneString, "expenses", item.id);
      await deleteDoc(ref);
      await loadExpenses(phoneString);
    } catch (e) {
      console.error("Failed to delete expense:", e);
      setError("Failed to delete expense");
      await loadExpenses(phoneString);
    } finally {
      closeEditModal();
    }
  }

  const loadExpenses = async (phoneString: string) => {
    try {
      const expensesRef = collection(db, "users", phoneString, "expenses");
      const expSnap = await getDocs(expensesRef);
      const expList = expSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setExpenses(expList);

      const filtered = expList.filter((exp: any) => !exp.type || exp.type === "");

      filtered.sort((a, b) => {
        const getSortDate = (exp: any) => {
          if (exp.createdAt) {
            const d = new Date(exp.createdAt);
            if (!isNaN(d.getTime())) return d;
          }
          if (exp.dateISO) {
            const d = new Date(exp.dateISO);
            if (!isNaN(d.getTime())) return d;
          }
          if (exp.date) {
            const d = parseDateString(exp.date);
            if (!isNaN(d.getTime())) return d;
          }
          return new Date(0);
        };

        return getSortDate(b).getTime() - getSortDate(a).getTime();
      });

      setFilteredExpenses(filtered);
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

  const insight = generateInsightOfTheWeek(expenses);
  const weeklySpending = useMemo(
    () => calculateWeeklySpending(expenses),
    [expenses]
  );

  function handleAddSpend() {
    setShowAddSpend(true);
  }

  function handleCloseAddSpend() {
    setShowAddSpend(false);
  }

  async function handleSaveSpend(data: any) {
    if (!phone) return;

    const phoneString = phone as string;

    const expenseDate = parseDateString(data.date);
    const dateISO = expenseDate.toISOString();

    await addDoc(collection(db, "users", phoneString, "expenses"), {
      amount: Number(data.amount),
      category: data.category,
      type: "",
      payment: data.payment,
      date: data.date,
      dateISO,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    });

    await loadExpenses(phoneString);
    setShowAddSpend(false);
  }

  function handleProfileClick() {
    router.push({
      pathname: "/screens/home/ProfileScreen",
      params: { phone, expenses },
    });
  }

  async function handleSwipe(direction: "left" | "right", item: any) {
    if (!phone) return;

    const phoneString = phone as string;
    const newType = direction === "right" ? "worth" : "waste";

    setFilteredExpenses((prev) => prev.filter((exp) => exp.id !== item.id));

    const expenseRef = doc(db, "users", phoneString, "expenses", item.id);

    updateDoc(expenseRef, { type: newType }).catch(() => {
      setError("Failed to update expense");
      loadExpenses(phoneString);
    });

    setExpenses((prev) =>
      prev.map((exp) =>
        exp.id === item.id ? { ...exp, type: newType } : exp
      )
    );
  }

  if (loading) {
    return (
      <View style={styles.mainContainer}>
        <Text style={{ color: PRIMARY }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <Header onMenuPress={() => setMenuOpen(true)}>
        <View style={styles.headerRestL}>
          <Text style={styles.smallText}>Welcome back</Text>
          <Text style={styles.nameText}>{user.name.trim()}!</Text>
          <Text style={styles.smallText}>This week you spent</Text>
          <Text style={styles.bigNumber}>${weeklySpending.toFixed(1)}</Text>
          <Text style={styles.smallText}>{insight.description}</Text>
        </View>

        <View style={styles.profileContainer}>
          <TouchableOpacity
            style={styles.profileCircle}
            onPress={handleProfileClick}
          >
            <Image
              source={{ uri: user.avatar }}
              style={styles.profileAvatar}
            />
          </TouchableOpacity>
        </View>
      </Header>

      <View style={styles.mainContainer}>
        {error !== "" && <ErrorMessage message={error} />}

        <Text style={styles.smallText2}>Swipe to sort your spendings</Text>

        <View style={styles.cardsArea}>
          <TinderStack
            data={filteredExpenses}
            isEditing={isEditing}
            onSwipe={handleSwipe}
            renderCard={(item) => (
              <SpendingCard
                item={item}
                onEdit={(item) => openEditModal(item)}
              />
            )}
          />
        </View>
      </View>

      {/* ADD SPEND BUTTON */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddSpend}>
        <Text style={styles.addButtonText}>add spend</Text>
      </TouchableOpacity>

      {/* MODALS */}
      <AddSpendCard
        visible={showAddSpend}
        onClose={handleCloseAddSpend}
        onSave={handleSaveSpend}
      />

      {showEditSpend && selectedExpense && (
        <EditSpendCard
          item={selectedExpense}
          onClose={closeEditModal}
          onSave={handleEditSave}
          onDelete={handleDeleteExpense}
        />
      )}

      <SideMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        phone={phone as string}
      />
    </View>
  );
}

// ---------- STYLES WITH SCALE APPLIED ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },

  profileContainer: {
    position: "absolute",
    right: 0,
    top: scaleSize(20),
  },

  profileCircle: {
    width: scaleSize(150),
    height: scaleSize(150),
    backgroundColor: LIGHT_BG,
    borderRadius: scaleSize(75),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scaleSize(10),
    overflow: "hidden",
  },

  profileAvatar: {
    height: "100%",
    width: "100%",
    resizeMode: "cover",
  },

  headerRestL: {
    paddingTop: scaleSize(20),
    paddingHorizontal: scaleSize(10),
    rowGap: scaleSize(3),
  },

  smallText: {
    fontSize: scaleFont(16),
    color: "white",
    fontFamily: "DMSans_400Regular",
  },

  nameText: {
    fontSize: scaleFont(25),
    color: "white",
    fontFamily: "DMSans_400Regular",
    paddingBottom: scaleSize(30),
  },

  bigNumber: {
    fontSize: scaleFont(42),
    color: "white",
    fontFamily: "DMSans_700Bold",
    marginVertical: scaleSize(8),
    fontWeight: "800",
  },

  mainContainer: {
    marginTop: scaleSize(10),
    flexDirection: "column",
    alignItems: "center",
  },

  smallText2: {
    marginTop: 0,
    marginBottom: 0,
    fontSize: scaleFont(14),
    color: PRIMARY,
    fontFamily: "DMSans_400Regular",
  },

  cardsArea: {
    width: "100%",
    height: scaleSize(470),
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
    marginBottom: scaleSize(10),
  },

  addButton: {
    position: "absolute",
    bottom: scaleSize(35),
    right: scaleSize(25),
    backgroundColor: PRIMARY,
    paddingVertical: scaleSize(14),
    paddingHorizontal: scaleSize(24),
    borderRadius: scaleSize(20),
    zIndex: 200,
    elevation: 10,
  },

  addButtonText: {
    color: "white",
    fontFamily: "DMSans_700Bold",
    fontSize: scaleFont(16),
  },
});

import { expenses, weeklyStats } from "@/_data/insightsMockData";
import Header from "@/components/Header";
import SideMenu from "@/components/SideMenu";
import { generateInsightOfTheWeek } from "@/logic/insightEngine";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AddSpendCard from "../../../components/AddSpendCard";
import SpendingCard from "../../../components/SpendingCard";
import TinderStack from "../../../components/TinderStack";


const PRIMARY = "#390492";
const LIGHT_BG = "#efe7ff";


const sampleData = [
    { id: 1, amount: 29.19, category: "🍔 Food", date: "Nov 19", payment: "card" },
    { id: 2, amount: 120, category: "🛍️ Shopping", date: "Nov 18", payment: "cash" },
    { id: 3, amount: 15.5, category: "🚌 Transport", date: "Nov 17", payment: "bit" },
    { id: 4, amount: 9.99, category: "☕ Coffee", date: "Nov 16", payment: "card" },
    { id: 5, amount: 45.0, category: "🛒 Groceries", date: "Nov 15", payment: "card" },
    { id: 6, amount: 60.0, category: "🎬 Movies", date: "Nov 14", payment: "bit" },
    { id: 7, amount: 75.5, category: "⛽ Gas", date: "Nov 13", payment: "cash" },
    { id: 8, amount: 33.33, category: "💡 Other", date: "Nov 12", payment: "card" },
  ];


// פונקציה לחישוב סכום ההוצאות השבועי (7 ימים אחורה)
function calculateWeeklySpending(expensesData: typeof expenses): number {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const weeklyExpenses = expensesData.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= sevenDaysAgo && expenseDate <= today;
  });

  return weeklyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
}

export default function HomePage() {
  const name = "Matan Ohayon"; // בהמשך נביא את זה מה-Login/Register

  const insight = generateInsightOfTheWeek(weeklyStats);

  // חישוב סכום ההוצאות השבועי מה-mock data
  const weeklySpending = useMemo(() => calculateWeeklySpending(expenses), []);

  const [isEditing, setIsEditing] = useState(false);
  const [showAddSpend, setShowAddSpend] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleInsights () {
    await new Promise(res => setTimeout(res, 100));
    router.replace("/screens/home/insightsPage");
  }


  function handleEditStart() {
    setIsEditing(true);
  }

  function handleEditEnd() {
    setIsEditing(false);
  }

  function handleAddSpend() {
    setShowAddSpend(true);
  }

  function handleCloseAddSpend() {
    setShowAddSpend(false);
  }

  function handleSaveSpend(data: { amount: string; category: string; payment: string; date: string; notes: string }) {
    // כאן אפשר להוסיף את ההוצאה החדשה ל-state או ל-API
    console.log("New spend:", data);
    // TODO: Add to data array
  }

  function handleProfileClick(){
    console.log("lala");
    router.push({
        pathname: "/screens/home/ProfileScreen",
      });
  }

  return (
    <View style={styles.container}>

        {/* HEADER */}
        <Header onMenuPress={() => setMenuOpen(true)}>
          <View style={styles.headerRestL}>
            <Text style={styles.smallText}>Welcome back</Text>
            <Text style={styles.nameText}>{name}!</Text>
            <Text style={styles.smallText}>This week you spent</Text>
            <Text style={styles.bigNumber}>${weeklySpending.toFixed(1)}</Text>
            <TouchableOpacity onPress={handleInsights}>
              <Text style={styles.smallText}>{insight.description}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.profileContainer}>
            <TouchableOpacity style={styles.profileCircle} onPress={handleProfileClick}>
              <Image
                source={require("../../../assets/images/boy_icon.png")}
                style={styles.profileAvatar}
              />
            </TouchableOpacity>
          </View>
        </Header>

        <View style={styles.mainContainer}>
            <Text style={styles.smallText2}>Swipe to sort your spendings</Text>
            {/* CARDS AREA */}
            
            <View style={styles.cardsArea}>
                <TinderStack
                    data={sampleData}
                    isEditing={isEditing}
                    renderCard={(item) => (
                      <SpendingCard 
                        item={item} 
                        onEditStart={handleEditStart}
                        onEditEnd={handleEditEnd}
                      />
                    )}
                />
            </View>
        </View>
        


      {/* ADD SPEND BUTTON */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddSpend}>
        <Text style={styles.addButtonText}>add spend</Text>
      </TouchableOpacity>

      {/* ADD SPEND CARD MODAL */}
      <AddSpendCard
        visible={showAddSpend}
        onClose={handleCloseAddSpend}
        onSave={handleSaveSpend}
      />

      <SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },


  profileContainer:{
    position: "absolute",
    right: 0,
    top: 20,
  },

  profileCircle: {
    width: 150,
    height: 150,
    backgroundColor: LIGHT_BG,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  profileAvatar: {
    height: 120,
    width : 120,
  },

  headerRestL:{
    paddingTop: 20,
    paddingHorizontal: 10,
    rowGap: 3,
  },

  smallText: {
    fontSize: 16,
    color: "white",
    fontFamily: "DMSans_400Regular",
  },

  nameText: {
    fontSize: 25,
    color: "white",
    fontFamily: "DMSans_400Regular",
    paddingBottom: 30,
  },

  bigNumber: {
    fontSize: 42,
    color: "white",
    fontFamily: "DMSans_700Bold",
    fontWeight: "800",
    marginVertical: 8,
  },

  mainContainer: {
    marginTop: 10,
    flexDirection: "column",
    alignItems: "center",
  },

  smallText2: {
    marginTop: 0,
    marginBottom: 0,
    fontSize: 14,
    color: PRIMARY,
    fontFamily: "DMSans_400Regular",
  },

  /* CARDS AREA */
  cardsArea: {
    width: "100%",
    height: 470,      
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
    marginBottom: 10,
  },
  
  

  /* ADD BUTTON */
  addButton: {
    position: "absolute",
    bottom: 35,
    right: 25,
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    zIndex: 200,
    elevation: 10,
  },

  addButtonText: {
    color: "white",
    fontFamily: "DMSans_700Bold",
    fontSize: 16,
  },
});

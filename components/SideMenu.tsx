// import { graphsData as mockGraphsData } from "@/_data/insightsMockData";
import { useExpenses } from "@/contexts/ExpensesContext";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scaleFont, scaleSize } from "@/utils/scale";
import HistoryPreview from "./HistoryPreview";
import GraphsSection from "./insights/GraphsSection";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const MENU_WIDTH = SCREEN_WIDTH ;

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  phone: string;
}

export default function SideMenu({ visible, onClose, phone }: SideMenuProps) {

  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const { graphsData } = useExpenses();
  const previewGraphsData = graphsData;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? SCREEN_WIDTH - MENU_WIDTH : SCREEN_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  async function handleInsights () {
    await new Promise(res => setTimeout(res, 100));
    router.push({
      pathname: "/screens/home/insightsPage",
      params: { phone },
    });
  }
  
  async function handleHistory () {
    await new Promise(res => setTimeout(res, 100));
    router.push({
      pathname: "/screens/home/historyPage",
      params: { phone },
    });
  }

  async function handleHome() {
    await new Promise(res => setTimeout(res, 100));
    router.replace({
      pathname: "/screens/home/homePage",
      params: { phone },
    });
  }


  async function handleProfile () {
    await new Promise(res => setTimeout(res, 100));
    router.replace({
      pathname: "/screens/home/ProfileScreen",
      params: { phone },
    });
  }

  async function handleLogOut () {
    await new Promise(res => setTimeout(res, 1200));
    router.replace("/");
  }
  
  
  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateX: slideAnim }] }
      ]}
      pointerEvents="box-none"
    >
      {/* Close overlay */}
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />

      {/* Menu */}
      <View style={styles.menu} pointerEvents="auto">
        <View style={styles.content}>
          <TouchableOpacity onPress={handleInsights}>
              <Text style={styles.item}>Your insights</Text>
              <GraphsSection mode="preview" data={previewGraphsData} />
              <Text style={styles.textSmall}>See more</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleHistory}>
                <Text style={styles.item}>Spending history</Text>
                <HistoryPreview mode="preview" phone={phone} />
                <Text style={styles.textSmall}>See more</Text>
          </TouchableOpacity>
          <View style={styles.sectionSpacer} />
          {/* <Text style={styles.item}>Add spends from csv</Text> */}
        </View>

        <View style={styles.bottomArea}>
            <TouchableOpacity onPress={handleHome}>
                <Text style={styles.item}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleProfile}>
                <Text style={styles.item}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogOut}>
                <Text style={styles.item}>Log Out</Text>
            </TouchableOpacity>    
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    width: "100%",
    flexDirection: "row",
    zIndex: 2000,
    elevation: 20,
    overflow: "hidden",
  },

  backdrop: {
    width: "25%", // 100% - 75%
    height: SCREEN_HEIGHT,
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  menu: {
    width: "75%",
    height: SCREEN_HEIGHT,
    backgroundColor: "#390492",
    paddingTop: scaleSize(60),
    paddingHorizontal: scaleSize(25),
    paddingBottom: scaleSize(40),
    overflow: "hidden",
    justifyContent: "space-between",
  },

  content: {
    flex: 1,
    overflow: "hidden",
    paddingBottom: scaleSize(20),
  },

  item: {
    color: "white",
    fontSize: scaleFont(18),
    marginVertical: scaleSize(15),
    fontWeight: "600",
  },

  textSmall: {
    color: "white",
    fontSize: scaleFont(12),
    marginBottom: scaleSize(10),
    fontWeight: "600",
    textAlign: "right",
  },

  bottomArea: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
    paddingTop: scaleSize(20),
    gap: scaleSize(10),
  },

  sectionSpacer: {
    height: scaleSize(10),
  },

});

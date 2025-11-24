import { expenses, graphsData } from "@/_data/insightsMockData";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import HistoryPreview from "./HistoryPreview";
import GraphsSection from "./insights/GraphsSection";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const MENU_WIDTH = SCREEN_WIDTH ;

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
}

export default function SideMenu({ visible, onClose }: SideMenuProps) {
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? SCREEN_WIDTH - MENU_WIDTH : SCREEN_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  async function handleInsights () {
    await new Promise(res => setTimeout(res, 100));
    router.replace("/screens/home/insightsPage");
  }
  
  async function handleHistory () {
    await new Promise(res => setTimeout(res, 100));
    router.replace("/screens/home/historyPage");
  }

  async function handleHome() {
    await new Promise(res => setTimeout(res, 100));
    router.replace("/screens/home/homePage");
  }


  async function handleProfile () {
    await new Promise(res => setTimeout(res, 100));
    router.replace("/screens/home/ProfileScreen");
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
              <GraphsSection mode="preview" data={graphsData} />
              <Text style={styles.textSmall}>See more</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleHistory}>
                <Text style={styles.item}>Spending history</Text>
                <HistoryPreview mode="preview" expenses={expenses} />
                <Text style={styles.textSmall}>See more</Text>
          </TouchableOpacity>
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
    paddingTop: 60,
    paddingHorizontal: 25,
    overflow: "hidden",
  },

  content: {
    flex: 1,
    overflow: "hidden",
  },

  item: {
    color: "white",
    fontSize: 18,
    marginVertical: 15,
    fontWeight: "600",
  },

  textSmall: {
    color: "white",
    fontSize: 12,
    marginBottom: 10,
    fontWeight: "600",
    textAlign: "right",
  },

  bottomArea: {
    position: "absolute",
    bottom: 40,
    left: 25,
  },

});

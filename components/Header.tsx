import { router } from "expo-router";
import { ReactNode } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

const PRIMARY = "#390492";

interface HeaderProps {
  onMenuPress: () => void;
  children?: ReactNode;
}

export default function Header({ onMenuPress, children }: HeaderProps) {

  async function logoPress() {
    await new Promise(res => setTimeout(res, 100));
    router.replace("/screens/home/homePage");
  }

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={logoPress}>
          <Image
            source={require("../assets/images/Theme1.png")}
            style={styles.logo}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuCircle} onPress={onMenuPress}>
          <Image
            source={require("../assets/images/menu_icon.png")}
            style={styles.menuIcon}
          />
        </TouchableOpacity>
      </View>
      {children && <View style={styles.headerRest}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: PRIMARY,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderRadius: 30,
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: {
    width: 130,
    height: 40,
    resizeMode: "contain",
    tintColor: "PRIMARY",
  },

  menuCircle: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  menuIcon: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  headerRest: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
  },
});

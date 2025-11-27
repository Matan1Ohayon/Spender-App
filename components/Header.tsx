import { router, useLocalSearchParams } from "expo-router";
import { ReactNode } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { scaleSize } from "@/utils/scale";

const PRIMARY = "#390492";

interface HeaderProps {
  onMenuPress: () => void;
  children?: ReactNode;
}

export default function Header({ onMenuPress, children }: HeaderProps) {

  const { phone } = useLocalSearchParams();


  async function logoPress() {
    await new Promise(res => setTimeout(res, 100));
    router.replace({
      pathname : "/screens/home/homePage",
      params: { phone }
    });
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
    paddingTop: scaleSize(60),
    paddingBottom: scaleSize(20),
    paddingHorizontal: scaleSize(20),
    borderRadius: scaleSize(30),
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: {
    width: scaleSize(130),
    height: scaleSize(40),
    resizeMode: "contain",
    tintColor: "PRIMARY",
  },

  menuCircle: {
    width: scaleSize(40),
    height: scaleSize(40),
    justifyContent: "center",
    alignItems: "center",
  },

  menuIcon: {
    width: scaleSize(30),
    height: scaleSize(30),
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

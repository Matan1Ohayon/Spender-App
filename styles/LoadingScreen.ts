import { StyleSheet } from "react-native";
import { scaleSize } from "@/utils/scale";

export const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#390592",
  },
  logo: {
    width: "80%",
    height: undefined,
    aspectRatio: 1,
    marginBottom: scaleSize(20),
    resizeMode: "contain",
  },
});

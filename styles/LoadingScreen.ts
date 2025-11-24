import { StyleSheet } from "react-native";

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
    marginBottom: 20,
    resizeMode: "contain",
  },  
});

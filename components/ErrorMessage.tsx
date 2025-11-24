import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";

const ERROR_RED = "#ff4d4d";
const PRIMARY = "#390492";

type ErrorMessageProps = {
  message: string;
};

export default function ErrorMessage({ message }: ErrorMessageProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Ionicons name="alert-circle" size={20} color={ERROR_RED} style={{ marginRight: 8 }} />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#ffe6e6",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#ffb3b3",
  },
  text: {
    color: ERROR_RED,
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    flexShrink: 1,
  },
});

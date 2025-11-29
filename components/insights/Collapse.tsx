import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CollapseProps {
  title: string;
  children: React.ReactNode;
}

export default function Collapse({ title, children }: CollapseProps) {
  const [open, setOpen] = useState(true);

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.header} onPress={() => setOpen(!open)}>
        <Text style={styles.title}>{title}</Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={22}
          color="#390492"
        />
      </TouchableOpacity>

      {open && <View style={styles.body}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "white",
    marginTop: 20,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#390492",
  },
  body: {
    marginTop: 16,
  },
});

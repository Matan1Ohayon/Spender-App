import { Slot } from "expo-router";
import React, { useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import LoadingScreen from "./screens/LoadingScreen";
import { ExpensesProvider } from "@/contexts/ExpensesContext";


export default function Layout() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <LoadingScreen onFinish={() => setIsLoading(false)} />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ExpensesProvider>
        <Slot />
      </ExpensesProvider>
    </GestureHandlerRootView>
  );
}

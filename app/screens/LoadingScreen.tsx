import React, { useEffect, useRef } from "react";
import { Animated, Image, View } from "react-native";
import { loadingStyles as styles } from "../../styles/LoadingScreen";

type LoadingProps = {
  onFinish: () => void;
};

export default function LoadingScreen({ onFinish }: LoadingProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim, alignItems: "center" }}>
      <Image source={require("@/assets/images/Theme.png")} style={styles.logo} />
      </Animated.View>
    </View>
  );
}

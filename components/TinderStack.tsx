import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");
const SWIPE_THRESHOLD = width * 0.25;

interface SwipeableCardProps {
  item: any;
  index: number;
  renderCard: (item: any, isEditing?: boolean) => React.ReactNode;
  onSwipeOut?: () => void;
  scale: SharedValue<number>;
  translateY: SharedValue<number>;
  isEditing?: boolean;
  position?: SharedValue<number>;
}

function SwipeableCard({ item, index, renderCard, onSwipeOut, scale, translateY, isEditing = false, position: externalPosition }: SwipeableCardProps) {
  const internalPosition = useSharedValue(0);
  const position = externalPosition || internalPosition;
  const startX = useSharedValue(0);
  const opacity = useSharedValue(1);
  
  // Show labels only for top card
  const shouldShowLabels = index === 0 && !isEditing;

  const panGesture = Gesture.Pan()
    .enabled(index === 0 && !isEditing) // רק הכרטיס הראשון יכול להיות נגרר, ולא כשעורכים
    .onStart(() => {
      startX.value = position.value;
    })
    .onUpdate((e) => {
      position.value = startX.value + e.translationX;
    })
    .onEnd((e) => {
      if (Math.abs(position.value) > SWIPE_THRESHOLD) {
        // קורא ל-onSwipeOut מיד - לא מחכה שהאנימציה תסתיים
        if (onSwipeOut) {
          runOnJS(onSwipeOut)();
        }
        
        // אנימציה חלקה של ה-swipe החוצה - בסגנון iOS
        const targetX = position.value > 0 ? width * 1.5 : -width * 1.5;
        position.value = withSpring(
          targetX,
          {
            damping: 25,
            stiffness: 200,
            velocity: e.velocityX,
          }
        );
        // אנימציה חלקה של ה-opacity - הכרטיס נעלם בצורה אלגנטית
        opacity.value = withSpring(0, {
          damping: 30,
          stiffness: 250,
        });
      } else {
        // אנימציה חלקה של החזרה למקום - בסגנון iOS
        position.value = withSpring(0, {
          damping: 30,
          stiffness: 250,
        });
        // ודא שה-opacity נשאר 1
        opacity.value = 1;
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    // אינטרפולציה חלקה יותר של הרוטציה - פחות חדה, יותר טבעית
    const rotation = interpolate(
      position.value,
      [-width, 0, width],
      [-12, 0, 12], // פחות רוטציה = יותר טבעי
      'clamp' // מונע ערכים קיצוניים
    );
    
    return {
      transform: [
        { translateX: position.value },
        { rotate: `${rotation}deg` },
      ],
      opacity: opacity.value, // אנימציה חלקה של ה-opacity
    };
  });

  // ⭐ RIGHT LABEL ⭐
const rightLabelStyle = useAnimatedStyle(() => {
  return {
    opacity: interpolate(
      position.value,
      [0, width * 0.4],
      [0, 1],
      "clamp"
    ),
  };
});


// ⭐ LEFT LABEL ⭐
const leftLabelStyle = useAnimatedStyle(() => {
  return {
    opacity: interpolate(
      position.value,
      [-width * 0.4, 0],
      [1, 0],
      "clamp"
    ),
  };
});

  // Scale + translate stack עם אנימציה חלקה
  const stackStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: scale.value,
        },
        {
          translateY: translateY.value,
        },
      ],
      opacity: 1, // כל הכרטיסים לא שקופים
    };
  });

  return (
    <>
      {/* RIGHT LABEL - מחוץ לכרטיס, בצד ימין של המסך */}
      {shouldShowLabels && (
        <Animated.View style={[styles.labelRight, rightLabelStyle]}>
          <Text style={styles.labelTextRight}>WORTH IT</Text>
        </Animated.View>
      )}

      {/* LEFT LABEL - מחוץ לכרטיס, בצד שמאל של המסך */}
      {shouldShowLabels && (
        <Animated.View style={[styles.labelLeft, leftLabelStyle]}>
          <Text style={styles.labelTextLeft}>TOTAL WASTE</Text>
        </Animated.View>
      )}

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[styles.cardContainer, stackStyle, animatedStyle]}
          pointerEvents="auto"
        >
          {renderCard(item, isEditing)}
        </Animated.View>
      </GestureDetector>
    </>
  );
}

interface TinderStackProps {
  data: any[];
  renderCard: (item: any, isEditing?: boolean) => React.ReactNode;
  isEditing?: boolean;
}

export default function TinderStack({ data, renderCard, isEditing = false }: TinderStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Position shared value עבור הכרטיס הראשון - משמש ל-overlay
  const topCardPosition = useSharedValue(0);
  
  // Shared values לכל כרטיס - מאפשרים אנימציה חלקה
  const scales = [
    useSharedValue(1),
    useSharedValue(0.95),
    useSharedValue(0.9),
  ];
  
  const translateYs = [
    useSharedValue(0),
    useSharedValue(25),
    useSharedValue(45),
  ];

  function removeTopCard() {
    // מעדכן את ה-index מיד - כך שהכרטיס השני יהיה נגיש מיד
    setCurrentIndex((prev) => prev + 1);
    // מאפס את ה-position כדי שה-overlay יחזור להיות שקוף
    topCardPosition.value = 0;
  }

  // מעדכן את ה-shared values מיד כשהכרטיסים משתנים
  useEffect(() => {
    // אנימציה מהירה מאוד - הכרטיסים הבאים עולים מיד
    const springConfig = {
      damping: 20,
      stiffness: 500,
      mass: 0.4,
    };
    
    // אנימציה מסונכרנת ומהירה מאוד של כל הכרטיסים
    scales[0].value = withSpring(1, springConfig);
    scales[1].value = withSpring(0.95, springConfig);
    scales[2].value = withSpring(0.9, springConfig);
    
    translateYs[0].value = withSpring(0, springConfig);
    translateYs[1].value = withSpring(25, springConfig);
    translateYs[2].value = withSpring(45, springConfig);
  }, [currentIndex]);

  // לוקח את 3 הכרטיסים הבאים להצגה
  const visibleCards = data.slice(currentIndex, currentIndex + 3);

  // Overlay style - מתכהה כשמגררים את הכרטיס
  const overlayStyle = useAnimatedStyle(() => {
    const rightOpacity = interpolate(
      topCardPosition.value,
      [0, width * 0.3],
      [0, 0.7],
      "clamp"
    );
    const leftOpacity = interpolate(
      topCardPosition.value,
      [-width * 0.3, 0],
      [0.7, 0],
      "clamp"
    );
    
    return {
      opacity: Math.max(rightOpacity, leftOpacity),
    };
  });

  // אם אין כרטיסים, מחזיר container ריק
  if (visibleCards.length === 0) {
    return <View style={styles.container} />;
  }

  return (
    <>
      {/* DARK OVERLAY - מתכהה כשמגררים - מכסה את כל המסך */}
      {!isEditing && (
        <Animated.View style={[styles.darkOverlay, overlayStyle]} pointerEvents="none" />
      )}
      
      <View style={styles.container}>
        {visibleCards.slice().reverse().map((item, mapIndex) => {
        // אחרי reverse(), visibleCards[0] הוא האחרון ב-map (למעלה)
        // mapIndex 0 = visibleCards[2] (השלישי במערך המקורי) -> צריך להיות index 2 (למטה)
        // mapIndex 1 = visibleCards[1] (השני במערך המקורי) -> צריך להיות index 1 (אמצע)
        // mapIndex 2 = visibleCards[0] (הראשון במערך המקורי) -> צריך להיות index 0 (למעלה)
        const stackIndex = visibleCards.length - 1 - mapIndex;
        return (
          <SwipeableCard
            key={item.id}
            item={item}
            index={stackIndex}
            renderCard={renderCard}
            onSwipeOut={stackIndex === 0 ? removeTopCard : undefined}
            scale={scales[stackIndex]}
            translateY={translateYs[stackIndex]}
            isEditing={isEditing}
            position={stackIndex === 0 ? topCardPosition : undefined}
          />
        );
      })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 500,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cardContainer: {
    position: "absolute",
    width: "100%",
    alignSelf: "center",
  },
  darkOverlay: {
    position: "absolute",
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    width: width + 2000,
    height: height + 2000,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    zIndex: 500, // מאחורי התוויות אבל מעל הכרטיסים
  },
  labelRight: {
    position: "absolute",
    right: 0,
    top: "50%",
    marginTop: -40, // מרכז אנכי (חצי גובה התווית)
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderWidth: 3,
    borderColor: "#4CAF50",
    borderRadius: 10,
    transform: [{ rotate: "90deg" }],
    backgroundColor: "rgba(255,255,255,0.95)",
    zIndex: 1000,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  labelTextRight: {
    color: "#4CAF50",
    fontSize: 18,
    fontWeight: "800",
  },
  
  labelLeft: {
    position: "absolute",
    left: 0,
    top: "50%",
    marginTop: -40, // מרכז אנכי (חצי גובה התווית)
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderWidth: 3,
    borderColor: "#E53935",
    borderRadius: 10,
    transform: [{ rotate: "-90deg" }],
    backgroundColor: "rgba(255,255,255,0.95)",
    zIndex: 1000,
    shadowColor: "#E53935",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  labelTextLeft: {
    color: "#E53935",
    fontSize: 18,
    fontWeight: "800",
  },
  
});

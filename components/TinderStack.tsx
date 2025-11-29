import React, { useEffect, useMemo, useState } from "react";
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
  onSwipeOut?: (direction: 'left' | 'right') => void;
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
  
  const shouldShowLabels = index === 0 && !isEditing;

  const panGesture = Gesture.Pan()
    .enabled(index === 0 && !isEditing) 
    .onStart(() => {
      startX.value = position.value;
    })
    .onUpdate((e) => {
      position.value = startX.value + e.translationX;
    })
    .onEnd((e) => {
      if (Math.abs(position.value) > SWIPE_THRESHOLD) {
        const direction: 'left' | 'right' = position.value > 0 ? 'right' : 'left';
        if (onSwipeOut) {
          runOnJS(onSwipeOut)(direction);
        }
        
        const targetX = position.value > 0 ? width * 1.5 : -width * 1.5;
        position.value = withSpring(
          targetX,
          {
            damping: 25,
            stiffness: 200,
            velocity: e.velocityX,
          }
        );
        opacity.value = withSpring(0, {
          damping: 30,
          stiffness: 250,
        });
      } else {
        position.value = withSpring(0, {
          damping: 30,
          stiffness: 250,
        });
        opacity.value = 1;
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      position.value,
      [-width, 0, width],
      [-12, 0, 12], 
      'clamp' 
    );
    
    return {
      transform: [
        { translateX: position.value },
        { rotate: `${rotation}deg` },
      ],
      opacity: opacity.value, 
    };
  });

  // RIGHT LABEL
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


// LEFT LABEL
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
      opacity: 1, 
    };
  });

  return (
    <>
      {shouldShowLabels && (
        <Animated.View style={[styles.labelRight, rightLabelStyle]}>
          <Text style={styles.labelTextRight}>WORTH IT</Text>
        </Animated.View>
      )}

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
  onSwipe?: (direction: 'left' | 'right', item: any) => void;
}

export default function TinderStack({ data, renderCard, isEditing = false, onSwipe }: TinderStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const topCardPosition = useSharedValue(0);
  
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
  

  const filteredData = useMemo(() => {
    return data.filter((item: any) => !item.type || item.type === "");
  }, [data]);
  

  useEffect(() => {
    if (currentIndex >= filteredData.length) {
      setCurrentIndex(0);
    }
    if (filteredData.length === 0) {
      setCurrentIndex(0);
    }

  }, [filteredData.length, currentIndex]);
  
  function removeTopCard(direction: 'left' | 'right') {
    const currentItem = filteredData[currentIndex];
    topCardPosition.value = 0;
    
    if (onSwipe && currentItem) {
      onSwipe(direction, currentItem);
    }
  }

  useEffect(() => {
    const springConfig = {
      damping: 20,
      stiffness: 500,
      mass: 0.4,
    };
    
    scales[0].value = withSpring(1, springConfig);
    scales[1].value = withSpring(0.95, springConfig);
    scales[2].value = withSpring(0.9, springConfig);
    
    translateYs[0].value = withSpring(0, springConfig);
    translateYs[1].value = withSpring(25, springConfig);
    translateYs[2].value = withSpring(45, springConfig);
  }, [currentIndex]);

  const visibleCards = filteredData.slice(currentIndex, currentIndex + 3);

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

  if (visibleCards.length === 0) {
    return <View style={styles.container} />;
  }

  return (
    <>
      {!isEditing && (
        <Animated.View style={[styles.darkOverlay, overlayStyle]} pointerEvents="none" />
      )}
      
      <View style={styles.container}>
        {visibleCards.slice().reverse().map((item, mapIndex) => {
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
    zIndex: 500, 
  },
  labelRight: {
    position: "absolute",
    right: 0,
    top: "50%",
    marginTop: -40, 
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
    marginTop: -40,
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

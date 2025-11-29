import React from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface RingProps {
  size: number;
  strokeWidth: number;
  progress: number; 
  colorFilled?: string;
  colorEmpty?: string;
}

export default function DualToneProgressRing({
  size,
  strokeWidth,
  progress,
  colorFilled = "#390492",
  colorEmpty = "#efe7ff",
}: RingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const filledLength = (progress / 100) * circumference;
  const emptyLength = circumference - filledLength;

  return (
    <View>
      <Svg width={size} height={size}>
        <Circle
          stroke={colorEmpty}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference}`}
          strokeLinecap="round"
        />

        {progress > 0 && (
          <Circle
            stroke={colorFilled}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={`${filledLength} ${circumference}`}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        )}
      </Svg>
    </View>
  );
}

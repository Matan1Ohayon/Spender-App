import { Dimensions, PixelRatio } from "react-native";



const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const BASE_WIDTH = 430;
const BASE_HEIGHT = 932;

const horizontalScale = SCREEN_WIDTH / BASE_WIDTH;
const verticalScale = SCREEN_HEIGHT / BASE_HEIGHT;

const rawScale = Math.min(horizontalScale, verticalScale);

const clampedScale = Math.min(Math.max(rawScale, 0.9), 1.15);

function moderateScale(size: number, factor = 0.5): number {
  const scaled = size + (size * (clampedScale - 1)) * factor;
  return PixelRatio.roundToNearestPixel(scaled);
}


export function scaleSize(size: number): number {
  return moderateScale(size, 0.7); 
}

export function scaleFont(size: number): number {
  return moderateScale(size, 0.4);
}


import { Dimensions, PixelRatio } from "react-native";

// ------------------------------------------------------------------
// מטרה:
// לשמור את העיצוב כפי שבנית על iPhone 15 Plus,
// אבל לעשות התאמה עדינה למסכים קטנים / גדולים יותר
// בלי לפוצץ את כל ה־UI.
// ------------------------------------------------------------------

// גודל המסך בפועל
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// מידות הבסיס שעליהן בנית את העיצוב (iPhone 15 Plus בערך)
const BASE_WIDTH = 430;
const BASE_HEIGHT = 932;

// יחס אופקי ואנכי
const horizontalScale = SCREEN_WIDTH / BASE_WIDTH;
const verticalScale = SCREEN_HEIGHT / BASE_HEIGHT;

// נשתמש ב־scale שמרני יותר (הקטן מבין השניים)
const rawScale = Math.min(horizontalScale, verticalScale);

/**
 * הגבלה חכמה:
 * - מינימום 0.9 → במסכים ממש קטנים לא למעוך יותר מדי
 * - מקסימום 1.15 → במסכים גדולים לא לנפח יותר מדי
 */
const clampedScale = Math.min(Math.max(rawScale, 0.9), 1.15);

/**
 * פונקציה עדינה יותר (moderate scale):
 * לא כל הגודל מוכפל 1:1, רק חלק מההבדל.
 * factor:
 *  - 1   → התאמה מלאה (size * clampedScale)
 *  - 0.5 → התאמה עדינה יותר (מומלץ לרוב ה־UI)
 */
function moderateScale(size: number, factor = 0.5): number {
  const scaled = size + (size * (clampedScale - 1)) * factor;
  return PixelRatio.roundToNearestPixel(scaled);
}

/**
 * רלוונטי עבור:
 * width, height, margin, padding, borderRadius, icons
 *
 * שומר על העיצוב מאוד דומה למסך הבסיס,
 * אבל נותן התאמה עדינה למסכים שונים.
 */
export function scaleSize(size: number): number {
  return moderateScale(size, 0.7); // טיפה יותר אגרסיבי מלפונטים
}

/**
 * רלוונטי *רק* עבור fontSize
 *
 * כאן אנחנו עוד יותר עדינים, כדי שלא יהיו פערים קיצוניים
 * בין מכשירים קטנים לגדולים.
 */
export function scaleFont(size: number): number {
  return moderateScale(size, 0.4);
}


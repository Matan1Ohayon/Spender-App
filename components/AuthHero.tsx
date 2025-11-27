import { scaleFont, scaleSize } from "@/utils/scale";
import { Ionicons } from "@expo/vector-icons";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";

const PRIMARY = "#390492";
const LIGHT_BG = "#efe7ff";
const LOGO = require("../assets/images/Theme.png");

type TitleVariant = "large" | "medium";

interface AuthHeroProps {
    title: string;
    subtitle?: string;
    showLogo?: boolean;
    titleVariant?: TitleVariant;
    showBackButton?: boolean;
    onBackPress?: () => void;
}

export default function AuthHero({
    title,
    subtitle,
    showLogo = true,
    titleVariant = "large",
    showBackButton = false,
    onBackPress,
}: AuthHeroProps) {
    const screenWidth = Dimensions.get("window").width;
    const heroHeight = Math.max(scaleSize(320), Dimensions.get("window").height * 0.33);
    const diagonalDepth = scaleSize(50);
    const clampedDiagonal = Math.min(diagonalDepth, heroHeight * 0.45);
    const path = `M0 0 H${screenWidth} V${heroHeight} L0 ${heroHeight - clampedDiagonal} Z`;
    const titleStyle = titleVariant === "large" ? styles.titleLarge : styles.titleMedium;

    return (
        <View style={[styles.heroContainer, { height: heroHeight }]}>
            <Svg width={screenWidth} height={heroHeight} style={styles.heroSvg} preserveAspectRatio="none">
                <Path d={path} fill={PRIMARY} />
            </Svg>

            {showBackButton && (
                <TouchableOpacity style={styles.backButton} onPress={onBackPress} hitSlop={20}>
                    <Ionicons name="arrow-back" size={scaleSize(28)} color="white" />
                </TouchableOpacity>
            )}

            <View style={styles.heroContent}>
                {showLogo && <Image source={LOGO} style={styles.logo} />}
                <Text style={[styles.titleBase, titleStyle]} numberOfLines={2}>
                    {title}
                </Text>
                {subtitle && (
                    <Text style={styles.subtitle} numberOfLines={2}>
                        {subtitle}
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    heroContainer: {
        width: "100%",
        overflow: "hidden",
        backgroundColor: LIGHT_BG,
        marginBottom: scaleSize(25),
    },
    heroSvg: {
        position: "absolute",
        top: 0,
        left: 0,
    },
    heroContent: {
        flex: 1,
        paddingHorizontal: scaleSize(28),
        paddingTop: scaleSize(80),
        justifyContent: "flex-start",
    },
    logo: {
        width: scaleSize(120),
        height: scaleSize(120),
        position: "absolute",
        top: scaleSize(20),
        right: scaleSize(20),
        resizeMode: "contain",
        opacity: 0.9,
    },
    titleBase: {
        color: LIGHT_BG,
        fontFamily: "DMSans_700Bold",
        fontWeight: "900",
        textShadowColor: "rgba(0,0,0,0.15)",
        textShadowRadius: 8,
        marginTop: scaleSize(40),
    },
    titleLarge: {
        fontSize: scaleFont(64),
        lineHeight: scaleFont(64),
    },
    titleMedium: {
        fontSize: scaleFont(46),
        lineHeight: scaleFont(48),
    },
    subtitle: {
        marginTop: scaleSize(12),
        color: "rgba(255,255,255,0.9)",
        fontSize: scaleFont(20),
        fontFamily: "DMSans_500Medium",
    },
    backButton: {
        position: "absolute",
        top: scaleSize(60),
        left: scaleSize(20),
        zIndex: 5,
    },
});


import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
    Image,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import ErrorMessage from "../../../components/ErrorMessage";


const PRIMARY = "#390492";
const ACCENT = "#8b73ff";
const LIGHT_BG = "#efe7ff";



export default function Otp() {

  const { phone , page } = useLocalSearchParams();

  const beforePage = page;

  const maskedPhone = phone
    ? phone.slice(0, 3) + "-" + phone.slice(3, 5) + "*****"
    : "";

  const length = 6;

  const [otp, setOtp] = useState(Array(length).fill(""));
  const inputsRef = useRef<(TextInput | null)[]>([]);

  const [error, setError] = useState("");

  
  const verifyOtp = () => {
    const code = otp.join("");

    if (code.length !== 6) {
      setError("Please enter all 6 digits");
      setTimeout(() => setError(""), 3000);
      return;
    }
   // 🔥 OTP קבוע – 123456
   if (code === "123456") {
    if (beforePage === "login" || beforePage === "register") {
      router.replace("/screens/home/homePage");
    } else {
      router.push({
        pathname: "/screens/auth/resetPass_2",
        params: { phone },
      });
    }
  } else {
    setError("Wrong OTP");
    setTimeout(() => setError(""), 3000);
  }
};

  // שינוי של ספרה
  const handleChange = (text: string, index: number) => {
    if (text.length > 1) {
      const cleaned = text.replace(/\D/g, "");
  
      if (cleaned.length === length) {
        const newOtp = cleaned.split("");
        setOtp(newOtp);
        Keyboard.dismiss();
        return;
      }
    }
  
    if (/^\d$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
  
      if (index < length - 1) {
        inputsRef.current[index + 1]?.focus();
      } else {
        Keyboard.dismiss();
      }
    }
  };
  

  // Backspace → חזרה אחורה
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace") {
      if (otp[index] !== "") {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else {
        if (index > 0) {
          inputsRef.current[index - 1]?.focus();
  
          const newOtp = [...otp];
          newOtp[index - 1] = "";
          setOtp(newOtp);
        }
      }
    }
  };
  

  return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>

                <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => router.back()}
                >
                <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>

                <View style={styles.topSection}>
                <View style={styles.logoContainer}>
                    <Image
                    source={require("../../../assets/images/Theme.png")}
                    style={styles.logo}
                    /> 
                    <Text style={styles.greeting}>We’re almost done</Text>
                </View>
                </View>

                <View style={styles.bottomSection}>
                <Text style={styles.title}>Verify your phone</Text>

                <Text style={styles.subtitle}>We sent a code to {maskedPhone}</Text>
                <Text style={styles.subtitle}>Enter the 6-digit code we sent you</Text>

                {/* OTP BOXES */}
                <View style={styles.boxRow}>
                    {otp.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={(el) => { inputsRef.current[index] = el; }}
                        value={digit}
                        onChangeText={(txt) => handleChange(txt, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        keyboardType="number-pad"
                        maxLength={1}
                        autoFocus={index === 0}
                        style={styles.otpBox}
                    />
                    ))}
                </View>
                    
                {error !== "" && <ErrorMessage message={error} />}

                <TouchableOpacity style={styles.button} onPress={verifyOtp}>
                    <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>

                <TouchableOpacity>
                    <Text style={styles.resend}>Resend code</Text>
                </TouchableOpacity>

                </View>

            </View>
        </TouchableWithoutFeedback> 
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },

  backButton: {
    position: "absolute",
    top: 60,
    left: 25,
    zIndex: 50,  
    padding: 8,
  },

  topSection: {
    backgroundColor: PRIMARY,
    height: "40%",
    width: "100%",
    marginTop: -70,
    paddingTop: 70,
    paddingLeft: 25,
    transform: [{ skewY: "10deg" }],
    overflow: "hidden",
  },
  logo: {
    width: 100,
    height: 100,
    position: "absolute",
    top: 20,
    right: 25,
    zIndex: 10,
  },
  logoContainer: {
    transform: [{ skewY: "-10deg" }],
  },
  greeting: {
    fontSize: 50,
    fontFamily: "DMSans_700Bold",
    fontWeight: "700",
    color: LIGHT_BG,
    textShadowColor: LIGHT_BG,
    textShadowRadius: 5,
    marginBottom: 40,
    marginTop: 120,
  },

  bottomSection: {
    marginTop: 50,
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 32,
    fontFamily: "DMSans_700Bold",
    color: PRIMARY,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "DMSans_400Regular",
    color: PRIMARY,
    marginBottom: 15,
  },
  boxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  otpBox: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: PRIMARY,
    borderRadius: 12,
    textAlign: "center",
    fontFamily: "DMSans_700Bold",
    fontSize: 28,
    color: PRIMARY,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 30,
  },
  buttonText: {
    color: "white",
    fontFamily: "DMSans_700Bold",
    fontSize: 18,
  },
  resend: {
    marginTop: 20,
    color: PRIMARY,
    textAlign: "center",
    fontFamily: "DMSans_400Regular",
  },
});

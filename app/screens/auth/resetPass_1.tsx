import { db } from "@/firebase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useRef, useState } from "react";
import {
    Image,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import ErrorMessage from "../../../components/ErrorMessage";


const PRIMARY = "#390492";
const ACCENT = "#8b73ff";
const LIGHT_BG = "#efe7ff";

function validateReset(phone: string) {
    // Phone validations
    if (!phone || phone == "") return "Phone number is required.";
    if (!/^\d{10}$/.test(phone)) return "Phone number must contain exactly 10 digits.";
  
    return null; // validation OK
  }

export default function resetPass_1() {

    const page = "reset1";

    const [phone, setPhone] = useState("");
  
    const [error, setError] = useState("");
  
    const phoneRef = useRef<TextInput>(null);

    async function handleReset() {
        const err = validateReset(phone);
        if (err) {
            setError(err);
            setTimeout(() => setError(""), 3500);
            return;
        }
        setError(""); 

        try {
            const userRef = doc(db, "users", phone);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                setError("Phone not found");
                return;
            }
            console.log("Reset 1 ok");
            router.push({
                pathname: "/screens/auth/otp",
                params: { phone, page }
            });
        } catch (e) {
            console.log("Reset error:", e);
            setError("Reset failed");
        }
      }

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
            <Text style={styles.greeting}>Let's reset your password</Text>
          </View>
        </View>

        <View style={styles.bottomSection}>
          
          <TextInput
            ref={phoneRef}
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor={PRIMARY}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={10}
            returnKeyType="next"
            onSubmitEditing={handleReset}
          />

          {error !== "" && <ErrorMessage message={error} />}


          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetText}>Send code</Text>
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
  input: {
    borderBottomWidth: 2,
    borderBottomColor: PRIMARY,
    paddingVertical: 14,
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    marginBottom: 25,
    color: PRIMARY,
  },
  resetButton: {
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 25,
  },

  resetText: {
    color: "white",
    fontFamily: "DMSans_700Bold",
    fontSize: 18,
  },

});

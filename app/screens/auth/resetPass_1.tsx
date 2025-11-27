import { db } from "@/firebase";
import { router } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useRef, useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { scaleFont, scaleSize } from "@/utils/scale";
import ErrorMessage from "../../../components/ErrorMessage";
import AuthHero from "@/components/AuthHero";


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
    const [loading, setLoading] = useState(false);

  
    const phoneRef = useRef<TextInput>(null);

    async function handleReset() {
        const err = validateReset(phone);
        if (err) {
            setError(err);
            setTimeout(() => setError(""), 3500);
            return;
        }
        setError(""); 
        setLoading(true);

        try {

            const cleanPhone = phone.trim();

            const userRef = doc(db, "users", cleanPhone);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                setError("Phone number not found.");
                setLoading(false);
                return;
            }

            setLoading(false);
            router.push({
                pathname: "/screens/auth/otp",
                params: { phone : cleanPhone, page }
            });
        } catch (e) {
            console.log("Reset error:", e);
            setError("Something went wrong.");
            setLoading(false);
        }
      }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>

        <AuthHero
          title="Let's reset your password"
          titleVariant="medium"
          showBackButton
          onBackPress={() => router.back()}
        />

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

            <TouchableOpacity
                style={[styles.resetButton, loading && { opacity: 0.6 }]}
                onPress={!loading ? handleReset : undefined}
                disabled={loading}
            >
                <Text style={styles.resetText}>
                    {loading ? "Processing..." : "Send code"}
                </Text>
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

  bottomSection: {
    marginTop: scaleSize(-10),
    paddingHorizontal: scaleSize(30),
  },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: PRIMARY,
    paddingVertical: scaleSize(14),
    fontFamily: "DMSans_400Regular",
    fontSize: scaleFont(16),
    marginBottom: scaleSize(25),
    color: PRIMARY,
  },
  resetButton: {
    backgroundColor: PRIMARY,
    paddingVertical: scaleSize(14),
    borderRadius: scaleSize(20),
    alignItems: "center",
    marginTop: scaleSize(25),
  },

  resetText: {
    color: "white",
    fontFamily: "DMSans_700Bold",
    fontSize: scaleFont(18),
  },

});

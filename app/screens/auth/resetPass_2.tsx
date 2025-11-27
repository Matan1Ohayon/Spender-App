import AuthHero from "@/components/AuthHero";
import { db } from "@/firebase";
import { scaleFont, scaleSize } from "@/utils/scale";
import bcrypt from "bcryptjs";
import { router, useLocalSearchParams } from "expo-router";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
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
import ErrorMessage from "../../../components/ErrorMessage";
import PasswordInput from "../../../components/PasswordInput";


const PRIMARY = "#390492";
const ACCENT = "#8b73ff";
const LIGHT_BG = "#efe7ff";

function validateReset(pass: string, confirm: string) {
  
    // Password validations
    if (!pass) return "Password is required.";
    if (!/^\d{6}$/.test(pass)) return "Password must contain exactly 6 digits.";

    // Confirm password
    if (!confirm) return "Please confirm your password.";
    if (pass !== confirm) return "Passwords do not match.";
    
    return null; // Everything is valid
  }

export default function resetPass_2() {

    const { phone } = useLocalSearchParams();    
    
    const [pass, setPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");

    const passwordRef = useRef<TextInput>(null);
    const confirmRef = useRef<TextInput>(null);

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);


    async function handleReset() {
      const err = validateReset(pass, confirmPass);
      if (err) {
        setError(err);
        setTimeout(() => setError(""), 3500);
        return;
      }
      setError("");
      setLoading(true);

        
      try {
        const phoneNumber = String(phone);
        
        const saltRounds = 10;
        const hashed = await bcrypt.hash(pass,saltRounds )
        
        const userRef = doc(db, "users", phoneNumber);
        
        await updateDoc(userRef, {
          password: hashed,
          updated_at: serverTimestamp(),
        });

        console.log("LOGIN OK:", phoneNumber);
        router.replace({
          pathname : "/screens/home/homePage",
          params: { phone : phoneNumber }
        });


      } catch (err) {
          console.log(err);
          setError("Something went wrong.");
          setLoading(false);
      }
      
    }

  
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>

          <AuthHero title="Choose your new password" titleVariant="medium" />
  
          {/* תחתית רכה */}
          <View style={styles.bottomSection}>

            <PasswordInput
                ref={passwordRef}
                placeholder="Password"
                value={pass}
                onChangeText={setPass}
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
            />

            <PasswordInput
                ref={confirmRef}
                placeholder="Confirm Password"
                value={confirmPass}
                onChangeText={setConfirmPass}
                returnKeyType="done"
                onSubmitEditing={handleReset}
            />
  
            {error !== "" && <ErrorMessage message={error} />}

            <TouchableOpacity
              style={[styles.loginButton, loading && { opacity: 0.6 }]}
              onPress={!loading ? handleReset : undefined}
              disabled={loading}
            >
              <Text style={styles.loginText}>
                {loading ? "Updating..." : "Reset Password"}
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
  
    // החלק העליון האלכסוני
    bottomSection: {
      marginTop: scaleSize(-10),
      paddingHorizontal: scaleSize(30),
    },

  
    loginButton: {
      backgroundColor: PRIMARY,
      paddingVertical: scaleSize(14),
      borderRadius: scaleSize(20),
      alignItems: "center",
      marginTop: scaleSize(25),
    },
  
    loginText: {
      color: "white",
      fontFamily: "DMSans_700Bold",
      fontSize: scaleFont(18),
    },

  });
  
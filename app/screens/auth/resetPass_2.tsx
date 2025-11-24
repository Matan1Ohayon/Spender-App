import { db } from "@/firebase";
import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
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


    async function handleReset() {
      const err = validateReset(pass, confirmPass);
      if (err) {
        setError(err);
        setTimeout(() => setError(""), 3500);
        return;
      }
      setError("");
        
      try {
        const phoneNumber = String(phone);
        const userRef = doc(db, "users", phoneNumber);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          setError("Phone not found");
          return;
        }
        
        await updateDoc(userRef, {
          password: pass,
          updated_at: serverTimestamp(),
        });
        
        console.log("reset 2 OK");
        router.replace("/screens/home/homePage");


      } catch (error) {
          console.log("Error saving user:", error);
      }
      
    }

  
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
  
          <View style={styles.topSection}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../../../assets/images/Theme.png")}
                style={styles.logo}
              /> 
              <Text style={styles.greeting}>Choose your new password</Text>
            </View>
          </View>
  
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

            <TouchableOpacity style={styles.loginButton} onPress={handleReset}>
              <Text style={styles.loginText}>Reset Password</Text>
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
      fontWeight: "900",
      color: LIGHT_BG,
      textShadowColor: LIGHT_BG,
      textShadowRadius: 5,
      marginBottom: 5,
      marginTop: 115,
    },
  
    bottomSection: {
      marginTop: 50,
      paddingHorizontal: 30,
    },

  
    loginButton: {
      backgroundColor: PRIMARY,
      paddingVertical: 14,
      borderRadius: 20,
      alignItems: "center",
      marginTop: 25,
    },
  
    loginText: {
      color: "white",
      fontFamily: "DMSans_700Bold",
      fontSize: 18,
    },

  });
  
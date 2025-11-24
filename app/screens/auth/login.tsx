import { db } from "@/firebase";
import { Link, router } from "expo-router";
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
import PasswordInput from "../../../components/PasswordInput";


const PRIMARY = "#390492";
const ACCENT = "#8b73ff";
const LIGHT_BG = "#efe7ff";



function getGreeting() {
  const hour = new Date().getHours();
  if (hour > 4 && hour < 12) return "Good morning!";
  if (hour >= 12 && hour < 18) return "Good afternoon!";
  if (hour >= 18 && hour < 24) return "Good evening!";
  return "Good  night!";
}

function validateLogin(phone: string, pass: string) {
  // Phone validations
  if (!phone || phone == "") return "Phone number is required.";
  if (!/^\d{10}$/.test(phone)) return "Phone number must contain exactly 10 digits.";

  // Password validations
  if (!pass) return "Password is required.";
  if (!/^\d{6}$/.test(pass)) return "Password must contain exactly 6 digits.";

  return null; // validation OK
}


export default function Login() {

  const page = "login";

  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");

  const [error, setError] = useState("");

  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);



  async function handleLogin() {
    const err = validateLogin(phone, pass);
    if (err) {
      setError(err);
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      const userRef = doc(db, "users", phone);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setError("Phone not found");
        return;
      }

      const user = userSnap.data();

      if (user.password !== pass) {
        setError("Incorrect password");
        return;
      }

      console.log("Login success!");
      router.push({
        pathname: "/screens/auth/otp",
        params: { phone, page }
      });

    } catch (e) {
      console.log("Login error:", e);
      setError("Login failed");
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
            <Text style={styles.greeting}>{getGreeting()}</Text>
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
            onSubmitEditing={() => passwordRef.current?.focus()}
          />

          <PasswordInput
            ref={passwordRef}
            placeholder="Password"
            value={pass}
            onChangeText={setPass}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          {error !== "" && <ErrorMessage message={error} />}


          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>

          <Text style={styles.signupText}>
            Forgot your password?{" "}
            <Link href="/screens/auth/resetPass_1" style={styles.signupLink}>Reset here</Link>
          </Text>

          <Text style={styles.signupText}>
            Don’t have an account?{" "}
            <Link href="/screens/auth/register" style={styles.signupLink}>Sign up</Link>
          </Text>

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
    fontSize: 70,
    fontFamily: "DMSans_700Bold",
    fontWeight: "900",
    color: LIGHT_BG,
    textShadowColor: LIGHT_BG,
    textShadowRadius: 5,
    marginBottom: 40,
    marginTop: 70,
  },

  brand: {
    fontSize: 34,
    fontFamily: "DMSans_700Bold",
    color: "white",
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

  signupText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 15,
    color: PRIMARY,
    fontFamily: "DMSans_400Regular",
  },

  signupLink: {
    color: ACCENT,
    fontFamily: "DMSans_700Bold",
  }
});

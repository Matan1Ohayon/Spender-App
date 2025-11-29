import AuthHero from "@/components/AuthHero";
import { db } from "@/firebase";
import { scaleFont, scaleSize } from "@/utils/scale";
import bcrypt from "bcryptjs";
import { Link, router } from "expo-router";
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
  if (!phone || phone == "") return "Phone number is required.";
  if (!/^\d{10}$/.test(phone)) return "Phone number must contain exactly 10 digits.";

  if (!pass) return "Password is required.";
  if (!/^\d{6}$/.test(pass)) return "Password must contain exactly 6 digits.";

  return null;
}

export default function Login() {
  const page = "login";

  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  async function handleLogin() {
    const err = validateLogin(phone, pass);
    if (err) {
      setError(err);
      setTimeout(() => setError(""), 3000);
      return;
    }
    setError("");

    setLoading(true);

    try {
      const cleanPhone = phone.trim();
      const userRef = doc(db, "users", cleanPhone);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setLoading(false);
        setError("Phone not found.");
        return;
      }

      const user = userSnap.data();
      const match = await bcrypt.compare(pass, user.password);

      if (!match) {
        setLoading(false);
        setError("Incorrect password.");
        return;
      }

      console.log("LOGIN OK:", cleanPhone);

      router.push({
        pathname: "/screens/auth/otp",
        params: { phone: cleanPhone, page },
      });
    } catch (e) {
      console.log("LOGIN FAIL:", e);
      setLoading(false);
      setError("Something went wrong.");
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <AuthHero title={getGreeting()} />

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

          <TouchableOpacity
            style={[styles.loginButton, loading && { opacity: 0.6 }]}
            onPress={!loading ? handleLogin : undefined}
            disabled={loading}
          >
            <Text style={styles.loginText}>
              {loading ? "Processing..." : "Login"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.signupText}>
            Forgot your password?{" "}
            <Link href="/screens/auth/resetPass_1" style={styles.signupLink}>
              Reset here
            </Link>
          </Text>

          <Text style={styles.signupText}>
            Don’t have an account?{" "}
            <Link href="/screens/auth/register" style={styles.signupLink}>
              Sign up
            </Link>
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

  bottomSection: {
    marginTop: scaleSize(-20),
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

  signupText: {
    marginTop: scaleSize(20),
    textAlign: "center",
    fontSize: scaleFont(15),
    color: PRIMARY,
    fontFamily: "DMSans_400Regular",
  },

  signupLink: {
    color: ACCENT,
    fontFamily: "DMSans_700Bold",
  },
});

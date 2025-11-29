import AuthHero from "@/components/AuthHero";
import { db } from "@/firebase";
import { scaleFont, scaleSize } from "@/utils/scale";
import bcrypt from "bcryptjs";
import { Link, router } from "expo-router";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
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

const DEFAULT_AVATAR = "https://files.catbox.moe/9uqgm9.png";

const PRIMARY = "#390492";
const ACCENT = "#8b73ff";
const LIGHT_BG = "#efe7ff";


function validateRegister(name: string, phone: string, pass: string, confirm: string) {
    if (!name || name.trim() === "") return "Full name is required.";
    if (!/[a-zA-Z]/.test(name)) return "Full name must contain English letters.";
    if (!/\s/.test(name.trim())) return "Please enter both first and last name.";
    
    if (!phone) return "Phone number is required.";
    if (!/^\d{10}$/.test(phone)) return "Phone number must contain exactly 10 digits.";
  
    if (!pass) return "Password is required.";
    if (!/^\d{6}$/.test(pass)) return "Password must contain exactly 6 digits.";

    if (!confirm) return "Please confirm your password.";
    if (pass !== confirm) return "Passwords do not match.";
    
    return null; // Everything is valid
  }

export default function Register() {

    const page = "register";

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [pass, setPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [loading, setLoading] = useState(false);


    const nameRef = useRef<TextInput>(null);
    const phoneRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);
    const confirmRef = useRef<TextInput>(null);


    const [error, setError] = useState("");


    async function handleRegister() {
        const err = validateRegister(name, phone, pass, confirmPass);
        if (err) {
            setLoading(false);
            setError(err);
            setTimeout(() => setError(""), 3500);
            return; 
        }
        setError("");  
        setLoading(true);
        
        try {

            //hash 
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(pass, saltRounds)
            
            const cleanPhone = phone.replace(/\D/g, "");

            const userRef = doc(db, "users", cleanPhone);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                setLoading(false);
                setError("Phone number is already registered.");
                return;
            }

            await setDoc(doc(db, "users", cleanPhone), {
                name,
                phone : cleanPhone,
                password: hashedPassword, 
                avatar : DEFAULT_AVATAR,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            setLoading(false);


            console.log("REGISTER IS OK : ", phone);
            router.push({
                pathname: "/screens/auth/otp",
                params: { phone: cleanPhone, page }
            });

        } catch (err : any) {
            console.log("REGISTER FAIL : ", err);
            setError(err.message);
        }

    }

  
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>

            <AuthHero title="Let's sign up!" subtitle="Quick setup. Big impact." titleVariant="medium" />
  
            <View style={styles.bottomSection}>

                <TextInput
                    ref={nameRef}
                    style={styles.input}
                    placeholder="Full Name"
                    autoCorrect={true}
                    keyboardType="default"
                    value={name}
                    onChangeText={setName}
                    returnKeyType="go"
                    onSubmitEditing={() => phoneRef.current?.focus()}
                />

                <TextInput
                    ref={phoneRef}
                    style={styles.input}
                    placeholder="Phone Number"
                    placeholderTextColor={PRIMARY}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    returnKeyType="next"
                    maxLength={10}
                    onSubmitEditing={() => passwordRef.current?.focus()}
                />
    
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
                    onSubmitEditing={handleRegister}
                />
    
                {error !== "" && <ErrorMessage message={error} />}


                <TouchableOpacity
                    style={[styles.loginButton, loading && { opacity: 0.6 }]}
                    onPress={!loading ? handleRegister : undefined}
                    disabled={loading}
                >
                    <Text style={styles.loginText}>
                        {loading ? "Processing..." : "Register"}
                    </Text>
                </TouchableOpacity>

    
                <Text style={styles.signupText}>
                    Already have an account?{" "}
                    <Link href="/screens/auth/login" style={styles.signupLink}>Sign in</Link>
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
    }
  });
  
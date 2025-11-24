import { Link, router } from "expo-router";
import { httpsCallable } from "firebase/functions";
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


function validateRegister(name: string, phone: string, pass: string, confirm: string) {
    // Name validations
    if (!name || name.trim() === "") return "Full name is required.";
    if (!/[a-zA-Z]/.test(name)) return "Full name must contain English letters.";
    if (!/\s/.test(name.trim())) return "Please enter both first and last name.";
    
    // Phone validations
    if (!phone) return "Phone number is required.";
    if (!/^\d{10}$/.test(phone)) return "Phone number must contain exactly 10 digits.";
  
    // Password validations
    if (!pass) return "Password is required.";
    if (!/^\d{6}$/.test(pass)) return "Password must contain exactly 6 digits.";

    // Confirm password
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

    const nameRef = useRef<TextInput>(null);
    const phoneRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);
    const confirmRef = useRef<TextInput>(null);


    const [error, setError] = useState("");


    async function handleRegister() {
        const err = validateRegister(name, phone, pass, confirmPass);
        if (err) {
            setError(err);
            setTimeout(() => setError(""), 3500);
            return;
        }
        setError("");  

        try {

            const registerFn = httpsCallable(functions, "register");
            const res = await registerFn({
                phone,
                password: pass,
                name,
            });

            console.log("REGISTER:", res.data);
            router.push({
                pathname: "/screens/auth/otp",
                params: { phone, page }
            });

        } catch (err : any) {
            console.log(err);
            setError(err.message);
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
                <Text style={styles.greeting}>Let's sign up!</Text>
                <Text style={styles.subGreeting}>Quick setup. Big impact.</Text>
                </View>
            </View>
  
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

                <TouchableOpacity style={styles.loginButton} onPress={handleRegister}>
                    <Text style={styles.loginText}>Register</Text>
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

    subGreeting: {
        fontSize: 25,
        fontFamily: "DMSans_700Bold",
        color: LIGHT_BG,
        textShadowColor: LIGHT_BG,
        textShadowRadius: 5,
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
  
import ErrorMessage from "@/components/ErrorMessage";
import Header from "@/components/Header";
import PasswordInput from "@/components/PasswordInput";
import SideMenu from "@/components/SideMenu";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    AppState,
    Image,
    ImageSourcePropType,
    Keyboard,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

const PRIMARY = "#390492";
const LIGHT_BG = "#efe7ff";

export default function ProfileScreen() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [name, setName] = useState("Matan Ohayon");
  const [phone] = useState("0507292524"); // לא ניתן לשינוי
  const [avatar, setAvatar] = useState<string | ImageSourcePropType | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [error, setError] = useState("");
  const slideAnim = useState(new Animated.Value(300))[0];
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  // --- טיפול בחזרה לאפליקציה ---
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && showImagePicker) {
        // אם האפליקציה חזרה למוקד והמודל עדיין פתוח, סגור אותו
        setShowImagePicker(false);
        slideAnim.setValue(300);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [showImagePicker, slideAnim]);

  // --- בקשה להרשאות גלריה ---
  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('We need permission to access your gallery!');
      return false;
    }
    return true;
  };

  // --- בקשה להרשאות מצלמה ---
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('We need permission to access your camera!');
      return false;
    }
    return true;
  };

  // --- בחירת תמונה מהגלריה ---
  const pickFromGallery = async () => {
    try {
      const hasPermission = await requestGalleryPermission();
      if (!hasPermission) {
        setShowImagePicker(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      
      // וודא שהמודל נסגר גם אם המשתמש ביטל
      setShowImagePicker(false);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setShowImagePicker(false);
    }
  };

  // --- צילום תמונה ---
  const takePhoto = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        setShowImagePicker(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });
      
      // וודא שהמודל נסגר גם אם המשתמש ביטל
      setShowImagePicker(false);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      setShowImagePicker(false);
    }
  };

  // --- פתיחת Action Sheet לבחירת תמונה ---
  const handleImagePicker = () => {
    setShowImagePicker(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  // --- סגירת Action Sheet ---
  const closeImagePicker = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowImagePicker(false);
    });
  };

  // --- בחירה מגלריה ---
  const handlePickFromGallery = async () => {
    // סגור את המודל מיד לפני פתיחת בוחר התמונות
    setShowImagePicker(false);
    slideAnim.setValue(300);
    // המתן קצת כדי שהאנימציה תתבצע
    await new Promise(resolve => setTimeout(resolve, 100));
    await pickFromGallery();
  };

  // --- צילום תמונה ---
  const handleTakePhoto = async () => {
    // סגור את המודל מיד לפני פתיחת המצלמה
    setShowImagePicker(false);
    slideAnim.setValue(300);
    // המתן קצת כדי שהאנימציה תתבצע
    await new Promise(resolve => setTimeout(resolve, 100));
    await takePhoto();
  };

  const pickFromAvatars = (selectedAvatar: ImageSourcePropType) => {
    setAvatar(selectedAvatar);
  }

  // --- בחירת אווטארים מובנים ---
  const defaultAvatars = [
    require("@/assets/images/boy_icon.png"),
    require("@/assets/images/girl_icon.png"),
    require("@/assets/images/moneyFace_icon.png"),
  ];

  const defaultAvatarsURL = [
    "https://files.catbox.moe/9uqgm9.png",  //BOY_ICON
    "https://files.catbox.moe/r0caa9.png",  //GIRL_ICON
    "https://files.catbox.moe/wwboj3.png",  //MONEYFACE_ICON
  ];

  // --- ולידציה ---
  const validateForm = (): boolean => {
    // בדיקת שם - חייב להיות לפחות תו אחד באנגלית
    const hasEnglishChar = /[a-zA-Z]/.test(name);
    if (!hasEnglishChar) {
      setError("Name must contain at least one English character");
      setTimeout(() => setError(""), 5000);
      return false;
    }

    // אם יש סיסמה, בדוק שהיא תקינה
    if (password || confirm) {
      // אם יש סיסמה, צריך למלא את שני השדות
      if (!password || !confirm) {
        setError("Both password fields must be filled");
        setTimeout(() => setError(""), 5000);
        return false;
      }

      // בדיקת אורך סיסמה
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        setTimeout(() => setError(""), 5000);
        return false;
      }

      // בדיקת התאמת סיסמאות
      if (password !== confirm) {
        setError("Passwords do not match");
        setTimeout(() => setError(""), 5000);
        return false;
      }
    }

    setError("");
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }
    
    // בעתיד: עדכון בשרת
    router.push("/screens/home/homePage");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>

        {/* HEADER */}
        <Header onMenuPress={() => setMenuOpen(true)} />

        <View style={styles.restMain}>
            <View style={styles.mainL}>
                {/* AVATAR */}
                <View style={styles.avatarContainer}>
                    <View>
                        <Image
                        source={avatar ? (typeof avatar === 'string' ? { uri: avatar } : avatar) : require("@/assets/images/boy_icon.png")}
                        style={styles.avatar}
                        />

                        <TouchableOpacity style={styles.editCircle} onPress={handleImagePicker}>
                            <Image
                            source={require("@/assets/images/edit_icon.png")}
                            style={styles.editIcon}
                            />                
                        </TouchableOpacity>
                    </View>
                    
                    {/* OPTIONS לבחור אווטאר ברירת מחדל */}
                    <View style={styles.avatarOptions}>
                        {defaultAvatars.map((img, i) => (
                        <TouchableOpacity key={i} onPress={() => pickFromAvatars(img)}>
                            <Image source={img} style={styles.smallAvatar} />
                        </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
            <View style={styles.mainR}>
                {/* NAME */}
                <TextInput
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#777"
                />

                {/* PHONE - נעול */}
                <TextInput
                    value={phone}
                    editable={false}
                    style={[styles.input, { backgroundColor: "#efe7f1" }]}
                />
            </View>
        </View>

        <View style={styles.restPass}>
            <Text style={styles.sectionTitle}>change password</Text>
            <PasswordInput
                ref={passwordRef}
                placeholder="Password (6 digits)"
                value={password}
                onChangeText={setPassword}
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
            />

            <PasswordInput
                ref={confirmRef}
                placeholder="Confirm Password"
                value={confirm}
                onChangeText={setConfirm}
                returnKeyType="done"
                onSubmitEditing={handleSave}
            />

            {/* ERROR MESSAGE */}
            {error ? <ErrorMessage message={error} /> : null}

            {/* SAVE BUTTON */}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>Save Changes</Text>
            </TouchableOpacity>

        </View>


        
        <SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />

        {/* IMAGE PICKER ACTION SHEET */}
        <Modal
            visible={showImagePicker}
            transparent={true}
            animationType="none"
            onRequestClose={closeImagePicker}
        >
            <View style={styles.actionSheetOverlay}>
            <TouchableOpacity
                style={StyleSheet.absoluteFill}
                activeOpacity={1}
                onPress={closeImagePicker}
            />
            <Animated.View
                style={[
                styles.actionSheet,
                {
                    transform: [{ translateY: slideAnim }],
                },
                ]}
            >
                <View style={styles.actionSheetHeader}>
                <Text style={styles.actionSheetTitle}>Edit profile picture</Text>
                <TouchableOpacity onPress={closeImagePicker}>
                    <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
                </View>

                <TouchableOpacity
                style={styles.actionSheetOption}
                onPress={handlePickFromGallery}
                >
                <Ionicons name="images-outline" size={24} color={PRIMARY} />
                <Text style={styles.actionSheetOptionText}>Choose photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                style={styles.actionSheetOption}
                onPress={handleTakePhoto}
                >
                <Ionicons name="camera-outline" size={24} color={PRIMARY} />
                <Text style={styles.actionSheetOptionText}>Take photo</Text>
                </TouchableOpacity>
            </Animated.View>
            </View>
        </Modal>

        
        </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },


  restMain:{
    flexDirection: "row",
    // justifyContent: "space-between",
    alignItems: "center",
  },

  mainL: {
    paddingTop: 20,
    paddingHorizontal: 10,
    rowGap: 3,
  },

  avatarContainer: {
    marginTop: 20,
    alignItems: "center",
  },

  avatar: {
    width: 120,
    height: 120,
    backgroundColor: LIGHT_BG,
    borderRadius: 100,
    borderColor: PRIMARY,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  editCircle: {
    position: "absolute",
    bottom: -8,
    right: -8,
    width: 40,
    height: 40,
    backgroundColor: PRIMARY,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  editIcon: {
    width: 20,
    height: 20,
    tintColor: "white",
  },

  avatarOptions: {
    flexDirection: "row",
    marginTop: 10,
    gap: 12,
  },

  smallAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  mainR:{
    paddingTop: 20,
    paddingHorizontal: 10,
    rowGap: 3,
    paddingRight: 20,
    width: "60%",
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

  restPass: {
    width: "100%",
    paddingHorizontal: 20,
  }, 

  sectionTitle: {
    marginTop: 25,
    marginBottom: 15,
    fontSize: 16,
    fontWeight: "700",
    color: PRIMARY,
  },

  saveBtn: {
    width: "80%",
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 20,
    marginTop: 30,
    alignItems: "center",
    alignSelf: "center"
  },

  saveText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  // ACTION SHEET STYLES
  actionSheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },

  actionSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },

  actionSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  actionSheetTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },

  actionSheetOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },

  actionSheetOptionText: {
    fontSize: 16,
    color: "#000",
  },
});

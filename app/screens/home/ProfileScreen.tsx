import ErrorMessage from "@/components/ErrorMessage";
import Header from "@/components/Header";
import PasswordInput from "@/components/PasswordInput";
import SideMenu from "@/components/SideMenu";
import { useExpenses } from "@/contexts/ExpensesContext";
import { db } from "@/firebase";
import { scaleFont, scaleSize } from "@/utils/scale";
import { Ionicons } from "@expo/vector-icons";
import bcrypt from "bcryptjs";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
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
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { graphsData } = useExpenses();
  const [menuOpen, setMenuOpen] = useState(false);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatar, setAvatar] = useState<string | ImageSourcePropType | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const slideAnim = useState(new Animated.Value(300))[0];
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!phone) return;

    async function loadUserData() {
      try {
        const userRef = doc(db, "users", phone);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          setError("User not found");
          return;
        }

        const userData = userSnap.data();
        setName(userData.name || "");
        setPhoneNumber(userData.phone || phone);
        setAvatar(userData.avatar || null);
      } catch (error) {
        console.error("Error loading user data:", error);
        setError("Failed to load user data");
      }
    }

    loadUserData();
  }, [phone]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && showImagePicker) {
        setShowImagePicker(false);
        slideAnim.setValue(300);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [showImagePicker, slideAnim]);

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('We need permission to access your gallery!');
      return false;
    }
    return true;
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('We need permission to access your camera!');
      return false;
    }
    return true;
  };

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
      
      setShowImagePicker(false);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setShowImagePicker(false);
    }
  };

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
      
      setShowImagePicker(false);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      setShowImagePicker(false);
    }
  };

  const handleImagePicker = () => {
    setShowImagePicker(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const closeImagePicker = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowImagePicker(false);
    });
  };

  const handlePickFromGallery = async () => {
    setShowImagePicker(false);
    slideAnim.setValue(300);
    await new Promise(resolve => setTimeout(resolve, 100));
    await pickFromGallery();
  };

  const handleTakePhoto = async () => {
    setShowImagePicker(false);
    slideAnim.setValue(300);
    await new Promise(resolve => setTimeout(resolve, 100));
    await takePhoto();
  };

  const pickFromAvatars = (index: number) => {
    setAvatar(defaultAvatarsURL[index]);
  }

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

  const uploadImageToStorage = async (uri: string): Promise<string> => {
    try {
      const formData = new FormData();
      const filename = `avatar_${phone}_${Date.now()}.jpg`;
      
      formData.append("reqtype", "fileupload");
      formData.append("fileToUpload", {
        uri: uri,
        type: "image/jpeg",
        name: filename,
      } as any);
      
      const response = await fetch("https://catbox.moe/user/api.php", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }
      
      const result = await response.text();
      
      if (result.startsWith("http")) {
        return result.trim();
      } else {
        throw new Error(`Upload failed: ${result}`);
      }
    } catch (error) {
      console.error("Error uploading image to catbox.moe:", error);
      throw error;
    }
  };

  const validateForm = (): boolean => {
    const hasEnglishChar = /[a-zA-Z]/.test(name);
    if (!hasEnglishChar) {
      setError("Name must contain at least one English character");
      setTimeout(() => setError(""), 5000);
      return false;
    }

    if (password || confirm) {
      if (!password || !confirm) {
        setError("Both password fields must be filled");
        setTimeout(() => setError(""), 5000);
        return false;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        setTimeout(() => setError(""), 5000);
        return false;
      }

      if (password !== confirm) {
        setError("Passwords do not match");
        setTimeout(() => setError(""), 5000);
        return false;
      }
    }

    setError("");
    return true;
  };

  const handleSave = async () => {
    if (!validateForm() || !phone) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userRef = doc(db, "users", phone);
      const updateData: any = {
        name,
        updatedAt: serverTimestamp(),
      };

      let avatarURL = "";
      if (avatar) {
        if (typeof avatar === "string") {
          if (avatar.startsWith("file://") || avatar.startsWith("content://")) {
            avatarURL = await uploadImageToStorage(avatar);
          } else {
            avatarURL = avatar;
          }
        } else {
          const avatarIndex = defaultAvatars.findIndex(
            (img) => img === avatar
          );
          if (avatarIndex !== -1) {
            avatarURL = defaultAvatarsURL[avatarIndex];
          }
        }
        updateData.avatar = avatarURL;
      }

      if (password && confirm) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        updateData.password = hashedPassword;
      }

      await updateDoc(userRef, updateData);

      setPassword("");
      setConfirm("");

      router.push({
        pathname: "/screens/home/homePage",
        params: { phone },
      });
    } catch (error: any) {
      console.error("Error saving profile:", error);
      setError("Failed to save changes. Please try again.");
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>

        <Header onMenuPress={() => setMenuOpen(true)} />

        <View style={styles.restMain}>
            <View style={styles.mainL}>
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
                    
                    <View style={styles.avatarOptions}>
                        {defaultAvatars.map((img, i) => (
                        <TouchableOpacity key={i} onPress={() => pickFromAvatars(i)}>
                            <Image source={img} style={styles.smallAvatar} />
                        </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
            <View style={styles.mainR}>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#777"
                />

                <TextInput
                    value={phoneNumber}
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

            {error ? <ErrorMessage message={error} /> : null}

            <TouchableOpacity 
                style={[styles.saveBtn, loading && styles.saveBtnDisabled]} 
                onPress={handleSave}
                disabled={loading}
            >
                <Text style={styles.saveText}>
                    {loading ? "Saving..." : "Save Changes"}
                </Text>
            </TouchableOpacity>

        </View>


        
        <SideMenu 
                visible={menuOpen} 
                onClose={() => setMenuOpen(false)} 
                phone={phone as string}
            />

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
    alignItems: "center",
  },

  mainL: {
    paddingTop: scaleSize(20),
    paddingHorizontal: scaleSize(10),
    rowGap: scaleSize(3),
  },

  avatarContainer: {
    marginTop: scaleSize(20),
    alignItems: "center",
  },

  avatar: {
    width: scaleSize(120),
    height: scaleSize(120),
    backgroundColor: LIGHT_BG,
    borderRadius: scaleSize(100),
    borderColor: PRIMARY,
    borderWidth: scaleSize(3),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scaleSize(10),
  },

  editCircle: {
    position: "absolute",
    bottom: scaleSize(-8),
    right: scaleSize(-8),
    width: scaleSize(40),
    height: scaleSize(40),
    backgroundColor: PRIMARY,
    borderRadius: scaleSize(40),
    justifyContent: "center",
    alignItems: "center",
  },

  editIcon: {
    width: scaleSize(20),
    height: scaleSize(20),
    tintColor: "white",
  },

  avatarOptions: {
    flexDirection: "row",
    marginTop: scaleSize(10),
    gap: scaleSize(12),
  },

  smallAvatar: {
    width: scaleSize(40),
    height: scaleSize(40),
    borderRadius: scaleSize(20),
  },

  mainR:{
    paddingTop: scaleSize(20),
    paddingHorizontal: scaleSize(10),
    rowGap: scaleSize(3),
    paddingRight: scaleSize(20),
    width: "60%",
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

  restPass: {
    width: "100%",
    paddingHorizontal: scaleSize(20),
  }, 

  sectionTitle: {
    marginTop: scaleSize(25),
    marginBottom: scaleSize(15),
    fontSize: scaleFont(16),
    fontWeight: "700",
    color: PRIMARY,
  },

  saveBtn: {
    width: "80%",
    backgroundColor: PRIMARY,
    paddingVertical: scaleSize(14),
    borderRadius: scaleSize(20),
    marginTop: scaleSize(30),
    alignItems: "center",
    alignSelf: "center"
  },

  saveText: {
    color: "#fff",
    fontSize: scaleFont(18),
    fontWeight: "600",
  },

  saveBtnDisabled: {
    opacity: 0.6,
  },

  actionSheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },

  actionSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: scaleSize(20),
    borderTopRightRadius: scaleSize(20),
    paddingBottom: scaleSize(40),
    paddingTop: scaleSize(20),
  },

  actionSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scaleSize(20),
    paddingBottom: scaleSize(20),
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  actionSheetTitle: {
    fontSize: scaleFont(18),
    fontWeight: "600",
    color: "#000",
  },

  actionSheetOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scaleSize(20),
    paddingVertical: scaleSize(16),
    gap: scaleSize(12),
  },

  actionSheetOptionText: {
    fontSize: scaleFont(16),
    color: "#000",
  },
});

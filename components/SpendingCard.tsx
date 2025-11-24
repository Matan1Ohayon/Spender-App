import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import {
    Image, Modal, Platform, StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
  
  const PRIMARY = "#390492";
  
  interface SpendingCardProps {
    item: { category: string; amount: number; payment: string; date: string };
    isBackCard?: boolean;
    onEditStart?: () => void; // לתקשר עם TinderStack
    onEditEnd?: () => void;
  }
  
  const categories = [
    "Food",
    "Shopping",
    "Transport",
    "Coffee",
    "Groceries",
    "Delivery",
    "Movies",
    "Gas",
    "Other",
  ];

  const categoryEmojis: { [key: string]: string } = {
    "Food": "🍔",
    "Shopping": "🛍️",
    "Transport": "🚌",
    "Coffee": "☕",
    "Groceries": "🛒",
    "Delivery": "📦",
    "Movies": "🎬",
    "Gas": "⛽",
    "Other": "💡",
  };

  function getCategoryWithEmoji(category: string): string {
    // הסרת אימוג'ים קיימים אם יש
    const cleanCategory = category.replace(/[\u{1F300}-\u{1F9FF}]/gu, "").trim();
    const emoji = categoryEmojis[cleanCategory] || categoryEmojis["Other"];
    return `${emoji} ${cleanCategory}`;
  }
  
  const paymentMethods = ["Credit Card", "Cash", "Debit Card", "Bit", "PayPal"];
  
  export default function SpendingCard({
    item,
    isBackCard = false,
    onEditStart,
    onEditEnd,
  }: SpendingCardProps) {
    const [isEditing, setIsEditing] = useState(false);

    // ערכים לעריכה
    const [editAmount, setEditAmount] = useState(String(item.amount));
    const [editCategory, setEditCategory] = useState(item.category);
    const [editPayment, setEditPayment] = useState(item.payment);
    const [editDate, setEditDate] = useState(item.date);
    const [editDateObject, setEditDateObject] = useState(new Date());
    const [editNotes, setEditNotes] = useState("");

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [showPaymentPicker, setShowPaymentPicker] = useState(false);
  
    // ======== אנימציית עלייה למעלה ========
    const editOffset = useSharedValue(0);
  
    function startEdit() {
      setIsEditing(true);
      onEditStart && onEditStart();

      // עדכון תאריך לעריכה
      try {
        const dateParts = editDate.split(" ");
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthIndex = monthNames.indexOf(dateParts[0]);
        const day = parseInt(dateParts[1]);
        if (monthIndex !== -1 && !isNaN(day)) {
          const currentYear = new Date().getFullYear();
          setEditDateObject(new Date(currentYear, monthIndex, day));
        }
      } catch (e) {
        // אם יש שגיאה, פשוט נשאיר את התאריך הנוכחי
      }

      editOffset.value = withSpring(-200, {
        damping: 15,
        stiffness: 150,
      });
    }
  
    function cancelEdit() {
      setIsEditing(false);
      onEditEnd && onEditEnd();
  
      editOffset.value = withSpring(0);
    }
  
    function saveEdit() {
      // כאן אפשר לעדכן state גלובלי בעתיד
      setIsEditing(false);
      onEditEnd && onEditEnd();
      editOffset.value = withSpring(0);
    }
  
    function deleteCard() {
      console.log("DELETE CARD");
    }
  
    const animatedCardStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateY: editOffset.value }],
      };
    });

    const cardStyle = isBackCard
      ? [styles.card, { transform: [{ translateY: 25 }] }]
      : styles.card;
    
    // Wrapper style עם position כדי שהאנימציה לא תחסום לחיצות
    const wrapperAnimatedStyle = useAnimatedStyle(() => {
      return {
        top: editOffset.value,
      };
    });
  
    return (
      <Animated.View style={[styles.wrapper, wrapperAnimatedStyle]}>
        <View style={cardStyle}>
          {/* TOP BAR */}
          <View style={styles.topCard}>
            {!isEditing && (
              <Text style={styles.category}>{getCategoryWithEmoji(item.category)}</Text>
            )}

            {isEditing && (
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowCategoryPicker(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.pickerButtonText}>{getCategoryWithEmoji(editCategory)}</Text>
              </TouchableOpacity>
            )}

            {!isEditing && (
              <TouchableOpacity style={styles.editCircle} onPress={startEdit}>
                <Image
                  source={require("../assets/images/edit_icon.png")}
                  style={styles.editIcon}
                />
              </TouchableOpacity>
            )}
          </View>
  
          {/* MAIN CONTENT */}
          <View style={styles.restCard}>
            {/* Amount */}
            {!isEditing && (
              <Text style={styles.amount}>${item.amount}</Text>
            )}
            {isEditing && (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.amountInput}
                  value={editAmount}
                  keyboardType="numeric"
                  onChangeText={setEditAmount}
                  placeholder="$0.00"
                />
              </View>
            )}

            {/* Payment */}
            {!isEditing && (
              <Text style={styles.paymentMethod}>Pay by {item.payment}</Text>
            )}
            {isEditing && (
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowPaymentPicker(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.pickerButtonText}>{editPayment}</Text>
              </TouchableOpacity>
            )}

            {/* Date */}
            {!isEditing && <Text style={styles.date}>{item.date}</Text>}

            {isEditing && (
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.datePickerText}>{editDate}</Text>
              </TouchableOpacity>
            )}

            {/* Notes */}
            {!isEditing && (
              <TouchableOpacity style={styles.notesBox} onPress={startEdit}>
                <Text style={styles.notesPlaceholder}>Add a note...</Text>
              </TouchableOpacity>
            )}

            {isEditing && (
              <View style={styles.notesInputContainer}>
                <TextInput
                  style={styles.notesInput}
                  value={editNotes}
                  placeholder="Write a note..."
                  placeholderTextColor="#999"
                  onChangeText={setEditNotes}
                  multiline
                />
              </View>
            )}
          </View>
  
          {/* BUTTONS */}
          {isEditing && (
            <View style={styles.buttonsRow}>
              <TouchableOpacity style={styles.deleteBtn} onPress={deleteCard}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
  
              <TouchableOpacity style={styles.cancelBtn} onPress={cancelEdit}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
  
              <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
  
        {/* DATE PICKER MODAL */}
        {showDatePicker && (
          <Modal
            visible={showDatePicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Select Date</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowDatePicker(false);
                    }}
                  >
                    <Text style={styles.modalDoneText}>Done</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.datePickerContainer}>
                  <DateTimePicker
                    value={editDateObject}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(e: any, selected?: Date) => {
                      if (selected) {
                        setEditDateObject(selected);
                        const d = selected.toDateString().slice(4, 10);
                        setEditDate(d);
                        if (Platform.OS === "android") {
                          setShowDatePicker(false);
                        }
                      } else if (Platform.OS === "android") {
                        setShowDatePicker(false);
                      }
                    }}
                  />
                </View>
              </View>
            </View>
          </Modal>
        )}

        {/* CATEGORY PICKER MODAL */}
        <Modal
          visible={showCategoryPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCategoryPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Category</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={styles.modalDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={editCategory}
                onValueChange={(itemValue) => setEditCategory(itemValue)}
                style={styles.modalPicker}
              >
                {categories.map((cat) => (
                  <Picker.Item key={cat} label={getCategoryWithEmoji(cat)} value={cat} />
                ))}
              </Picker>
            </View>
          </View>
        </Modal>

        {/* PAYMENT PICKER MODAL */}
        <Modal
          visible={showPaymentPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowPaymentPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowPaymentPicker(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Payment</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowPaymentPicker(false);
                  }}
                >
                  <Text style={styles.modalDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={editPayment}
                onValueChange={(itemValue) => setEditPayment(itemValue)}
                style={styles.modalPicker}
              >
                {paymentMethods.map((pm) => (
                  <Picker.Item key={pm} label={pm} value={pm} />
                ))}
              </Picker>
            </View>
          </View>
        </Modal>
      </Animated.View>
    );
  }
  
  const styles = StyleSheet.create({
    wrapper: {
      width: "100%",
      height: "100%",
      alignItems: "center",
      position: "relative",
    },
  
    card: {
      width: "100%",
      maxWidth: 350,
      height: 430,
      backgroundColor: "white",
      borderRadius: 35,
      padding: 25,
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 25,
      shadowOffset: { width: 0, height: 10 },
      elevation: 10,
    },
  
    topCard: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
  
    category: {
      fontSize: 20,
      color: PRIMARY,
    },
  
    editCircle: {
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
  
    restCard: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
      minHeight: 0,
    },
  
    amount: {
      fontSize: 50,
      color: PRIMARY,
    },
  
    inputContainer: {
      width: "100%",
      alignItems: "center",
      position: "relative",
      elevation: 5,
      zIndex: 1000,
    },

    amountInput: {
      fontSize: 32,
      color: PRIMARY,
      borderBottomWidth: 1,
      borderBottomColor: "#ddd",
      width: "80%",
      textAlign: "center",
      paddingVertical: 8,
    },
  
    paymentMethod: {
      fontSize: 18,
      color: PRIMARY,
    },
  
    date: {
      fontSize: 16,
      color: PRIMARY,
      opacity: 0.7,
    },

    datePickerButton: {
      width: "100%",
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 10,
      backgroundColor: "#F7F7F7",
      position: "relative",
      elevation: 5,
      zIndex: 1000,
    },

    datePickerText: {
      fontSize: 18,
      color: PRIMARY,
    },
  
    notesBox: {
      width: "100%",
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 10,
      backgroundColor: "#F7F7F7",
      minHeight: 50,
      justifyContent: "center",
    },

    notesPlaceholder: {
      fontSize: 16,
      color: "#999",
    },

    notesInputContainer: {
      width: "100%",
      position: "relative",
      elevation: 5,
      zIndex: 1000,
    },

    notesInput: {
      width: "100%",
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 10,
      backgroundColor: "#F7F7F7",
      minHeight: 100,
      fontSize: 16,
      color: PRIMARY,
      textAlignVertical: "top",
    },
  
    pickerButton: {
      width: "100%",
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 10,
      backgroundColor: "#F7F7F7",
      position: "relative",
      elevation: 5,
      zIndex: 1000,
    },

    pickerButtonText: {
      fontSize: 18,
      color: PRIMARY,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },

    modalContent: {
      backgroundColor: "white",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: Platform.OS === "ios" ? 40 : 20,
    },

    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
    },

    modalTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: PRIMARY,
    },

    modalCancelText: {
      fontSize: 16,
      color: "#666",
    },

    modalDoneText: {
      fontSize: 16,
      color: PRIMARY,
      fontWeight: "600",
    },

    modalPicker: {
      width: "100%",
      height: Platform.OS === "ios" ? 200 : 200,
    },

    datePickerContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 20,
    },
  
    buttonsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 10,
    },
  
    deleteBtn: {
      backgroundColor: "#ff4444",
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 10,
    },
  
    deleteText: {
      color: "white",
      fontWeight: "700",
    },
  
    cancelBtn: {
      backgroundColor: "#ccc",
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 10,
    },
  
    cancelText: {
      color: "#333",
      fontWeight: "600",
    },
  
    saveBtn: {
      backgroundColor: PRIMARY,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 10,
    },
  
    saveText: {
      color: "white",
      fontWeight: "700",
    },
  });
  
import { scaleFont, scaleSize } from "@/utils/scale";
import { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";

import AndroidWheelPicker from "@/components/AndroidWheelPicker";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const PRIMARY = "#390492";

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
  Food: "🍔",
  Shopping: "🛍️",
  Transport: "🚌",
  Coffee: "☕",
  Groceries: "🛒",
  Delivery: "📦",
  Movies: "🎬",
  Gas: "⛽",
  Other: "💡",
};

function getCategoryWithEmoji(category: string): string {
  const cleanCategory = category.replace(/[\u{1F300}-\u{1F9FF}]/gu, "").trim();
  const emoji = categoryEmojis[cleanCategory] || categoryEmojis["Other"];
  return `${emoji} ${cleanCategory}`;
}

const paymentMethods = ["Credit Card", "Cash", "Debit Card", "Bank Transfer", "Bit/ PayBox", "PayPal"];

interface EditSpendCardProps {
  item: any;
  onClose?: () => void;
  onSave?: (updated: any) => void;
  onDelete?: (item: any) => void;
}

export default function EditSpendCard({
  item,
  onClose,
  onSave,
  onDelete,
}: EditSpendCardProps) {

  const [editAmount, setEditAmount] = useState(String(item.amount));
  const [editCategory, setEditCategory] = useState(item.category);
  const [editPayment, setEditPayment] = useState(item.payment);
  const [editDate, setEditDate] = useState(item.date);
  const [editDateObject, setEditDateObject] = useState(new Date());
  const [editNotes, setEditNotes] = useState(item.notes || "");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showPaymentPicker, setShowPaymentPicker] = useState(false);

  const editOffset = useSharedValue(500);

  useEffect(() => {
    editOffset.value = withSpring(0);
  }, []);

  function cancelEdit() {
    editOffset.value = withSpring(200);
    setTimeout(() => {
      onClose?.();
    }, 200);
  }

  function saveEdit() {
    const updated = {
      ...item,
      amount: Number(editAmount),
      category: editCategory,
      payment: editPayment,
      date: editDate,
      notes: editNotes,
    };

    onSave?.(updated);

    editOffset.value = withSpring(200);
    setTimeout(() => {
      onClose?.();
    }, 200);
  }

  function deleteCard() {
    onDelete?.(item);

    editOffset.value = withSpring(200);
    setTimeout(() => {
      onClose?.();
    }, 200);
  }

  const wrapperAnimatedStyle = useAnimatedStyle(() => {
    return {
      top: editOffset.value,
    };
  });

  return (
    <Animated.View style={[styles.wrapper, wrapperAnimatedStyle]}>
      <View style={styles.card}>

        {/* TOP BAR */}
        <View style={styles.topCard}>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowCategoryPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.pickerButtonText}>
              {getCategoryWithEmoji(editCategory)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* MAIN */}
        <View style={styles.restCard}>
          {/* Amount */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.amountInput}
              value={editAmount}
              keyboardType="numeric"
              onChangeText={setEditAmount}
              placeholder="$0.00"
            />
          </View>

          {/* Payment */}
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowPaymentPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.pickerButtonText}>{editPayment}</Text>
          </TouchableOpacity>

          {/* Date */}
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.datePickerText}>{editDate}</Text>
          </TouchableOpacity>

          {/* Notes */}
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
        </View>

        {/* BUTTONS */}
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
      </View>

      {/* DATE PICKER */}
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
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
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

      {/* CATEGORY PICKER */}
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
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                <Text style={styles.modalDoneText}>Done</Text>
              </TouchableOpacity>
            </View>

            {Platform.OS === "ios" ? (
              <Picker
                selectedValue={editCategory}
                onValueChange={(itemValue) => setEditCategory(itemValue)}
                style={styles.modalPicker}
              >
                {categories.map((cat) => (
                  <Picker.Item key={cat} label={getCategoryWithEmoji(cat)} value={cat} />
                ))}
              </Picker>
            ) : (
              <AndroidWheelPicker
                items={categories}
                selectedValue={editCategory}
                onValueChange={setEditCategory}
                visible={showCategoryPicker}
                labelFormatter={getCategoryWithEmoji}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* PAYMENT PICKER */}
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
              <TouchableOpacity onPress={() => setShowPaymentPicker(false)}>
                <Text style={styles.modalDoneText}>Done</Text>
              </TouchableOpacity>
            </View>

            {Platform.OS === "ios" ? (
              <Picker
                selectedValue={editPayment}
                onValueChange={(itemValue) => setEditPayment(itemValue)}
                style={styles.modalPicker}
              >
                {paymentMethods.map((pm) => (
                  <Picker.Item key={pm} label={pm} value={pm} />
                ))}
              </Picker>
            ) : (
              <AndroidWheelPicker
                items={paymentMethods}
                selectedValue={editPayment}
                onValueChange={setEditPayment}
                visible={showPaymentPicker}
              />
            )}
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
    justifyContent: "flex-end",
    position: "absolute",
    bottom: 0,
    paddingBottom: scaleSize(350),
  },

  card: {
    width: "100%",
    maxWidth: scaleSize(350),
    height: scaleSize(430),
    backgroundColor: "white",
    borderRadius: scaleSize(35),
    padding: scaleSize(25),
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

  pickerButton: {
    width: "100%",
    paddingVertical: scaleSize(12),
    paddingHorizontal: scaleSize(14),
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: scaleSize(10),
    backgroundColor: "#F7F7F7",
  },

  pickerButtonText: {
    fontSize: scaleFont(18),
    color: PRIMARY,
  },

  restCard: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  inputContainer: {
    width: "100%",
    alignItems: "center",
  },

  amountInput: {
    fontSize: scaleFont(32),
    color: PRIMARY,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    width: "80%",
    textAlign: "center",
    paddingVertical: scaleSize(8),
  },

  datePickerButton: {
    width: "100%",
    paddingVertical: scaleSize(12),
    paddingHorizontal: scaleSize(14),
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: scaleSize(10),
    backgroundColor: "#F7F7F7",
  },

  datePickerText: {
    fontSize: scaleFont(18),
    color: PRIMARY,
  },

  notesInputContainer: {
    width: "100%",
  },

  notesInput: {
    width: "100%",
    paddingVertical: scaleSize(12),
    paddingHorizontal: scaleSize(14),
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: scaleSize(10),
    backgroundColor: "#F7F7F7",
    minHeight: scaleSize(100),
    fontSize: scaleFont(16),
    color: PRIMARY,
    textAlignVertical: "top",
  },

  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: scaleSize(10),
  },

  deleteBtn: {
    backgroundColor: "#ff4444",
    paddingHorizontal: scaleSize(18),
    paddingVertical: scaleSize(10),
    borderRadius: scaleSize(10),
  },

  deleteText: {
    color: "white",
    fontWeight: "700",
  },

  cancelBtn: {
    backgroundColor: "#ccc",
    paddingHorizontal: scaleSize(18),
    paddingVertical: scaleSize(10),
    borderRadius: scaleSize(10),
  },

  cancelText: {
    color: "#333",
    fontWeight: "600",
  },

  saveBtn: {
    backgroundColor: PRIMARY,
    paddingHorizontal: scaleSize(18),
    paddingVertical: scaleSize(10),
    borderRadius: scaleSize(10),
  },

  saveText: {
    color: "white",
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: scaleSize(20),
    borderTopRightRadius: scaleSize(20),
    paddingBottom: Platform.OS === "ios" ? scaleSize(40) : scaleSize(20),
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scaleSize(20),
    paddingVertical: scaleSize(15),
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  modalTitle: {
    fontSize: scaleFont(18),
    fontWeight: "600",
    color: PRIMARY,
  },

  modalCancelText: {
    fontSize: scaleFont(16),
    color: "#666",
  },

  modalDoneText: {
    fontSize: scaleFont(16),
    color: PRIMARY,
    fontWeight: "600",
  },

  modalPicker: {
    width: "100%",
    height: Platform.OS === "ios" ? scaleSize(200) : scaleSize(200),
  },

  datePickerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: scaleSize(20),
  },
});

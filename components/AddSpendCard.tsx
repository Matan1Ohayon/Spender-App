import AndroidWheelPicker from "@/components/AndroidWheelPicker";
import ErrorMessage from "@/components/ErrorMessage";
import { scaleFont, scaleSize } from "@/utils/scale";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import {
    Keyboard,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

const PRIMARY = "#390492";

interface AddSpendCardProps {
    visible: boolean;
    onClose: () => void;
    onSave?: (data: { amount: string; category: string; payment: string; date: string; notes: string }) => void;
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
    const cleanCategory = category.replace(/[\u{1F300}-\u{1F9FF}]/gu, "").trim();
    const emoji = categoryEmojis[cleanCategory] || categoryEmojis["Other"];
    return `${emoji} ${cleanCategory}`;
}

const paymentMethods = ["Credit Card", "Cash", "Debit Card", "Bank Transfer", "Bit/ PayBox", "PayPal"];

function formatDate(date: Date): string {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    return `${month} ${day}`;
}

export default function AddSpendCard({
    visible,
    onClose,
    onSave,
}: AddSpendCardProps) {
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("Food");
    const [payment, setPayment] = useState("Credit Card");
    const [dateObject, setDateObject] = useState(new Date());
    const [date, setDate] = useState(formatDate(new Date()));
    const [notes, setNotes] = useState("");
    const [error, setError] = useState("");

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [showPaymentPicker, setShowPaymentPicker] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError("");
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        if (Platform.OS !== "android") {
            return;
        }
        const showSub = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
        const hideSub = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    function handleCancel() {
        setShowDatePicker(false);
        setShowCategoryPicker(false);
        setShowPaymentPicker(false);
        
        setAmount("");
        setCategory("Food");
        setPayment("Credit Card");
        const now = new Date();
        setDateObject(now);
        setDate(formatDate(now));
        setNotes("");
        setError("");
        onClose();
    }

    function handleSave() {
        const amountNum = parseFloat(amount);
        if (!amount || amount.trim() === "" || isNaN(amountNum) || amountNum <= 0) {
            setError("Please enter a valid amount greater than 0");
            return;
        }

        setError("");
        if (onSave) {
            onSave({
                amount,
                category,
                payment,
                date,
                notes,
            });
        }
        handleCancel();
    }

    if (!visible) {
        return null;
    }

    return (
        <>
            <Modal
                visible={visible}
                transparent={true}
                animationType="fade"
                onRequestClose={handleCancel}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View
                        style={[
                            styles.modalOverlay,
                            Platform.OS === "android" && {
                                paddingBottom: keyboardVisible ? scaleSize(40) : scaleSize(200),
                            },
                        ]}
                    >
                        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                            <View style={styles.card}>
                                {/* TOP BAR */}
                                <View style={styles.topCard}>
                                    <TouchableOpacity
                                        style={styles.pickerButton}
                                        onPress={() => setShowCategoryPicker(true)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.pickerButtonText}>{getCategoryWithEmoji(category)}</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* MAIN CONTENT */}
                                <View style={styles.restCard}>
                                    {/* Amount */}
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={styles.amountInput}
                                            value={amount}
                                            keyboardType="numeric"
                                            onChangeText={(text) => {
                                                setAmount(text);
                                                if (error) setError("");
                                            }}
                                            placeholder="$0.00"
                                        />
                                    </View>

                                    {error && (
                                        <View style={styles.errorContainer}>
                                            <ErrorMessage message={error} />
                                        </View>
                                    )}

                                    {/* Payment */}
                                    <TouchableOpacity
                                        style={styles.pickerButton}
                                        onPress={() => setShowPaymentPicker(true)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.pickerButtonText}>{payment}</Text>
                                    </TouchableOpacity>

                                    {/* Date */}
                                    <TouchableOpacity
                                        style={styles.datePickerButton}
                                        onPress={() => setShowDatePicker(true)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.datePickerText}>{date}</Text>
                                    </TouchableOpacity>

                                    {/* Notes */}
                                    <View style={styles.notesInputContainer}>
                                        <TextInput
                                            style={styles.notesInput}
                                            value={notes}       
                                            placeholder="Write a note..."
                                            placeholderTextColor="#999"
                                            onChangeText={setNotes}
                                            multiline
                                        />
                                    </View>
                                </View>

                                {/* BUTTONS */}
                                <View style={styles.buttonsRow}>
                                    <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                                        <Text style={styles.cancelText}>Cancel</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                                        <Text style={styles.saveText}>Add</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>

                {/* DATE PICKER MODAL */}
                {showDatePicker && (
                    <Modal
                        visible={showDatePicker}
                        transparent={true}
                        animationType="slide"
                        onRequestClose={() => setShowDatePicker(false)}
                    >
                        <View style={styles.pickerModalOverlay}>
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
                                        value={dateObject}
                                        mode="date"
                                        display={Platform.OS === "ios" ? "spinner" : "default"}
                                        onChange={(e: any, selected?: Date) => {
                                            if (selected) {
                                                setDateObject(selected);
                                                const d = selected.toDateString().slice(4, 10);
                                                setDate(d);
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
                    <View style={styles.pickerModalOverlay}>
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
                            {Platform.OS === "ios" ? (
                                <Picker
                                    selectedValue={category}
                                    onValueChange={(itemValue) => setCategory(itemValue)}
                                    style={styles.modalPicker}
                                >
                                    {categories.map((cat) => (
                                        <Picker.Item key={cat} label={getCategoryWithEmoji(cat)} value={cat} />
                                    ))}
                                </Picker>
                            ) : (
                                <AndroidWheelPicker
                                    items={categories}
                                    selectedValue={category}
                                    onValueChange={setCategory}
                                    visible={showCategoryPicker}
                                    labelFormatter={getCategoryWithEmoji}
                                />
                            )}
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
                    <View style={styles.pickerModalOverlay}>
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
                            {Platform.OS === "ios" ? (
                                <Picker
                                    selectedValue={payment}
                                    onValueChange={(itemValue) => setPayment(itemValue)}
                                    style={styles.modalPicker}
                                >
                                    {paymentMethods.map((pm) => (
                                        <Picker.Item key={pm} label={pm} value={pm} />
                                    ))}
                                </Picker>
                            ) : (
                                <AndroidWheelPicker
                                    items={paymentMethods}
                                    selectedValue={payment}
                                    onValueChange={setPayment}
                                    visible={showPaymentPicker}
                                />
                            )}
                        </View>
                    </View>
                </Modal>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
        alignItems: "center",
        padding: scaleSize(20),
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
        overflow: "visible",
    },

    topCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    restCard: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        minHeight: 0,
        overflow: "visible",
    },

    inputContainer: {
        width: "100%",
        alignItems: "center",
        position: "relative",
        elevation: 5,
        zIndex: 1000,
    },

    errorContainer: {
        position: "absolute",
        top: scaleSize(60),
        left: 0,
        right: 0,
        zIndex: 10000,
        elevation: 25,
        width: "100%",
        paddingHorizontal: scaleSize(10),
        pointerEvents: "none",
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
        position: "relative",
        elevation: 5,
        zIndex: 1000,
    },

    datePickerText: {
        fontSize: scaleFont(18),
        color: PRIMARY,
    },

    notesInputContainer: {
        width: "100%",
        position: "relative",
        elevation: 5,
        zIndex: 1000,
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

    pickerButton: {
        width: "100%",
        paddingVertical: scaleSize(12),
        paddingHorizontal: scaleSize(14),
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: scaleSize(10),
        backgroundColor: "#F7F7F7",
        position: "relative",
        elevation: 5,
        zIndex: 1000,
    },

    pickerButtonText: {
        fontSize: scaleFont(18),
        color: PRIMARY,
    },

    pickerModalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
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

    buttonsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: scaleSize(10),
        gap: 10,
    },

    cancelBtn: {
        flex: 1,
        backgroundColor: "#ccc",
        paddingHorizontal: scaleSize(18),
        paddingVertical: scaleSize(10),
        borderRadius: scaleSize(10),
        alignItems: "center",
    },

    cancelText: {
        color: "#333",
        fontWeight: "600",
    },

    saveBtn: {
        flex: 1,
        backgroundColor: PRIMARY,
        paddingHorizontal: scaleSize(18),
        paddingVertical: scaleSize(10),
        borderRadius: scaleSize(10),
        alignItems: "center",
    },

    saveText: {
        color: "white",
        fontWeight: "700",
    },
});


import { expenses } from "@/_data/insightsMockData";
import Header from "@/components/Header";
import SideMenu from "@/components/SideMenu";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

const PRIMARY = "#390492";
const LIGHT_BG = "#efe7ff";

const DATE_FILTERS = ["This Week", "This Month", "Range"];
const SORT_OPTIONS = ["date", "price", "category", "type", "payment"];

const CATEGORY_EMOJIS: { [key: string]: string } = {
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

export default function HistoryPage() {

    const [menuOpen, setMenuOpen] = useState(false);

    const [dateFilter, setDateFilter] = useState("This Week");
    const [sortBy, setSortBy] = useState("date");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerMode, setDatePickerMode] = useState<"start" | "end">("start");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    // Filter expenses based on date filter
    const getFilteredExpenses = () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        return expenses.filter((expense) => {
            const expenseDate = new Date(expense.date);
            expenseDate.setHours(0, 0, 0, 0);
            
            if (dateFilter === "This Week") {
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                return expenseDate >= weekAgo && expenseDate <= today;
            }
            
            if (dateFilter === "This Month") {
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                return expenseDate >= monthStart && expenseDate <= today;
            }
            
            if (dateFilter === "Range") {
                if (!startDate || !endDate) return false;
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                return expenseDate >= start && expenseDate <= end;
            }
            
            return true;
        });
    };

    const filteredExpenses = getFilteredExpenses();

    const sortedExpenses = [...filteredExpenses].sort((a, b) => {
        if (sortBy === "price") {
            return sortDirection === "asc" ? a.amount - b.amount : b.amount - a.amount;
        }

        if (sortBy === "date") {
            return sortDirection === "asc"
                ? new Date(a.date).getTime() - new Date(b.date).getTime()
                : new Date(b.date).getTime() - new Date(a.date).getTime();
        }

        if (sortBy === "category") {
            return sortDirection === "asc" 
                ? a.category.localeCompare(b.category)
                : b.category.localeCompare(a.category);
        }

        if (sortBy === "type") {
            return sortDirection === "asc" 
                ? a.type.localeCompare(b.type)
                : b.type.localeCompare(a.type);
        }

        if (sortBy === "payment") {
            const aPayment = a.payment || "";
            const bPayment = b.payment || "";
            return sortDirection === "asc" 
                ? aPayment.localeCompare(bPayment)
                : bPayment.localeCompare(aPayment);
        }

        return 0;
    });

    const handleDateFilterPress = (filter: string) => {
        if (filter === "Range") {
            setDateFilter("Range");
            setDatePickerMode("start");
            setTempDate(startDate || new Date());
            setShowDatePicker(true);
        } else {
            setDateFilter(filter);
            setStartDate(null);
            setEndDate(null);
        }
    };

    const [tempDate, setTempDate] = useState<Date>(new Date());

    const handleDatePickerChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === "android") {
            setShowDatePicker(false);
            if (event.type === "set" && selectedDate) {
                if (datePickerMode === "start") {
                    setStartDate(selectedDate);
                    setDatePickerMode("end");
                    setShowDatePicker(true);
                } else {
                    setEndDate(selectedDate);
                }
            } else if (event.type === "dismissed") {
                if (datePickerMode === "end" && !startDate) {
                    setDateFilter("This Week");
                    setStartDate(null);
                    setEndDate(null);
                }
            }
        } else {
            // iOS - update temp date as user scrolls
            if (selectedDate) {
                setTempDate(selectedDate);
            }
        }
    };

    const handleIOSConfirm = () => {
        if (datePickerMode === "start") {
            setStartDate(tempDate);
            setDatePickerMode("end");
            setTempDate(endDate || tempDate);
        } else {
            setEndDate(tempDate);
            setShowDatePicker(false);
        }
    };

    const handleIOSCancel = () => {
        setShowDatePicker(false);
        if (datePickerMode === "end" && !startDate) {
            setDateFilter("This Week");
            setStartDate(null);
            setEndDate(null);
        }
        setTempDate(datePickerMode === "start" ? (startDate || new Date()) : (endDate || startDate || new Date()));
    };

    const renderFilterBar = () => (
        <View style={styles.filterBar}>
            {DATE_FILTERS.map((filter) => (
                <TouchableOpacity
                    key={filter}
                    style={[
                        styles.filterBtn,
                        dateFilter === filter && { backgroundColor: PRIMARY + "20" },
                    ]}
                    onPress={() => handleDateFilterPress(filter)}
                >
                    <Text style={styles.filterText}>
                        {filter}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderSortBar = () => (
        <View style={styles.sortBar}>
            {SORT_OPTIONS.map((opt) => (
                <TouchableOpacity
                    key={opt}
                    style={[
                        styles.sortBtn,
                        sortBy === opt && { backgroundColor: PRIMARY + "20" },
                    ]}
                    onPress={() => {
                        if (sortBy === opt) {
                            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                        } else {
                            setSortBy(opt);
                            setSortDirection("asc");
                        }
                    }}
                >
                    <Text style={styles.sortText}>
                        {opt.toUpperCase()} {sortBy === opt ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const getCategoryEmoji = (category: string): string => {
        return CATEGORY_EMOJIS[category] || CATEGORY_EMOJIS["Other"];
    };

    const renderItem = (item: any) => (
        <View key={item.id} style={styles.card}>
            <View style={styles.cardContainer}>
                <View style={styles.details1}>
                    <Text style={styles.category}>
                        {getCategoryEmoji(item.category)} {item.category}
                    </Text>
                    <Text style={styles.details2}>
                    {item.payment} • {item.type} • {item.date}
                    </Text>
                    {item.note ? (
                    <Text style={styles.note}>Note: {item.note}</Text>
                    ) : null}
                </View>
                <Text style={styles.price}>{item.amount} $</Text>
            </View>
            



        </View>
    );

    return (
        <View style={styles.container}>
            <Header onMenuPress={() => setMenuOpen(true)} />
            
            {renderFilterBar()}
            {renderSortBar()}

            <ScrollView style={{ paddingHorizontal: 20 }}>
                {sortedExpenses.map((item) => renderItem(item))}
            </ScrollView>
            
            {showDatePicker && Platform.OS === "ios" && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={showDatePicker}
                    onRequestClose={handleIOSCancel}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>
                                {datePickerMode === "start" ? "Select Start Date" : "Select End Date"}
                            </Text>
                            <View style={styles.pickerContainer}>
                                <DateTimePicker
                                    value={tempDate}
                                    mode="date"
                                    display="spinner"
                                    onChange={handleDatePickerChange}
                                    maximumDate={new Date()}
                                    minimumDate={datePickerMode === "end" && startDate ? startDate : undefined}
                                />
                            </View>
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={handleIOSCancel}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.confirmButton]}
                                    onPress={handleIOSConfirm}
                                >
                                    <Text style={styles.confirmButtonText}>
                                        {datePickerMode === "start" ? "Next" : "Done"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}

            {showDatePicker && Platform.OS === "android" && (
                <DateTimePicker
                    value={datePickerMode === "start" 
                        ? (startDate || new Date())
                        : (endDate || startDate || new Date())}
                    mode="date"
                    display="default"
                    onChange={handleDatePickerChange}
                    maximumDate={new Date()}
                    minimumDate={datePickerMode === "end" && startDate ? startDate : undefined}
                />
            )}
            
            <SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: LIGHT_BG,
    },

    filterBar: {
        flexDirection: "row",
        padding: 10,
        justifyContent: "space-around",
    },

    filterBtn: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 12,
    },

    filterText: {
        fontSize: 15,
        color: PRIMARY,
        fontWeight: "600",
    },

    sortBar: {
        flexDirection: "row",
        padding: 10,
        justifyContent: "space-around",
        // backgroundColor: "white",
        // borderBottomWidth: 1.5,
        // borderBottomColor: PRIMARY,
    },

    sortBtn: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 12,
    },

    sortText: {
        fontSize: 13,
        color: PRIMARY,
        fontWeight: "600",
    },

    card: {
        backgroundColor: "white",
        padding: 15,
        borderRadius: 15,
        marginBottom: 15,

        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },

    cardContainer:{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    details1: {
        flexDirection: "column",
        justifyContent: "space-between",
    },

    category: {
        fontSize: 16,
        fontWeight: "600",
        color: PRIMARY,
    },

    price: {
        fontSize: 18,
        fontWeight: "700",
        marginTop: 4,
    },

    details2: {
        marginTop: 4,
        color: "#555",
    },

    note: {
        marginTop: 6,
        color: "#666",
        fontStyle: "italic",
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
        padding: 20,
        paddingBottom: 40,
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: PRIMARY,
        marginBottom: 20,
        textAlign: "center",
    },

    pickerContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 10,
    },

    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },

    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
    },

    cancelButton: {
        backgroundColor: "#f0f0f0",
        marginRight: 10,
    },

    confirmButton: {
        backgroundColor: PRIMARY,
        marginLeft: 10,
    },

    cancelButtonText: {
        color: "#666",
        fontWeight: "600",
    },

    confirmButtonText: {
        color: "white",
        fontWeight: "600",
    },
});
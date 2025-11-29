import Header from "@/components/Header";
import SideMenu from "@/components/SideMenu";
import { useExpenses } from "@/contexts/ExpensesContext";
import { db } from "@/firebase";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams } from "expo-router";

import { scaleFont, scaleSize } from "@/utils/scale";
import {
    collection,
    doc,
    getDoc,
    getDocs
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";



const PRIMARY = "#390492";
const LIGHT_BG = "#efe7ff";

const DATE_FILTERS = ["This Week", "This Month", "Range"];
const TYPE_FILTERS = ["total", "waste", "worth it"];
const SORT_OPTIONS = ["date", "price", "category", "payment"];

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

function parseDateString(dateString: string): Date {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const parts = dateString.trim().split(" ");
    if (parts.length !== 2) return new Date();
  
    const monthIndex = monthNames.indexOf(parts[0]);
    const day = parseInt(parts[1]);
    if (monthIndex === -1 || isNaN(day)) return new Date();
  
    const currentYear = new Date().getFullYear();
    return new Date(currentYear, monthIndex, day);
  }

export default function HistoryPage() {

    const { phone } = useLocalSearchParams();

    const [menuOpen, setMenuOpen] = useState(false);

    const [user, setUser] = useState<any>(null);

    const { expenses, setExpenses, graphsData } = useExpenses();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    const [dateFilter, setDateFilter] = useState("This Week");
    const [typeFilter, setTypeFilter] = useState("total");
    const [sortBy, setSortBy] = useState("date");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerMode, setDatePickerMode] = useState<"start" | "end">("start");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    const loadExpenses = async (phoneString: string) => {
        try {
          const expensesRef = collection(db, "users", phoneString, "expenses");
          const expSnap = await getDocs(expensesRef);
          const expList = expSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
    
          setExpenses(expList);
        
          return expList;

        } catch (error) {
          console.error("Error loading expenses:", error);
          throw error;
        }
    };

    useEffect(() => {
        if (!phone) return;
    
        async function loadData() {
          setLoading(true);
          try {
            const userRef = doc(db, "users", phone as string);
            const snap = await getDoc(userRef);
    
            if (!snap.exists()) {
              setError("User not found");
              setLoading(false);
              return;
            }
    
            setUser(snap.data());
            await loadExpenses(phone as string);
            setLoading(false);
          } catch {
            setError("Failed to load data");
            setLoading(false);
          }
        }
    
        loadData();
    }, [phone]);

    const getFilteredExpenses = () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        return expenses.filter((expense) => {
            const expenseDate = parseDateString(expense.date);
            expenseDate.setHours(0, 0, 0, 0);
            
            let dateMatch = false;
            if (dateFilter === "This Week") {
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                dateMatch = expenseDate >= weekAgo && expenseDate <= today;
            } else if (dateFilter === "This Month") {
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                dateMatch = expenseDate >= monthStart && expenseDate <= today;
            } else if (dateFilter === "Range") {
                if (!startDate || !endDate) return false;
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                dateMatch = expenseDate >= start && expenseDate <= end;
            } else {
                dateMatch = true;
            }
            
            let typeMatch = false;
            if (typeFilter === "total") {
                typeMatch = true; // Show all
            } else {
                const expenseType = (expense.type || "").toLowerCase().trim();
                if (typeFilter === "waste") {
                    typeMatch = expenseType === "waste";
                } else if (typeFilter === "worth") {
                    typeMatch = expenseType === "worth";
                } else {
                    typeMatch = true;
                }
            }
            
            return dateMatch && typeMatch;
        });
    };

    const filteredExpenses = getFilteredExpenses();

    const sortedExpenses = [...filteredExpenses].sort((a, b) => {
        if (sortBy === "price") {
            return sortDirection === "asc" ? a.amount - b.amount : b.amount - a.amount;
        }

        if (sortBy === "date") {
            return sortDirection === "asc"
                ? parseDateString(a.date).getTime() - parseDateString(b.date).getTime()
                : parseDateString(b.date).getTime() - parseDateString(a.date).getTime();
        }
        

        if (sortBy === "category") {
            return sortDirection === "asc" 
                ? a.category.localeCompare(b.category)
                : b.category.localeCompare(a.category);
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

    const renderTypeFilterBar = () => (
        <View style={styles.filterBar}>
            {TYPE_FILTERS.map((filter) => (
                <TouchableOpacity
                    key={filter}
                    style={[
                        styles.filterBtn,
                        typeFilter === filter && { backgroundColor: PRIMARY + "20" },
                    ]}
                    onPress={() => setTypeFilter(filter)}
                >
                    <Text style={styles.filterText}>
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
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
                    
                    {item.type && item.type.trim() !== "" ? (
                    <Text style={styles.details2}>
                        {item.payment} • {item.type} • {item.date}
                    </Text>
                    ) : (
                    <Text style={styles.details2}>
                        {item.payment} • {item.date}
                    </Text>
                    )}

                    {item.notes ? (
                    <Text style={styles.note}>Note: {item.notes}</Text>
                    ) : null}
                </View>
                <Text style={styles.price}>{item.amount} $</Text>
            </View>
            



        </View>
    );

    if (loading) {
        return (
          <View style={styles.mainContainer}>
            <Text style={{ color: PRIMARY }}>Loading...</Text>
          </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header onMenuPress={() => setMenuOpen(true)} />
            
            {renderFilterBar()}
            {renderTypeFilterBar()}
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
            
            <SideMenu 
                visible={menuOpen} 
                onClose={() => setMenuOpen(false)} 
                phone={phone as string}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: LIGHT_BG,
    },

    mainContainer: {
        marginTop: 10,
        flexDirection: "column",
        alignItems: "center",
      },

    filterBar: {
        flexDirection: "row",
        padding: scaleSize(10),
        justifyContent: "space-around",
    },

    filterBtn: {
        paddingVertical: scaleSize(6),
        paddingHorizontal: scaleSize(10),
        borderRadius: scaleSize(12),
    },

    filterText: {
        fontSize: scaleFont(15),
        color: PRIMARY,
        fontWeight: "600",
    },

    sortBar: {
        flexDirection: "row",
        padding: scaleSize(10),
        justifyContent: "space-around",
    },

    sortBtn: {
        paddingVertical: scaleSize(6),
        paddingHorizontal: scaleSize(10),
        borderRadius: scaleSize(12),
    },

    sortText: {
        fontSize: scaleFont(13),
        color: PRIMARY,
        fontWeight: "600",
    },

    card: {
        backgroundColor: "white",
        padding: scaleSize(15),
        borderRadius: scaleSize(15),
        marginBottom: scaleSize(15),

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
        flex: 1,
        marginRight: scaleSize(10),
    },

    category: {
        fontSize: scaleFont(16),
        fontWeight: "600",
        color: PRIMARY,
    },

    price: {
        fontSize: scaleFont(18),
        fontWeight: "700",
        marginTop: 4,
    },

    details2: {
        marginTop: 4,
        color: "#555",
    },

    note: {
        marginTop: scaleSize(6),
        color: "#666",
        fontStyle: "italic",
        flexShrink: 1,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },

    modalContent: {
        backgroundColor: "white",
        borderTopLeftRadius: scaleSize(20),
        borderTopRightRadius: scaleSize(20),
        padding: scaleSize(20),
        paddingBottom: scaleSize(40),
    },

    modalTitle: {
        fontSize: scaleFont(18),
        fontWeight: "600",
        color: PRIMARY,
        marginBottom: 20,
        textAlign: "center",
    },

    pickerContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginVertical: scaleSize(10),
    },

    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },

    modalButton: {
        flex: 1,
        paddingVertical: scaleSize(12),
        borderRadius: scaleSize(12),
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
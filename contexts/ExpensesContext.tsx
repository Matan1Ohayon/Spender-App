import { buildGraphsData, GraphsData } from "@/logic/buildGraphsData";
import {
    createContext,
    ReactNode,
    useContext,
    useMemo,
    useState,
} from "react";

type Expense = any;

interface ExpensesContextValue {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  graphsData: GraphsData;
}

const ExpensesContext = createContext<ExpensesContextValue | undefined>(
  undefined
);

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const graphsData = useMemo(() => buildGraphsData(expenses), [expenses]);

  return (
    <ExpensesContext.Provider value={{ expenses, setExpenses, graphsData }}>
      {children}
    </ExpensesContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpensesContext);
  if (!context) {
    throw new Error("useExpenses must be used within ExpensesProvider");
  }
  return context;
}


import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet } from "react-native";
import { getAllDebtors } from "../../src/services/debtors";
import { parseISO, differenceInCalendarDays, format } from "date-fns";
import { useRouter } from "expo-router";
import { theme } from "../../src/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DebtorsList() {
  const [debtors, setDebtors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const data = await getAllDebtors();
    setDebtors(data);
    setLoading(false);
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load().then(() => setRefreshing(false));
  }, []);

  function dueStatus(due_date: string) {
    const diff = differenceInCalendarDays(parseISO(due_date), new Date());

    if (diff === 0) return { label: "Due Today", color: theme.colors.primary };
    if (diff === 1) return { label: "Due Tomorrow", color: theme.colors.primaryLight };
    if (diff > 1) return { label: `In ${diff} days`, color: theme.colors.gray };
    return { label: `Overdue ${Math.abs(diff)} days`, color: theme.colors.danger };
  }

  const renderItem = ({ item }: { item: any }) => {
  const isOpen = expanded === item.id;

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => setExpanded(isOpen ? null : item.id)}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.subtitle}>
          {item.loans_count} active loan{item.loans_count > 1 ? "s" : ""}
        </Text>
        <Text style={styles.balance}>₱{item.total_balance.toLocaleString()}</Text>
        <Text style={styles.date}>Next due: {format(parseISO(item.earliest_due), "MMM d, yyyy")}</Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={{ marginTop: 12 }}>
          {item.loans.map((loan: any) => (
            <TouchableOpacity
              key={loan.loan_id}
              style={styles.loanCard}
              onPress={() => router.push(`/debtor/${item.id}/loan/${loan.loan_id}`)}
            >
              <Text style={styles.loanTitle}>Loan #{loan.loan_id}</Text>
              <Text>Remaining: ₱{loan.remaining.toLocaleString()}</Text>
              <Text>Due: {format(parseISO(loan.next_due), "MMM d, yyyy")}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};


  return (
    <SafeAreaView style={styles.container}>
        <Text style={styles.header}>DPE Debtors</Text>


        <FlatList
          data={debtors}
          keyExtractor={(i) => i.id.toString()}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={() =>
            !loading ? (
              <View style={{ padding: 20 }}>
                <Text style={{ textAlign: "center", color: theme.colors.gray }}>
                  No debtors found.
                </Text>
              </View>
            ) : null
          }
        />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  header: { fontSize: 28, fontWeight: "800", marginBottom: 10},
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  name: { fontSize: 18, fontWeight: "700" },
  dueStatus: { fontSize: 13, marginTop: 4 },
  balance: { fontSize: 16, fontWeight: "700", marginTop: 10 },
  date: { color: theme.colors.gray, marginTop: 4 },
  loanCard: {
  backgroundColor: "#f8f8f8",
  padding: 12,
  borderRadius: 10,
  marginBottom: 8,
},

loanTitle: {
  fontWeight: "600",
  fontSize: 16,
  marginBottom: 4,
},

subtitle: {
  color: "#666",
  marginTop: 4,
},

});

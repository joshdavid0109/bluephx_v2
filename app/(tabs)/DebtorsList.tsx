import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet } from "react-native";
import { getAllDebtors } from "../../src/services/debtors";
import { parseISO, differenceInCalendarDays, format } from "date-fns";
import { useRouter } from "expo-router";
import { theme } from "../../src/constants/theme";

export default function DebtorsList() {
  const [debtors, setDebtors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
    const due = dueStatus(item.next_due);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/debtor/${item.id}`)}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={[styles.dueStatus, { color: due.color }]}>{due.label}</Text>
          <Text style={styles.balance}>
            ₱{Number(item.balance ?? 0).toLocaleString()}
              </Text>
          <Text style={styles.date}>
            {item.next_due
              ? "Next due: " + format(parseISO(item.next_due), "MMM d, yyyy")
              : "No remaining dues"}
          </Text>

        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 28, fontWeight: "800", marginBottom: 10 , paddingTop: 4,},
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
});

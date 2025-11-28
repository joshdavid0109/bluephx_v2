// src/components/PaymentModal.tsx
import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { theme } from "../constants/theme";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (amount: number, note?: string) => Promise<void> | void;
  defaultAmount?: number;
  maxAmount?: number | null;
  debtorName?: string;
};

export default function PaymentModal({
  visible,
  onClose,
  onSubmit,
  defaultAmount = 0,
  maxAmount = null,
  debtorName,
}: Props) {
  const [amountTxt, setAmountTxt] = useState(String(defaultAmount ?? ""));
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setAmountTxt(String(defaultAmount ?? ""));
      setNote("");
    }
  }, [visible, defaultAmount]);

  function parseAmount(txt: string) {
    const parsed = parseFloat(txt.replace(/[^0-9.]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  async function handleSubmit() {
    const amount = parseAmount(amountTxt);
    if (!amount || amount <= 0) {
      return Alert.alert("Validation", "Enter a valid amount.");
    }
    if (maxAmount != null && amount > maxAmount) {
      // ask confirmation via Alert
      return Alert.alert(
        "Confirm overpayment",
        `Amount is greater than remaining balance (₱${maxAmount}). Continue?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Continue",
            onPress: async () => proceedSubmit(amount),
            style: "destructive",
          },
        ]
      );
    }
    await proceedSubmit(amount);
  }

  async function proceedSubmit(amount: number) {
    try {
      setLoading(true);
      await onSubmit(amount, note);
      onClose();
    } catch (e: any) {
      Alert.alert("Failed", e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Record Payment {debtorName ? `— ${debtorName}` : ""}</Text>

          <Text style={styles.label}>Amount (₱)</Text>
          <TextInput
            keyboardType="numeric"
            value={amountTxt}
            onChangeText={setAmountTxt}
            placeholder="0.00"
            style={styles.input}
            returnKeyType="done"
          />

          <Text style={styles.label}>Note (optional)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="e.g. morning installment"
            style={[styles.input, { height: 80 }]}
            multiline
          />

          <View style={styles.row}>
            <TouchableOpacity onPress={onClose} disabled={loading} style={[styles.btn, styles.cancel]}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSubmit} disabled={loading} style={[styles.btn, styles.save]}>
              <Text style={styles.saveText}>{loading ? "Saving..." : "Save payment"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.35)" },
  container: {
    backgroundColor: theme ? theme.colors.white : "#fff",
    padding: 18,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  label: { fontSize: 13, color: "#6B7280", marginTop: 8, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, minWidth: 120, alignItems: "center" },
  cancel: { backgroundColor: "#F3F4F6" },
  save: { backgroundColor: "#4F46E5" },
  cancelText: { color: "#111827" },
  saveText: { color: "#fff", fontWeight: "700" },
});

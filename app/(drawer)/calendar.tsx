import { useSideNav } from "@/context/SideNavContext";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/* ---------- DATE HELPERS ---------- */

const getMonthName = (date: Date) =>
  date.toLocaleString("default", { month: "long" });

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

const getFirstDayOfMonth = (year: number, month: number) =>
  new Date(year, month, 1).getDay();

/* ---------- SCREEN ---------- */

export default function CalendarScreen() {
  const { open } = useSideNav();
  const router = useRouter();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"LOG" | "STATS" | "ANALYSIS">("LOG");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days = useMemo(() => {
    const empty = Array(firstDay).fill(null);
    const filled = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return [...empty, ...filled];
  }, [month, year]);

  const goPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const goNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  return (
    <SafeAreaView style={styles.root}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={open}>
          <Feather name="menu" size={26} color="#63B3ED" />
        </TouchableOpacity>

        {/* RIGHT ICON */}
        <TouchableOpacity>
          <Image
            source={{
              uri: "https://cbjgqanwvblylaubozmj.supabase.co/storage/v1/object/public/logo/bpx_logo.png",
            }}
            style={styles.headerLogo}
          />
        </TouchableOpacity>

      </View>

      <Text style={styles.greeting}>Hello,</Text>
      <Text style={styles.subGreeting}>Hope you are doing well!</Text>

      {/* PANEL */}
      <View style={styles.panel}>
        {/* BACK */}
        <TouchableOpacity
          style={styles.backRow}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color="#04183B" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* MONTH HEADER */}
        <View style={styles.monthRow}>
          <TouchableOpacity onPress={goPrevMonth}>
            <Feather name="chevron-left" size={22} color="#04183B" />
          </TouchableOpacity>

          <Text style={styles.monthText}>
            {getMonthName(currentDate)} {year}
          </Text>

          <TouchableOpacity onPress={goNextMonth}>
            <Feather name="chevron-right" size={22} color="#04183B" />
          </TouchableOpacity>
        </View>

        {/* WEEKDAYS */}
        <View style={styles.weekRow}>
          {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
            <Text key={d} style={styles.weekDay}>
              {d}
            </Text>
          ))}
        </View>

        {/* DAYS GRID */}
        <View style={styles.daysGrid}>
          {days.map((day, idx) =>
            day ? (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.day,
                  isToday(day) && styles.today,
                  selectedDate === day && styles.selected,
                ]}
                onPress={() => setSelectedDate(day)}
              >
                <Text
                  style={[
                    styles.dayText,
                    (isToday(day) || selectedDate === day) && {
                      color: "#FFF",
                      fontWeight: "700",
                    },
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ) : (
              <View key={idx} style={styles.dayEmpty} />
            )
          )}
        </View>

        {/* TABS */}
        <View style={styles.tabs}>
          {["LOG", "STATS", "ANALYSIS"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab as any)}
            >
              <Text
                style={[
                  styles.tab,
                  activeTab === tab && styles.tabActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerLink}>
            🌐 www.bluephoenixreview.com
          </Text>
          <Text style={styles.footerLink}>
            📘 Blue Phoenix Illustrated Reviewers
          </Text>
        </View>
      </View>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          if (!selectedDate) return;
          console.log("Add log for:", selectedDate);
        }}
      >
        <Feather name="plus" size={24} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#04183B" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  headerLogo: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },

  greeting: {
    marginTop: 16,
    marginLeft: 16,
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: "#FFF",
  },

  subGreeting: {
    marginLeft: 16,
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: "#63B3ED",
  },

  panel: {
    flex: 1,
    marginTop: 18,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
  },

  backRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#04183B",
  },

  monthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 24,
  },

  monthText: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: "#04183B",
  },

  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  weekDay: {
    width: "14.28%",
    textAlign: "center",
    fontSize: 12,
    color: "#64748B",
    fontFamily: "Poppins_600SemiBold",
  },

  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },

  day: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 999,
  },

  dayEmpty: { width: "14.28%", aspectRatio: 1 },

  dayText: {
    fontSize: 14,
    color: "#04183B",
    fontFamily: "Poppins_400Regular",
  },

  today: { backgroundColor: "#63B3ED" },
  selected: { backgroundColor: "#04183B" },

  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#1E293B",
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 16,
  },

  tab: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#94A3B8",
  },

  tabActive: { color: "#63B3ED" },

  footer: { alignItems: "center" },

  footerLink: {
    fontSize: 12,
    color: "#5FAED8",
    fontFamily: "Poppins_400Regular",
    marginVertical: 2,
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#04183B",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
});

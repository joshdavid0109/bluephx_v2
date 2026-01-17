import NotificationBell from "@/components/NotificationBell";
import { useSideNav } from "@/context/SideNavContext";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scheduleReminderNotification } from "../../lib/reminderNotification";


/* ---------- DATE HELPERS ---------- */

const getMonthName = (date: Date) =>
  date.toLocaleString("default", { month: "long" });

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

const getFirstDayOfMonth = (year: number, month: number) =>
  new Date(year, month, 1).getDay();

type CalendarEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description?: string;
  time?: string; // HH:MM
  type: "EVENT" | "REMINDER";
};



/* ---------- SCREEN ---------- */

export default function CalendarScreen() {
  const { open } = useSideNav();
  const router = useRouter();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"LOG" | "STATS" | "ANALYSIS">("LOG");

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [newEventType, setNewEventType] = useState<"EVENT" | "REMINDER">("EVENT");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventTime, setEventTime] = useState("");


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

  const selectedDateString = selectedDate
    ? `${year}-${String(month + 1).padStart(2, "0")}-${String(
        selectedDate
      ).padStart(2, "0")}`
    : null;
  const eventsForSelectedDate = selectedDateString
    ? events.filter((e) => e.date === selectedDateString)
    : []; 


   const addEvent = async () => {
  if (!selectedDateString || !eventTitle.trim()) return;

  const newEvent: CalendarEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    date: selectedDateString,
    title: eventTitle.trim(),
    description: eventDescription || undefined,
    time: eventTime || undefined,
    type: newEventType,
  };

  setEvents((prev) => [...prev, newEvent]);

  // 🔔 Schedule reminder notification
  if (
    newEvent.type === "REMINDER" &&
    eventTime &&
    selectedDate
  ) {
    const notifyAt = buildNotificationDate(
      year,
      month,
      selectedDate,
      eventTime
    );

    // Prevent scheduling past notifications
    if (notifyAt > new Date()) {
      await scheduleReminderNotification(
        "Reminder",
        newEvent.title,
        notifyAt
      );
    }
  }

  // Reset modal
  setEventTitle("");
  setEventDescription("");
  setEventTime("");
  setNewEventType("EVENT");
  setEventModalOpen(false);
};


  function buildNotificationDate(
  year: number,
  month: number,
  day: number,
  time: string
) {
  const [hours, minutes] = time.split(":").map(Number);

  return new Date(
    year,
    month,
    day,
    hours,
    minutes,
    0
  );
}



  return (
    <SafeAreaView style={styles.root}  edges={["top"]}>
      {/* HEADER */}
           <View style={styles.header}>
             {/* LEFT */}
             <TouchableOpacity onPress={() => open()}>
               <Feather name="menu" size={26} color="#63B3ED" />
             </TouchableOpacity>
     
             {/* RIGHT GROUP */}
             <View style={styles.headerRight}>
               <NotificationBell />
     
               <Image
                 source={{
                   uri: "https://cbjgqanwvblylaubozmj.supabase.co/storage/v1/object/public/logo/bpx_logo.png",
                 }}
                 style={styles.headerLogo}
               />
             </View>
           </View>


      <Text style={styles.greeting}>Hello,</Text>
      <Text style={styles.subGreeting}>Hope you are doing well!</Text>

      {/* PANEL */}
      <View style={styles.panel}>
         <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
          >
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
          {["S", "M", "T", "W", "T", "F", "S"].map((d, idx) => (
            <Text key={idx} style={styles.weekDay}>
              {d}
            </Text>
          ))}
        </View>

        {/* DAYS GRID */}
        <View style={styles.daysGrid}>
          {days.map((day, idx) => {
            if (!day) {
              return <View key={`empty-${idx}`} style={styles.dayEmpty} />;
            }

            const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(
              day
            ).padStart(2, "0")}`;

            const hasEvent = events.some((e) => e.date === dateKey);

            return (
              <TouchableOpacity
                key={dateKey}
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

                {/* 🔴 EVENT INDICATOR */}
                {hasEvent && <View style={styles.eventDot} />}
              </TouchableOpacity>
            );
          })}
        </View>
        {/* EVENTS LIST */}
        {selectedDateString && (
          <View style={styles.eventsSection}>
            <Text style={styles.eventsTitle}>
              Events on {selectedDateString}
            </Text>

            {eventsForSelectedDate.length === 0 ? (
              <Text style={styles.noEventsText}>
                No events or reminders for this day.
              </Text>
            ) : (
              eventsForSelectedDate.map((event) => (
                <View key={event.id} style={styles.eventCard}>
                  <View style={styles.eventHeader}>
                    <Text
                      style={[
                        styles.eventType,
                        event.type === "REMINDER"
                          ? styles.reminder
                          : styles.event,
                      ]}
                    >
                      {event.type}
                    </Text>

                    {event.time && (
                      <Text style={styles.eventTime}>
                        ⏰ {event.time}
                      </Text>
                    )}
                  </View>

                  <Text style={styles.eventTitleText}>
                    {event.title}
                  </Text>

                  {event.description && (
                    <Text style={styles.eventDescription}>
                      {event.description}
                    </Text>
                  )}
                </View>
              ))
            )}
          </View>
        )}



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
         <View style={styles.links}>
            <View style={styles.linkRow}>
              <Feather name="globe" size={16} color="#63B3ED" />
              <Text style={styles.linkText}>
                www.bluephoenix.com
              </Text>
            </View>

            <View style={styles.linkRow}>
              <Feather name="facebook" size={16} color="#63B3ED" />
              <Text style={styles.linkText}>
                Blue Phoenix Illustrated Reviewers
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          if (!selectedDate) return;
          setEventModalOpen(true);
        }}
      >
        <Feather name="plus" size={24} color="#FFF" />
      </TouchableOpacity>

      {eventModalOpen && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              Add to {selectedDateString}
            </Text>

            {/* TYPE */}
            <View style={styles.modalTabs}>
              {["EVENT", "REMINDER"].map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setNewEventType(t as any)}
                >
                  <Text
                    style={[
                      styles.modalTab,
                      newEventType === t && styles.modalTabActive,
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* TITLE */}
            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              value={eventTitle}
              onChangeText={setEventTitle}
              placeholder="e.g. Civil Law Exam"
              style={styles.input}
            />

            {/* TIME */}
            <Text style={styles.inputLabel}>Time (optional)</Text>
            <TextInput
              value={eventTime}
              onChangeText={setEventTime}
              placeholder="HH:MM"
              style={styles.input}
            />

            {/* DESCRIPTION */}
            <Text style={styles.inputLabel}>Notes (optional)</Text>
            <TextInput
              value={eventDescription}
              onChangeText={setEventDescription}
              placeholder="Additional details..."
              multiline
              style={[styles.input, { height: 80 }]}
            />

            {/* ACTIONS */}
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setEventModalOpen(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={addEvent}
                style={[
                  styles.modalConfirm,
                  !eventTitle.trim() && { opacity: 0.5 },
                ]}
                disabled={!eventTitle.trim()}
              >
                <Text style={styles.modalConfirmText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#04183B" },

     header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },


  headerLogo: {
    width: 48,
    height: 48,
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
  eventDot: {
  width: 6,
  height: 6,
  borderRadius: 3,
  backgroundColor: "#EF4444",
  position: "absolute",
  bottom: 6,
},

eventsSection: {
  marginTop: 12,
  marginBottom: 16,
},

eventsTitle: {
  fontSize: 14,
  fontFamily: "Poppins_700Bold",
  color: "#04183B",
  marginBottom: 8,
},

noEventsText: {
  fontSize: 12,
  fontFamily: "Poppins_400Regular",
  color: "#64748B",
  fontStyle: "italic",
},

eventCard: {
  backgroundColor: "#F8FAFC",
  borderRadius: 12,
  padding: 12,
  marginBottom: 8,
  borderWidth: 1,
  borderColor: "#E5E7EB",
},

eventHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 4,
},

eventType: {
  fontSize: 11,
  fontFamily: "Poppins_700Bold",
},

event: {
  color: "#0369A1",
},

reminder: {
  color: "#B91C1C",
},

eventTime: {
  fontSize: 11,
  fontFamily: "Poppins_400Regular",
  color: "#475569",
},

eventTitleText: {
  fontSize: 14,
  fontFamily: "Poppins_600SemiBold",
  color: "#04183B",
},

eventDescription: {
  marginTop: 4,
  fontSize: 12,
  fontFamily: "Poppins_400Regular",
  color: "#475569",
},


modalOverlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.4)",
  justifyContent: "center",
  alignItems: "center",
},

modal: {
  width: "80%",
  backgroundColor: "#FFF",
  borderRadius: 16,
  padding: 20,
},

modalTitle: {
  fontSize: 16,
  fontFamily: "Poppins_700Bold",
  marginBottom: 12,
  color: "#04183B",
},

modalTabs: {
  flexDirection: "row",
  justifyContent: "space-around",
  marginBottom: 16,
},

modalTab: {
  fontFamily: "Poppins_600SemiBold",
  color: "#64748B",
},

modalTabActive: {
  color: "#04183B",
},

modalActions: {
  marginTop: 10,
  flexDirection: "row",
  justifyContent: "flex-end",
  verticalAlign: "middle"

},

modalCancel: {
  marginRight: 16,
  color: "#64748B",
  paddingHorizontal: 14,
  paddingVertical: 6,
  borderRadius: 8,
},

modalConfirm: {
  backgroundColor: "#04183B",
  paddingHorizontal: 14,
  paddingVertical: 6,
  borderRadius: 8,
},

modalConfirmText: {
  color: "#FFF",
  fontFamily: "Poppins_700Bold",
},

inputLabel: {
  fontSize: 12,
  fontFamily: "Poppins_600SemiBold",
  color: "#04183B",
  marginBottom: 4,
  marginTop: 8,
},

input: {
  borderWidth: 1,
  borderColor: "#CBD5E1",
  borderRadius: 10,
  padding: 10,
  fontFamily: "Poppins_400Regular",
  fontSize: 13,
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
  links: {
    marginVertical: 20,
    alignItems: "center",
  },

  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },

  linkText: {
    marginLeft: 6,
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#04183B",
  },
});

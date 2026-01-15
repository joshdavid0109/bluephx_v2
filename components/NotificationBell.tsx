import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import styles from "../components/notificationSyles";
import { useNotifications } from "../context/NotificationContext";

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <TouchableOpacity
        style={{ marginRight: 14 }}
        onPress={async () => {
          setOpen((v) => !v);
          await markAllRead();
        }}
      >
        <Feather name="bell" size={22} color="#63B3ED" />

        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {open && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={styles.dropdown}>
            <Text style={styles.title}>Notifications</Text>

            {notifications.length === 0 ? (
              <Text style={styles.empty}>No notifications</Text>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <TouchableOpacity
                  key={n.id}
                  style={styles.item}
                  onPress={() => {
                    setOpen(false);
                    router.push(`/peer-review/${n.post_id}`);
                  }}
                >
                  <Feather name="message-circle" size={16} color="#04183B" />
                  <Text style={styles.text}>New reply on your post</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </TouchableOpacity>
      )}
    </>
  );
}

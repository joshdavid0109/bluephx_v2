import * as Notifications from "expo-notifications";

/**
 * Schedule a reminder notification
 */
export async function scheduleReminderNotification(
  title: string,
  body: string,
  triggerDate: Date
) {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: {
        type: "date",
        date: triggerDate,
        }

  });
}

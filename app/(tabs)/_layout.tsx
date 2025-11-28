import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      
      {/* Main list tab */}
      <Tabs.Screen
        name="index"
        options={{ tabBarStyle: { display: "none" } }} // 👈 hides tab bar

      />

    </Tabs>
  );
}

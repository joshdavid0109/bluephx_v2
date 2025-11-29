import { Slot } from "expo-router";
import { LoadingProvider } from "../src/context/LoadingContext";

export default function RootLayout() {
  return (
    <LoadingProvider>
      <Slot />
    </LoadingProvider>
  );
}

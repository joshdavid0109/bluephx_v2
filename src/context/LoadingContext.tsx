import React, { createContext, useContext, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

const LoadingContext = createContext({
  loading: false,
  setLoading: (v: boolean) => {},
});

export function LoadingProvider({ children }) {
  const [loading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}

      {loading && (
        <View style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.2)",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <ActivityIndicator size="large" color="#0a84ff" />
          <Text style={{ marginTop: 10, color: "#fff" }}>Loading...</Text>
        </View>
      )}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
}

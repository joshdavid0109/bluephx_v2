import React, { createContext, useContext, useState } from "react";

type ScreenSecurityContextType = {
  blocked: boolean;
  setBlocked: (v: boolean) => void;
};

const ScreenSecurityContext =
  createContext<ScreenSecurityContextType | null>(null);

export function ScreenSecurityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [blocked, setBlocked] = useState(false);

  return (
    <ScreenSecurityContext.Provider value={{ blocked, setBlocked }}>
      {children}
    </ScreenSecurityContext.Provider>
  );
}

export function useScreenSecurity() {
  const ctx = useContext(ScreenSecurityContext);
  if (!ctx) {
    throw new Error("useScreenSecurity must be used inside provider");
  }
  return ctx;
}

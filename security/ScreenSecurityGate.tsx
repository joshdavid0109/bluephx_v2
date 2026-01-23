import React from "react";
import { ScreenBlockOverlay } from "./ScreenBlockOverlay";
import { ScreenSecurityProvider } from "./ScreenSecurityContext";
import { useAndroidScreenLock } from "./useAndroidScreenLock";
import { useAppStateBlur } from "./useAppStateBlur";
import { useIOSScreenRecordingDetection } from "./useIOSScreenRecordingDetection";
import { useIOSScreenshotDetection } from "./UseIOSScreenshotDetection";

/**
 * Inner component that is SAFE to use context hooks
 */
function ScreenSecurityEffects({ children }: { children: React.ReactNode }) {
  useAndroidScreenLock();
  useIOSScreenshotDetection();
  useIOSScreenRecordingDetection();
  useAppStateBlur();

  return (
    <>
      {children}
      <ScreenBlockOverlay />
    </>
  );
}

/**
 * Public gate – mounts provider FIRST
 */
export function ScreenSecurityGate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ScreenSecurityProvider>
      <ScreenSecurityEffects>{children}</ScreenSecurityEffects>
    </ScreenSecurityProvider>
  );
}

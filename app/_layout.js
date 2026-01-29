import React from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import CustomTabBar from "../src/components/CustomTabBar";
import { DownloadProvider } from "../src/context/DownloadContext";
import { ToastProvider } from "../src/context/ToastContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <DownloadProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </DownloadProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}

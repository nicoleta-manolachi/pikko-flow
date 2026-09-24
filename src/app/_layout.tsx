import { db } from "@/db/client";
import { seedCategories } from "@/db/queries";
import { useColors } from "@/utils/theme";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import migrations from "../../drizzle/migrations";

export default function RootLayout() {
  const c = useColors();
  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    if (success) seedCategories().catch(() => {});
  }, [success]);

  if (error)
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
        <Text>Database error: {error.message}</Text>
      </View>
    );
  if (!success)
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: c.card },
          headerTintColor: c.text,
          contentStyle: { backgroundColor: c.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="item" options={{ presentation: "modal" }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

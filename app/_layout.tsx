import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="temple" options={{ headerShown: false }} />
      <Stack.Screen name="temple/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="restaurant" options={{ headerShown: false }} />
      <Stack.Screen name="restaurant/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="cafe" options={{ headerShown: false }} />
      <Stack.Screen name="cafe/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="event" options={{ headerShown: false }} />
      <Stack.Screen name="event/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="tourist" options={{ headerShown: false }} />
      <Stack.Screen name="tourist/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}

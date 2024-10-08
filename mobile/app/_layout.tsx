import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import "react-native-reanimated";
import { ThirdwebProvider } from "thirdweb/react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useColorScheme } from "@/hooks/useColorScheme";
import "@react-native-firebase/database";
import { Toasts } from "@backpackapp-io/react-native-toast";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppState } from 'react-native';
import { setOnlineStatus } from "@/lib/api";
import { AuthProvider } from "@/providers/AuthProvider";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  const [loaded, error] = useFonts({
    "WorkSans-Regular": require("@/assets/fonts/WorkSans-Regular.ttf"),
    "WorkSans-Bold": require("@/assets/fonts/WorkSans-Bold.ttf"),
    "WorkSans-SemiBold": require("@/assets/fonts/WorkSans-SemiBold.ttf"),
    "WorkSans-Light": require("@/assets/fonts/WorkSans-Light.ttf"),
    "WorkSans-Thin": require("@/assets/fonts/WorkSans-Thin.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if(appStateVisible === "active") {
      setOnlineStatus(true)
    } else {
      setOnlineStatus(false)
    }
  }, [appStateVisible])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
    <ThirdwebProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <GestureHandlerRootView>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="chat-screen" options={{ headerShown: false }} />
          <Stack.Screen name="call-screen" options={{ headerShown: false }} />
          <Stack.Screen name="phone-number" options={{ headerShown: false }} />
          <Stack.Screen name="sms-verification" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="user-name" options={{ headerShown: false }} />
          <Stack.Screen name="user-info" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <Toasts overrideDarkMode={colorScheme === "dark" ? true : false} />
        </GestureHandlerRootView>
      </ThemeProvider>
    </ThirdwebProvider>
    </AuthProvider>
  );
}

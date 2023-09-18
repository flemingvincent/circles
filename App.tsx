import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useDeviceContext } from "twrnc";

import tw from "@/lib/tailwind";
import { FirebaseProvider } from "@/providers/AuthProvider";
import { AppRoutes } from "@/routes";

SplashScreen.preventAutoHideAsync();

export default function App() {
	useDeviceContext(tw);

	const [loaded, error] = useFonts({
		OpenRunde: require("@/assets/fonts/OpenRunde-Regular.otf"),
		OpenRundeMedium: require("@/assets/fonts/OpenRunde-Medium.otf"),
		OpenRundeSemibold: require("@/assets/fonts/OpenRunde-Semibold.otf"),
		OpenRundeBold: require("@/assets/fonts/OpenRunde-Bold.otf"),
	});

	useEffect(() => {
		if (error) throw error;
	}, [error]);

	useEffect(() => {
		if (loaded) {
			setTimeout(() => {
				SplashScreen.hideAsync();
			}, 1000);
		}
	}, [loaded]);

	if (!loaded) return null;

	return (
		<FirebaseProvider>
			<SafeAreaProvider>
				<StatusBar style="dark" />
				<AppRoutes />
			</SafeAreaProvider>
		</FirebaseProvider>
	);
}

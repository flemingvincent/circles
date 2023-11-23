import {
	NavigationProp,
	useNavigation,
	ParamListBase,
} from "@react-navigation/native";
import { useState, useEffect, useRef } from "react";
import { Text, View, Button, Platform } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/config/supabase";

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
	}),
});

async function sendPushInviteCode(
	expoPushToken: string,
	code: string | undefined,
	navigation: any,
) {
	const message = {
		to: expoPushToken,
		sound: "default",
		title: "Circles",
		body: `You've been invited to a circle, tap to join with code: ${code}`,
		priority: "high",
		data: {
			screen: "Join", 
			invitationCode: code,
		},
	};

	await fetch("https://exp.host/--/api/v2/push/send", {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Accept-encoding": "gzip, deflate",
			"Content-Type": "application/json",
		},
		body: JSON.stringify(message),
	});

	//Clipboard.setStringAsync(code || "");
	navigation.navigate("Join");
}

async function registerForPushNotificationsAsync() {
	let token;

	if (Platform.OS === "android") {
		Notifications.setNotificationChannelAsync("default", {
			name: "default",
			importance: Notifications.AndroidImportance.MAX,
			vibrationPattern: [0, 250, 250, 250],
			lightColor: "#FF231F7C",
		});
	}
	// Check that is it being run on a device, not an emulator
	if (Device.isDevice) {
		const { status: existingStatus } =
			await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;
		if (existingStatus !== "granted") {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}
		if (finalStatus !== "granted") {
			alert("Failed to get push token for push notification!");
			return "";
		}
		token = await Notifications.getExpoPushTokenAsync({
			projectId: Constants?.expoConfig?.extra?.eas.projectId,
		});
		console.log(token);
	} else {
		alert("Must use physical device for Push Notifications");
	}

	return token?.data ?? "";
}

export { sendPushInviteCode, registerForPushNotificationsAsync };

export default function Push({ session }: { session: Session }) {
	const [expoPushToken, setExpoPushToken] = useState("");
	const [notification, setNotification] =
		useState<Notifications.Notification>();
	const notificationListener = useRef<Notifications.Subscription>();
	const responseListener = useRef<Notifications.Subscription>();

// 	const navigation = useNavigation();

// 	useEffect(() => {
// 		registerForPushNotificationsAsync().then(async (token) => {
// 			setExpoPushToken(token);
// 			// Upserts the expo push token for the user
// 			const { error } = await supabase
// 				.from("profiles")
// 				.upsert({ id: session?.user.id, expo_push_token: token });
// 			console.log(error);
// 		});

// 		notificationListener.current =
// 			Notifications.addNotificationReceivedListener((notification) => {
// 				setNotification(notification);
// 			});

// 		responseListener.current =
// 			Notifications.addNotificationResponseReceivedListener((response) => {
// 				const screenName = response.notification.request.content.data.screen;

// 				navigation.navigate("screenName");

// 				console.log(response);
// 			});

// 		return () => {
// 			Notifications.removeNotificationSubscription(
// 				notificationListener.current!,
// 			);
// 			Notifications.removeNotificationSubscription(responseListener.current!);
// 		};
// 	}, []);
// }
}
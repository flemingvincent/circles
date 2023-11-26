import Clipboard from "expo-clipboard";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
	handleNotification: async (notification) => {
		const invitationCode = notification.request.content.data?.invitationCode;

		// Copy the invitation code to the clipboard
		await Clipboard.setStringAsync(invitationCode || "");

		return {
			shouldShowAlert: true,
			shouldPlaySound: true,
			shouldSetBadge: false,
		};
	},
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

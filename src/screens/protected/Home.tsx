import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/hooks/useAuth";
import tw from "@/lib/tailwind";
import { useProfileStore } from "@/stores/profileStore";

export default function Home() {
	const { logout } = useAuth();
	const { profile } = useProfileStore();

	return (
		<SafeAreaView style={tw`flex-1 items-center justify-center bg-white`}>
			<Text>Hello, @{profile?.username}</Text>
			<Text>
				This is coming from the profile store, and is not fetching from firebase
				everytime
			</Text>
			<Text onPress={logout}>Logout</Text>
		</SafeAreaView>
	);
}

import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/hooks/useAuth";
import tw from "@/lib/tailwind";

export default function Home() {
	const { logout } = useAuth();

	return (
		<SafeAreaView style={tw`flex-1 items-center justify-center bg-white`}>
			<Text onPress={logout}>Logout</Text>
		</SafeAreaView>
	);
}

import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import tw from "@/lib/tailwind";

export default function Home() {
	return (
		<SafeAreaView style={tw`flex-1 items-center justify-center bg-white`}>
			<Text>Home</Text>
		</SafeAreaView>
	);
}

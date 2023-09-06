import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import tw from "@/lib/tailwind";
import { PublicStackParamList } from "@/routes/public";

type WelcomeProps = NativeStackScreenProps<PublicStackParamList, "Welcome">;

export default function Welcome({ navigation }: WelcomeProps) {
	return (
		<SafeAreaView style={tw`flex-1 items-center justify-center bg-white`}>
			<Text>Welcome from development branch</Text>
			<Button
				title="Login"
				onPress={() => {
					navigation.navigate("Login");
				}}
			/>
		</SafeAreaView>
	);
}

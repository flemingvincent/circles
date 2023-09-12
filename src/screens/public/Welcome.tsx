import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Text } from "@/components/ui";
import tw from "@/lib/tailwind";
import { PublicStackParamList } from "@/routes/public";

type WelcomeProps = NativeStackScreenProps<PublicStackParamList, "Welcome">;

export function Welcome({ navigation }: WelcomeProps) {
	return (
		<SafeAreaView
			style={tw`flex-1 items-center justify-end bg-white py-4 px-12`}
		>
			<Text style={tw`text-center mb-4`} variant="title2" weight="semibold">
				Welcome to Circles
			</Text>
			<Text style={tw`text-content-secondary text-center mb-6`}>
				Stay in the loop with your closest friends and family.
			</Text>
			<Button variant="primary" label="Create Account" style={tw`mb-4`} />
			<Button
				variant="outline"
				label="Login"
				style={tw`mb-6`}
				onPress={() => {
					navigation.navigate("Login");
				}}
			/>
			<Text style={tw`text-center text-content-tertiary`} variant="caption1">
				By using Circle, you agree to accept our{" "}
				<Text
					style={tw`text-content-quaternary`}
					variant="caption1"
					weight="semibold"
				>
					Terms of Service
				</Text>{" "}
				and{" "}
				<Text
					style={tw`text-content-quaternary`}
					variant="caption1"
					weight="semibold"
				>
					Privacy Policy
				</Text>
				.
			</Text>
		</SafeAreaView>
	);
}
